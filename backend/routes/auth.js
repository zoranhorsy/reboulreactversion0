const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth'); // Import the authentication middleware

// Middleware de validation
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
        return next(new AppError(JSON.stringify(extractedErrors), 400));
    };
};

// Fonction pour récupérer un utilisateur par son ID (à ajouter)
const getUserById = async (userId) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
        throw new AppError('Utilisateur non trouvé', 404);
    }
    return rows[0];
};


// Connexion
router.post('/login',
    [
        body('email').isEmail().withMessage('L\'email doit être valide'),
        body('password').notEmpty().withMessage('Le mot de passe est requis'),
    ],
    validate([body('email'), body('password')]),
    async (req, res, next) => {
        const { email, password } = req.body;
        try {
            console.log('Tentative de connexion pour:', email);
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (rows.length === 0) {
                console.log('Aucun utilisateur trouvé pour:', email);
                return next(new AppError('Email ou mot de passe incorrect', 401));
            }
            const user = rows[0];
            console.log('Utilisateur trouvé:', user.username);
            console.log('Mot de passe fourni:', password);
            console.log('Hash stocké:', user.password_hash);
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                console.log('Mot de passe invalide pour:', email);
                return next(new AppError('Email ou mot de passe incorrect', 401));
            }
            console.log('Mot de passe valide pour:', email);
            const token = jwt.sign(
                { userId: user.id, username: user.username, isAdmin: user.is_admin },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            console.log('Token généré pour:', email);
            res.json({
                message: 'Connexion réussie',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    is_admin: user.is_admin // Assurez-vous que cette propriété est incluse
                }
            });
        } catch (err) {
            console.error('Erreur lors de la connexion:', err);
            next(new AppError('Erreur lors de la connexion', 500));
        }
    });

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            is_admin: user.is_admin // Assurez-vous que cette propriété est incluse
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des informations utilisateur' });
    }
});

module.exports = router;

