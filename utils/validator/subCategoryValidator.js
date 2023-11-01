const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");
const { check, body } = require('express-validator');

exports.getSubCategoryByIdValidator = [
    check('id').isMongoId().withMessage('Invalid category id'),
    validatorMiddleware
];

exports.createSubCategoryValidator = [
    check('name').notEmpty().withMessage('SubCategory name required')
        .isLength({min: 2}).withMessage('Too short category name')
        .isLength({max: 32}).withMessage('Too long category name')
        .custom((val, {req}) => {
            req.body.slug = slugify(val)
            return true;
        }),
    check('category').notEmpty().withMessage('SubCategory category_id required')
    .isMongoId().withMessage('Invalid category_id'),
    validatorMiddleware
];

exports.updateSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid SubCategory id'),
    body('name').custom((val, {req}) => {
        req.body.slug = slugify(val)
        return true;
    }),
    validatorMiddleware
];

exports.deleteSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid SubCategory id'),
    validatorMiddleware
];