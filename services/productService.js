const asyncHandler = require('express-async-handler')
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const productModel = require("../models/productModel");
const factory = require('./handlerFactory')
const { uploadMaltiOfImage } = require("../middlewares/uploadImageMiddleware");


exports.uploadPrdImage = uploadMaltiOfImage([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
    ]);

exports.resizeImage = asyncHandler(async (req, res, next)=> {
    // Add imageCover
    if (req.files.imageCover) {
        const fileName = `product-${uuidv4()}-${Date.now()}-cover.png`

        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1500)
            .toFormat("png")
            .png({ quality: 95 })
            .toFile(`uploads/products/${fileName}`)

        // set image in db
        req.body.imageCover = fileName;
    }
    // Add Images Products
    if (req.files.images) {

        req.body.images = [];

        await Promise.all(
            req.files.images.map(async (item, index) => {
                const fileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.png`

                await sharp(item.buffer)
                    .resize(300, 300)
                    .toFormat("png")
                    .png({quality: 95})
                    .toFile(`uploads/products/${fileName}`)

                // set image in db
                req.body.images.push(fileName);
            })
        )
    }
    next()
})

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getProducts = factory.getAll(productModel, 'product')

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getProduct = factory.getOne(productModel)

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createProduct = factory.createOne(productModel)

// @desc    Update specific category
// @route   Update /api/v1/categories/:id
// @access  Private
exports.updateProduct = factory.updateOne(productModel)

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(productModel);






