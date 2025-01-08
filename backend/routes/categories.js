const express = require('express');
const router = express.Router();
const pool = require('../db');
const { AppError } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth');

// GET toutes les catégories
router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        next(new AppError('Erreur lors de la récupération des catégories', 500));
    }
});

// GET une catégorie spécifique
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return next(new AppError('Catégorie non trouvée', 404));
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(new AppError('Erreur lors de la récupération de la catégorie', 500));
    }
});

// POST une nouvelle catégorie (protégé par authMiddleware)
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            return next(new AppError('Le nom de la catégorie est requis', 400));
        }
        const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(new AppError('Erreur lors de la création de la catégorie', 500));
    }
});

// PUT mettre à jour une catégorie (protégé par authMiddleware)
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            return next(new AppError('Le nom de la catégorie est requis', 400));
        }
        const result = await pool.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rows.length === 0) {
            return next(new AppError('Catégorie non trouvée', 404));
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(new AppError('Erreur lors de la mise à jour de la catégorie', 500));
    }
});

// DELETE supprimer une catégorie (protégé par authMiddleware)
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return next(new AppError('Catégorie non trouvée', 404));
        }
        res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (err) {
        next(new AppError('Erreur lors de la suppression de la catégorie', 500));
    }
});

module.exports = router;