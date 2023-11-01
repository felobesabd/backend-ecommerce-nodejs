const ApiError = require("../utils/apiError");

const errorHandlerDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const errorHandlerProd = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
}

const handleJwtInvalidSignature = () => {
    return new ApiError('Invalid token, please login again..', 401);
}

const handleJwtExpired = () => {
    return new ApiError('Expired token, please login again..', 401);
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        errorHandlerDev(err, res)
    } else {
        if (err.name === 'JsonWebTokenError') {
            err = handleJwtInvalidSignature();
        }
        if (err.name === 'TokenExpiredError') {
            err = handleJwtExpired();
        }
        errorHandlerProd(err, res)
    }
}

module.exports = errorHandler;
