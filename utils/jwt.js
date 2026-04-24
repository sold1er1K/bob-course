const jwt = require('jsonwebtoken');

const generateToken = (userId, email, roleId) => {
    return jwt.sign(
        { userId, email, roleId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };