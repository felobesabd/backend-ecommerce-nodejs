const express = require('express');

const {} = require('../utils/validator/userValidator');

const { addProductToWishlist, deleteProductFromWishlist, getWishlistOfLoggedUser } = require('../services/wishlistService');

const authService = require('../services/authService');

const router = express.Router();

router.use( authService.protect, authService.allowedTo('user'))

router.route('/')
    .post(addProductToWishlist)
    .get(getWishlistOfLoggedUser)

router.route('/:productId')
    .delete(deleteProductFromWishlist)

module.exports = router;