const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, param, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');

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

// Validations pour la création et la mise à jour d'utilisateurs
const userValidations = [
    body('username').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
    body('email').isEmail().withMessage('L\'email doit être valide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('first_name').optional().isString().withMessage('Le prénom doit être une chaîne de caractères'),
    body('last_name').optional().isString().withMessage('Le nom de famille doit être une chaîne de caractères'),
    body('is_admin').optional().isBoolean().withMessage('is_admin doit être un booléen')
];

// GET tous les utilisateurs (route protégée, admin seulement)
router.get('/', authMiddleware, async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(new AppError('Accès non autorisé', 403));
    }
    try {
        const { rows } = await pool.query('SELECT id, username, email, first_name, last_name, is_admin, created_at FROM users');
        res.json(rows);
    } catch (err) {
        next(new AppError('Erreur lors de la récupération des utilisateurs', 500));
    }
});

// GET un utilisateur spécifique (route protégée, admin ou utilisateur lui-même)
router.get('/:id',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de l\'utilisateur doit être un nombre entier positif'),
    validate([param('id')]),
    async (req, res, next) => {
        const userId = parseInt(req.params.id);
        if (!req.user.isAdmin && req.user.userId !== userId) {
            return next(new AppError('Accès non autorisé', 403));
        }
        try {
            const { rows } = await pool.query('SELECT id, username, email, first_name, last_name, is_admin, created_at FROM users WHERE id = $1', [userId]);
            if (rows.length === 0) {
                return next(new AppError('Utilisateur non trouvé', 404));
            }
            res.json(rows[0]);
        } catch (err) {
            next(new AppError('Erreur lors de la récupération de l\'utilisateur', 500));
        }
    });

// PUT pour mettre à jour un utilisateur (route protégée, admin ou utilisateur lui-même)
router.put('/:id',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de l\'utilisateur doit être un nombre entier positif'),
    validate([...userValidations, param('id')]),
    async (req, res, next) => {
        const { id } = req.params;
        const userId = parseInt(id);
        if (!req.user.isAdmin && req.user.userId !== userId) {
            return next(new AppError('Accès non autorisé', 403));
        }
        const { username, email, password, first_name, last_name, is_admin } = req.body;
        try {
            let hashedPassword;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }
            const { rows } = await pool.query(
                'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), password_hash = COALESCE($3, password_hash), first_name = COALESCE($4, first_name), last_name = COALESCE($5, last_name), is_admin = COALESCE($6, is_admin) WHERE id = $7 RETURNING id, username, email, first_name, last_name, is_admin, created_at',
                [username, email, hashedPassword, first_name, last_name, is_admin, id]
            );
            if (rows.length === 0) {
                return next(new AppError('Utilisateur non trouvé', 404));
            }
            res.json(rows[0]);
        } catch (err) {
            if (err.code === '23505') {
                return next(new AppError('Le nom d\'utilisateur ou l\'email est déjà utilisé', 400));
            }
            next(new AppError('Erreur lors de la mise à jour de l\'utilisateur', 500));
        }
    });

// DELETE pour supprimer un utilisateur (route protégée, admin seulement)
router.delete('/:id',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de l\'utilisateur doit être un nombre entier positif'),
    validate([param('id')]),
    async (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(new AppError('Accès non autorisé', 403));
        }
        const { id } = req.params;
        try {
            const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email', [id]);
            if (rows.length === 0) {
                return next(new AppError('Utilisateur non trouvé', 404));
            }
            res.json({ message: 'Utilisateur supprimé avec succès', deletedUser: rows[0] });
        } catch (err) {
            next(new AppError('Erreur lors de la suppression de l\'utilisateur', 500));
        }
    });

module.exports = router;

