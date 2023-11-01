const subCategoryModel = require("../models/SubCategoryModel");
const factory = require('./handlerFactory')


exports.setCategoryIdToBody = (req, res, next)=> {
    if (!req.body.category) {
        req.body.category = req.params.categoryId;
    }
    next();
}

exports.createFilterObj = (req, res, next)=> {
    let filterObject = {};
    if (req.params.categoryId) {
        filterObject = { category: req.params.categoryId}
    }
    req.filterObj = filterObject;
    next();
}

// @desc    Get list of subCategory
// @route   GET /api/v1/subcategory
// @access  Public
exports.getSubCategories = factory.getAll(subCategoryModel)

// @desc    Get specific subCategory by id
// @route   GET /api/v1/subcategory/:id
// @access  Public
exports.getSubCategoryByID = factory.getOne(subCategoryModel)

// @desc    Create subCategory
// @route   POST  /api/v1/subcategories
// @access  Private
exports.createSubCategory = factory.createOne(subCategoryModel)

// @desc    Update specific subcategory
// @route   Update /api/v1/subcategories/:id
// @access  Private
exports.updateSubCategory = factory.updateOne(subCategoryModel)

// @desc    Delete specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);






