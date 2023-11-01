const express = require('express');// The disk storage engine
// const storage = multer.diskStorage({
//     destination:  (req, file, cb) => {
//         cb(null, 'uploads/categories')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`
//         cb(null, fileName)
//     }
// })
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