const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addProductToWishlist = asyncHandler(async (req, res, next)=> {
    // $addToSet => add productId to wishlist array if productId not exist
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { wishlist: req.body.productId }
        },
        { new: true }
    )

    res.status(200).json({
        status: 'success',
        message: 'Product added successfully to your wishlist.',
        data: user.wishlist,
    });
})

// @desc    Delete product to wishlist
// @route   DELETE /api/v1/wishlist
// @access  Protected/User
exports.deleteProductFromWishlist = asyncHandler(async (req, res, next)=> {
    // $addToSet => add productId to wishlist array if productId not exist
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { wishlist: req.params.productId }
        },
        { new: true }
    )

    res.status(200).json({
        status: 'success',
        message: 'Product delete successfully to your wishlist.',
        data: user.wishlist,
    });
})

// @desc    Get product wishlist of logged user
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getWishlistOfLoggedUser = asyncHandler(async (req, res, next)=> {
    const user = await User.findById(req.user._id).populate('wishlist');

    res.status(200).json({
        status: 'success',
        results: user.wishlist.length,
        data: user.wishlist,
    });
})
