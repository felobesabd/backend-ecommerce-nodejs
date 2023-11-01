const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const ApiError = require("../utils/apiError");

// Create Token
const createToken = (payload)=> {
    return jwt.sign(
        {userId: payload},
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRE_TIME
        }
    )
};

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
        console.log(req.user)
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('You are not allowed to access this route', 403))
        }
        next()
    });

