const asyncHandler = require('express-async-handler')
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const categoryModel = require('../models/categoryModel');
const factory = require('./handlerFactory')
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// Upload Category Images
exports.uploadCatImage = uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next)=> {
    const fileName = `category-${uuidv4()}-${Date.now()}.png`

    await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat("png")
        .png({ quality: 95 })
        .toFile(`uploads/categories/${fileName}`)

    // set image in db
    req.body.image = fileName;

    next()
})

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = factory.getAll(categoryModel)

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategoryByID = factory.getOne(categoryModel)

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(categoryModel);

// @desc    Update specific category
// @route   Update /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(categoryModel)

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(categoryModel);





