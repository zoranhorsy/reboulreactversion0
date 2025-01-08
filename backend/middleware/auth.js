const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(new AppError('Aucun token fourni', 401));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Token invalide', 401));
    }
};

module.exports = authMiddleware;

