const express = require('express');

const { categoryByIdValidator, createCategoryValidator,
    updateCategoryValidator, deleteCategoryValidator } = require("../utils/validator/categoryValidator");

const { getCategories, createCategory, getCategoryByID,
    updateCategory, deleteCategory, uploadCatImage, resizeImage } = require('../services/categoryService');

const authService = require('../services/authService');

const subCategoryRoute = require('./subCategoryRoute')

const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRoute)

router.route('/')
    .get(getCategories)
    .post(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadCatImage,
        resizeImage,
        createCategoryValidator,
        createCategory);

router.route('/:id')
    .get(categoryByIdValidator, getCategoryByID)
    .put(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadCatImage, resizeImage, updateCategoryValidator, updateCategory)
    .delete(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        deleteCategoryValidator, deleteCategory);

module.exports = router;