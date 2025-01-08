const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth');

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

// Validations pour la création et la mise à jour de commandes
const orderValidations = [
    body('items').isArray().withMessage('Les articles de la commande doivent être un tableau'),
    body('items.*.product_id').isInt({ min: 1 }).withMessage('L\'ID du produit doit être un nombre entier positif'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La quantité doit être un nombre entier positif')
];

// GET toutes les commandes (route protégée, admin seulement)
router.get('/',
    authMiddleware,
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un nombre entier entre 1 et 100'),
    validate([query('page'), query('limit')]),
    async (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(new AppError('Accès non autorisé', 403));
        }
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const countQuery = 'SELECT COUNT(*) FROM orders';
            const dataQuery = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2';

            const [countResult, dataResult] = await Promise.all([
                pool.query(countQuery),
                pool.query(dataQuery, [limit, offset])
            ]);

            const totalItems = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                data: dataResult.rows,
                pagination: {
                    currentPage: page,
                    itemsPerPage: limit,
                    totalItems: totalItems,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            });
        } catch (err) {
            next(new AppError('Erreur lors de la récupération des commandes', 500));
        }
    });

// GET une commande spécifique (route protégée, admin ou utilisateur propriétaire)
router.get('/:id',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de la commande doit être un nombre entier positif'),
    validate([param('id')]),
    async (req, res, next) => {
        try {
            const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
            if (rows.length === 0) {
                return next(new AppError('Commande non trouvée', 404));
            }
            if (!req.user.isAdmin && req.user.userId !== rows[0].user_id) {
                return next(new AppError('Accès non autorisé', 403));
            }
            const orderItems = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
            res.json({ ...rows[0], items: orderItems.rows });
        } catch (err) {
            next(new AppError('Erreur lors de la récupération de la commande', 500));
        }
    });

// POST une nouvelle commande (route protégée)
router.post('/',
    authMiddleware,
    validate(orderValidations),
    async (req, res, next) => {
        const { items } = req.body;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let totalAmount = 0;
            for (const item of items) {
                const { rows } = await client.query('SELECT price, stock FROM products WHERE id = $1', [item.product_id]);
                if (rows.length === 0) {
                    throw new AppError(`Produit avec l'ID ${item.product_id} non trouvé`, 404);
                }
                if (rows[0].stock < item.quantity) {
                    throw new AppError(`Stock insuffisant pour le produit avec l'ID ${item.product_id}`, 400);
                }
                totalAmount += rows[0].price * item.quantity;
            }

            const { rows } = await client.query(
                'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING *',
                [req.user.userId, totalAmount]
            );
            const orderId = rows[0].id;

            for (const item of items) {
                await client.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))',
                    [orderId, item.product_id, item.quantity]
                );
                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query('COMMIT');
            res.status(201).json(rows[0]);
        } catch (err) {
            await client.query('ROLLBACK');
            next(err);
        } finally {
            client.release();
        }
    });

// PUT pour mettre à jour le statut d'une commande (route protégée, admin seulement)
router.put('/:id/status',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de la commande doit être un nombre entier positif'),
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Statut de commande invalide'),
    validate([param('id'), body('status')]),
    async (req, res, next) => {
        if (!req.user.isAdmin) {
            return next(new AppError('Accès non autorisé', 403));
        }
        const { id } = req.params;
        const { status } = req.body;
        try {
            const { rows } = await pool.query(
                'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [status, id]
            );
            if (rows.length === 0) {
                return next(new AppError('Commande non trouvée', 404));
            }
            res.json(rows[0]);
        } catch (err) {
            next(new AppError('Erreur lors de la mise à jour du statut de la commande', 500));
        }
    });

// DELETE pour annuler une commande (route protégée, admin ou utilisateur propriétaire)
router.delete('/:id',
    authMiddleware,
    param('id').isInt({ min: 1 }).withMessage('L\'ID de la commande doit être un nombre entier positif'),
    validate([param('id')]),
    async (req, res, next) => {
        const { id } = req.params;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows } = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
            if (rows.length === 0) {
                throw new AppError('Commande non trouvée', 404);
            }
            if (!req.user.isAdmin && req.user.userId !== rows[0].user_id) {
                throw new AppError('Accès non autorisé', 403);
            }
            if (rows[0].status !== 'pending') {
                throw new AppError('Seules les commandes en attente peuvent être annulées', 400);
            }

            const orderItems = await client.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
            for (const item of orderItems.rows) {
                await client.query(
                    'UPDATE products SET stock = stock + $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
            await client.query('DELETE FROM orders WHERE id = $1', [id]);

            await client.query('COMMIT');
            res.json({ message: 'Commande annulée avec succès' });
        } catch (err) {
            await client.query('ROLLBACK');
            next(err);
        } finally {
            client.release();
        }
    });

module.exports = router;

