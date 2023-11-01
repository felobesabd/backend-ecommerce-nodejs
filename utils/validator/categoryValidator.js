const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");
const { check, body } = require('express-validator');

exports.categoryByIdValidator = [
    check('id').isMongoId().withMessage('Invalid category id'),
    validatorMiddleware
];

exports.createCategoryValidator = [
    check('name').notEmpty().withMessage('Category name required')
        .isLength({min: 3}).withMessage('Too short category name')
        .isLength({max: 32}).withMessage('Too long category name')
        .custom((val, {req}) => {
            req.body.slug = slugify(val)
            return true;
        }),
    validatorMiddleware
];

exports.updateCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid category id'),
    body('name')
        .optional()
        .custom((val, {req}) => {
        req.body.slug = slugify(val)
        return true;
    }),
    validatorMiddleware
];

exports.deleteCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid category id'),
    validatorMiddleware
];