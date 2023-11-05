const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('express-async-handler');
const factory = require('./handlerFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get cart depend on cartId
    const cart = await Cart.findById( req.params.cartId );
    if (!cart) {
        return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404));
    }
    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
    // 3) Create order with default paymentMethodType cash
    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        totalOrderPrice,
        address: req.body.shippingAddress,
    });
    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
        const bulkOpts =  cart.cartItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        }));
        await Product.bulkWrite(bulkOpts, {})

        // 5) Clear cart depend on cartId
        await Cart.findByIdAndDelete(req.params.cartId)
    } else {
        return next(new ApiError(`check order again`, 404));
    }

    res.status(201).json({ status: 'success', data: order });
})

// Filtration Orders By Logged User
exports.filterOrders =  asyncHandler(async (req, res, next)=> {
    if (req.user.role === 'user') {
        req.filterObj = {user: req.user._id}
    }
    next();
})

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.getAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.getSpecificOrder = factory.getOne(Order);

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ApiError(`There is no such a order with this id:${req.params.id}`, 404));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const orderUpdated = await order.save();

    res.status(200).json({ status: 'success', data: orderUpdated });
})

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ApiError(`There is no such a order with this id:${req.params.id}`, 404));
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    const orderUpdated = await order.save();

    res.status(200).json({ status: 'success', data: orderUpdated });
})

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get cart depend on cartId
    const cart = await Cart.findById( req.params.cartId );
    if (!cart) {
        return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404));
    }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'egp',
                    unit_amount: totalOrderPrice * 100,
                    product_data: {
                        name: req.user.name,
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/order`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    },{
        apiKey: process.env.STRIPE_SECRET_KEY
    });

    res.status(200).json({ status: 'success', session });
})