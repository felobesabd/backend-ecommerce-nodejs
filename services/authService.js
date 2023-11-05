const crypto = require('crypto');

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const ApiError = require("../utils/apiError");
const sendEmail = require('../utils/sendEmail')
const createToken = require('../utils/createToken')


// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signUp = asyncHandler(async (req, res) => {
    // 1- Create user
    const user = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    // 2- Generate token
    const token = createToken(user._id)

    res.status(201).json({ data: user , token });
});

exports.login = asyncHandler(async (req, res, next) => {
    const user = await userModel.findOne({email: req.body.email});
    if (!user) {
        return next(new ApiError('Incorrect email or password', 401));
    }

    const isCorrectPass = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrectPass) {
        return next(new ApiError('Incorrect email or password', 401));
    }

    const token = createToken(user._id)

    res.status(201).json({ data: user , token });
});

exports.protect = asyncHandler(async (req, res, next) => {
    // 1) Check if token exist, if exist get
    let token;
    if (req.headers.authorization || req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new ApiError('You are not login, Please login to get access this route', 401));
    }

    // 2) Verify token (no change happens, no expired token)
    const deCoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

    // 3) Check if user exists
    const deCodedUser = deCoded.userId
    const currentUser = await userModel.findById(deCodedUser);

    if (!currentUser) {
        return next(new ApiError('The user that belong to this token does no longer exist', 401))
    }

    // 4) Check if user change his password after token created
    if (currentUser.passChangedAt) {
        const time = currentUser.passChangedAt
        const timestamp = parseInt(time.getTime() / 1000, 10);

        if (timestamp > deCoded.iat) {
            return next(new ApiError('User recently changed his password. please login again..', 401))
        }
    }

    req.user = currentUser;
    next()
});

// (...roles) => ['admin', 'manager']
exports.allowedTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
        // 1) access roles
        // 2) access registered user (req.user.role)
        // console.log(req.user)
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('You are not allowed to access this route', 403))
        }
        next()
    });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next)=> {
    // 1) Get user by email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError(`There is no user with that email ${req.body.email}`, 404));
    }

    // 2) If user exist, Generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Hashing reset pass code
    const hashResetCode = crypto.createHash('sha256')
        .update(resetCode)
        .digest('hex');

    user.passResetCode = hashResetCode;
    user.passResetExpired = Date.now() + 10 * 60 * 1000;
    user.passResetVerified = false;

    await user.save();

    // 3) Send the reset code via email
    const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account.
     \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.
     \n The E-shop Team`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset code (valid for 10 min)',
            text: message,
        })
    } catch (err) {
        user.passResetCode = undefined;
        user.passResetExpired = undefined;
        user.passResetVerified = undefined;

        await user.save();
        return next(new ApiError('There is an error in sending email', 500));
    }

    // console.log(user)

    res.status(200).json({ status: 'Success', message: 'Reset code sent to email' });
})

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    const hashResetCode = crypto.createHash('sha256')
        .update(req.body.resetCode)
        .digest('hex');

    const user = await userModel.findOne({
        passResetCode: hashResetCode,
        passResetExpired: {$gt : Date.now()}
    });

    if (!user) {
        return next(new ApiError('Reset code invalid or expired'));
    }

    // 2) Reset code valid
    user.passResetVerified = true;
    await user.save();

    res.status(200).json({ status: 'Success' });
})

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError(`There is no user with that email ${req.body.email}`, 404));
    }

    // 2) Check if reset code verified
    if (!user.passResetVerified) {
        return next(new ApiError('Reset code not verified', 400));
    }

    user.password = req.body.newPassword;
    user.passResetCode = undefined;
    user.passResetExpired = undefined;
    user.passResetVerified = undefined;

    await user.save();

    // 3) if everything is ok, generate token
    const token = createToken(user._id);
    res.status(200).json({ status: 'Success', token });
})
