const express = require('express');
const {
    getProductValidator,
    createProductValidator,
    updateProductValidator,
    deleteProductValidator,
} = require('../utils/validator/productValidator');

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    resizeImage,
    uploadPrdImage
} = require('../services/productService');

const authService = require('../services/authService');
const reviewRoute = require('./reviewRoute');

const router = express.Router();

router.use('/:productId/reviews', reviewRoute)

router.route('/')
    .get(getProducts)
    .post(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadPrdImage, resizeImage, createProductValidator, createProduct);
router
    .route('/:id')
    .get(getProductValidator, getProduct)
    .put(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadPrdImage, resizeImage, updateProductValidator, updateProduct)
    .delete(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        deleteProductValidator, deleteProduct);

module.exports = router;