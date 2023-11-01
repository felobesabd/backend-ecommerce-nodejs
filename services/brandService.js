const asyncHandler = require('express-async-handler')
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const Brand = require('../models/brandModel');
const factory = require('./handlerFactory')
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");


exports.uploadBrandImage = uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next)=> {
    const fileName = `brand-${uuidv4()}-${Date.now()}.png`

    await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat("png")
        .png({ quality: 95 })
        .toFile(`uploads/brands/${fileName}`)

    // set image in db
    req.body.image = fileName;

    next()
})


// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = factory.getAll(Brand)

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand)

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createBrand = factory.createOne(Brand);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
