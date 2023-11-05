const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const ApiError = require("../utils/apiError");


const calcTotalPrice = (cart)=> {
    let totalPrice = 0;
    cart.cartItems.forEach((item)=> {
        totalPrice += item.quantity * item.price;
    })

    cart.totalCartPrice = totalPrice;
    cart.totalPriceAfterDiscount = undefined;

    return totalPrice;
}

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Protected/User
exports.addProductToCart = asyncHandler(async (req, res, next)=> {

    const { productId, color } = req.body

    const productModel = await Product.findById(productId)

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        // create cart
        cart = await Cart.create({
            user: req.user._id,
            cartItems: [{
                product: productId,
                color,
                price: productModel.price,
            }]
        })
    } else {
        const productIndex = cart.cartItems.findIndex(
            (item)=> item.product.toString() === productId && item.color === color
        );

        if (productIndex > -1) {
            const incrementQuantityToSameProd = cart.cartItems[productIndex];
            incrementQuantityToSameProd.quantity += 1;

            cart.cartItems[productIndex] = incrementQuantityToSameProd;
        } else {
            // product not exist in cart,  push product to cartItems array
            cart.cartItems.push({ product: productId, color, price: productModel.price });
        }
    }

    // calculator total price of cart
    calcTotalPrice(cart)

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Product added to cart successfully',
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
})

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ApiError(`There is no cart for this user id : ${req.user._id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.deleteProductFromCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        {
            $pull: { cartItems: { _id: req.params.itemId } },
        },
        { new: true }
    );

    calcTotalPrice(cart);
    cart.save();

    res.status(200).json({
        status: 'success',
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(204).send();
});

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Protected/User
exports.updateProductCart = asyncHandler(async (req, res, next)=> {

    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        return next(new ApiError(`there is no cart for user ${req.user._id}`, 404));
    }

    const productIndex = cart.cartItems.findIndex(
            (item)=> item._id.toString() === req.params.itemId
    );

    if (productIndex > -1) {
        const updateQuantity = cart.cartItems[productIndex];
        updateQuantity.quantity = quantity;

        cart.cartItems[productIndex] = updateQuantity;
    } else {
        // product not exist in cart,  push product to cartItems array
        return next(new ApiError(`there is no item for this id :${req.params.itemId}`, 404));
    }

    // calculator total price of cart
    calcTotalPrice(cart);

    await cart.save();

    res.status(200).json({
        status: 'success',
        message: 'Product quantity updated successfully',
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
})

exports.applyCoupon = asyncHandler(async (req, res, next)=> {
    const coupon = await Coupon.findOne({ name: req.body.coupon, expire: { $gt: Date.now() } })

    if (!coupon) {
        return next(new ApiError(`Coupon is invalid or expired`));
    }

    const cart = await Cart.findOne({ user: req.user._id })

    const totalPrice = cart.totalCartPrice;

    const totalPriceAfterDiscountFunc = (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2); // 99.23

    cart.totalPriceAfterDiscount = totalPriceAfterDiscountFunc;

    await cart.save();

    res.status(200).json({
        status: 'success',
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });

})