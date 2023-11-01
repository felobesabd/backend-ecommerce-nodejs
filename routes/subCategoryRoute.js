const express = require('express');
const { createSubCategoryValidator, getSubCategoryByIdValidator,
    updateSubCategoryValidator, deleteSubCategoryValidator } = require("../utils/validator/subCategoryValidator");
const { createSubCategory, getSubCategoryByID, getSubCategories,
    updateSubCategory, deleteSubCategory,
    setCategoryIdToBody, createFilterObj } = require("../services/subCategoryService");

const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });

router.route('/')
    .post(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
    .get(createFilterObj, getSubCategories);

router.route('/:id')
    .get(getSubCategoryByIdValidator, getSubCategoryByID)
    .put(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        updateSubCategoryValidator, updateSubCategory)

    .delete
    (
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        deleteSubCategoryValidator,
        deleteSubCategory
    )

module.exports = router;