const slugify = require('slugify');
const { check } = require('express-validator');

const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const userModel = require('../../models/userModel');

exports.signUpValidator = [
    check('name')
        .notEmpty()
        .withMessage('User Name required')
        .isLength({ min: 3 })
        .withMessage('Too short User name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),

    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) => userModel.findOne({email: val}).then((user)=> {
            if (user) {
                return Promise.reject(new Error('E-mail already in user'));
            }
        })),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((val, {req})=> {
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('passwordConfirm')
        .notEmpty()
        .withMessage('Password confirmation required'),

    validatorMiddleware,
];

exports.loginValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    validatorMiddleware,
];