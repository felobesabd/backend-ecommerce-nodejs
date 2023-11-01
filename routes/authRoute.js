const express = require('express');

const {
    signUpValidator,
    loginValidator
} = require('../utils/validator/authValidator');

const {
    signUp,
    login,
} = require('../services/authService');

const router = express.Router();

router.route('/signup').post(signUpValidator, signUp);
router.route('/login').post(loginValidator, login);


module.exports = router;