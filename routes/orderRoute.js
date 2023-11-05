const express = require('express');

const {} = require('../utils/validator/userValidator');

const {
    createCashOrder,
    filterOrders,
    getAllOrders,
    getSpecificOrder,
    updateOrderToPaid,
    updateOrderToDelivered,
    checkoutSession,
} = require('../services/orderService');

const authService = require('../services/authService');

const router = express.Router();

router.use( authService.protect)

router.route('/checkout-session/:cartId').get(authService.allowedTo('user'), checkoutSession)

router.route('/:cartId').post(authService.allowedTo('user'), createCashOrder)

router.route('/').get(authService.allowedTo('user', 'admin', 'manager'), filterOrders, getAllOrders)

router.route('/:id').get(getSpecificOrder)
router.route('/:id/pay').put(authService.allowedTo( 'admin', 'manager'), updateOrderToPaid)
router.route('/:id/deliver').put(authService.allowedTo( 'admin', 'manager'), updateOrderToDelivered)

module.exports = router;