const express = require('express');

const {
    createReviewValidator,
    updateReviewValidator,
    getReviewValidator,
    deleteReviewValidator,
} = require('../utils/validator/reviewValidator');

const {
    getReview,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    createFilterObj,
    setProductUserIdToBody
} = require('../services/reviewService');

const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(createFilterObj, getReviews)
    .post(
        authService.protect,
        authService.allowedTo('user'),
        setProductUserIdToBody,
        createReviewValidator,
        createReview
    );
router
    .route('/:id')
    .get(getReviewValidator, getReview)
    .put(
        authService.protect,
        authService.allowedTo('user'),
        updateReviewValidator,
        updateReview
    )
    .delete(
        authService.protect,
        authService.allowedTo('user', 'manager', 'admin'),
        deleteReviewValidator,
        deleteReview
    );

module.exports = router;