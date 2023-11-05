const express = require('express');

const {} = require('../utils/validator/userValidator');

const {
    addProductToCart,
    getLoggedUserCart,
    deleteProductFromCart,
    clearCart,
    updateProductCart,
    applyCoupon
} = require('../services/cartService');

const authService = require('../services/authService');

const router = express.Router();

router.use( authService.protect, authService.allowedTo('user'))

router.route('/')
    .post(addProductToCart)
    .get(getLoggedUserCart)
    .delete(clearCart)

router.route('/applyCoupon')
    .put(applyCoupon)

router.route('/:itemId')
    .delete(deleteProductFromCart)
    .put(updateProductCart)

module.exports = router;