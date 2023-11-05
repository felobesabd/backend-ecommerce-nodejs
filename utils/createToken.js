const jwt = require('jsonwebtoken');

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

module.exports = createToken;
