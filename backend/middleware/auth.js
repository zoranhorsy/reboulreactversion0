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

        // Add logging for debugging
        console.log('Utilisateur authentifié:', {
            userId: decoded.userId,
            username: decoded.username,
            isAdmin: decoded.isAdmin
        });

        // Check for admin routes
        if (req.originalUrl.startsWith('/admin') && !decoded.isAdmin) {
            console.log('Tentative d\'accès non autorisé à une route admin');
            return next(new AppError('Accès non autorisé', 403));
        }

        next();
    } catch (err) {
        console.error('Erreur de vérification du token:', err);
        return next(new AppError('Token invalide', 401));
    }
};

module.exports = authMiddleware;

