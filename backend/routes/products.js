const express = require('express');
const router = express.Router();
const pool = require('../db');
const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/auth');
const uploadFields = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;

// Middleware de validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError('Erreur de validation', 400, errors.array()));
    }
    next();
};

// GET tous les produits
router.get('/',
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
    validate,
    async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { rows } = await pool.query('SELECT * FROM products LIMIT $1 OFFSET $2', [limit, offset]);
            const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM products');
            const totalCount = parseInt(countRows[0].count);

            res.json({
                data: rows,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            });
        } catch (err) {
            next(new AppError('Erreur lors de la récupération des produits', 500));
        }
    }
);

// GET un produit par ID
router.get('/:id',
    param('id').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
    validate,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
            if (rows.length === 0) {
                return next(new AppError('Produit non trouvé', 404));
            }
            res.json(rows[0]);
        } catch (err) {
            next(new AppError('Erreur lors de la récupération du produit', 500));
        }
    }
);

// POST pour créer un nouveau produit
router.post('/',
    authMiddleware,
    uploadFields,
    body('name').notEmpty().withMessage('Le nom du produit est requis'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('description').optional().isString(),
    body('category_id').optional().isInt(),
    body('brand').optional().isString(),
    body('store_type').optional().isIn(['adult', 'kids', 'sneakers']),
    validate,
    async (req, res, next) => {
        try {
            const { name, price, description, category_id, brand, store_type } = req.body;
            const jsonFields = ['variants', 'reviews', 'questions', 'faqs', 'size_chart'];
            const arrayFields = ['tags', 'colors', 'images'];

            const insertFields = { name, price, description, category_id, brand, store_type };

            // Handle uploaded files
            if (req.files) {
                if (req.files['image_url']) {
                    insertFields.image_url = '/uploads/' + req.files['image_url'][0].filename;
                }
                if (req.files['images']) {
                    insertFields.images = JSON.stringify(req.files['images'].map(file => '/uploads/' + file.filename));
                }
            }

            jsonFields.forEach(field => {
                if (req.body[field]) {
                    insertFields[field] = JSON.stringify(req.body[field]);
                }
            });

            arrayFields.forEach(field => {
                if (req.body[field]) {
                    insertFields[field] = JSON.stringify(req.body[field]);
                }
            });

            const keys = Object.keys(insertFields);
            const values = Object.values(insertFields);
            const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

            const query = `
                INSERT INTO products (${keys.join(', ')})
                VALUES (${placeholders})
                RETURNING *;
            `;

            const { rows } = await pool.query(query, values);
            res.status(201).json(rows[0]);
        } catch (err) {
            next(new AppError('Erreur lors de la création du produit', 500));
        }
    }
);

// PUT pour mettre à jour un produit
router.put('/:id',
    authMiddleware,
    uploadFields,
    param('id').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
    body('name').optional().notEmpty().withMessage('Le nom du produit ne peut pas être vide'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('description').optional().isString(),
    body('category_id').optional().isInt(),
    body('brand').optional().isString(),
    body('store_type').optional().isIn(['adult', 'kids', 'sneakers']),
    validate,
    async (req, res, next) => {
        try {
            console.log('Début de la mise à jour du produit');
            console.log('ID du produit:', req.params.id);
            console.log('Données reçues:', JSON.stringify(req.body, null, 2));
            console.log('Fichiers reçus:', req.files);

            const { id } = req.params;
            const updateFields = { ...req.body };

            // Handle uploaded files
            if (req.files) {
                if (req.files['image_url'] && req.files['image_url'][0]) {
                    updateFields.image_url = '/uploads/' + req.files['image_url'][0].filename;
                    console.log('URL de l\'image principale mise à jour:', updateFields.image_url);
                }
                if (req.files['images']) {
                    const newImages = req.files['images'].map(file => '/uploads/' + file.filename);
                    if (updateFields.images) {
                        let existingImages = Array.isArray(updateFields.images) ? updateFields.images : JSON.parse(updateFields.images || '[]');
                        updateFields.images = JSON.stringify([...existingImages, ...newImages]);
                    } else {
                        updateFields.images = JSON.stringify(newImages);
                    }
                    console.log('URLs des images supplémentaires mises à jour:', updateFields.images);
                }
            }

            // Traitement des champs JSON et des tableaux
            const jsonFields = ['variants', 'reviews', 'questions', 'faqs', 'size_chart'];
            const arrayFields = ['tags', 'colors'];

            jsonFields.forEach(field => {
                if (updateFields[field]) {
                    console.log(`Traitement du champ JSON ${field}:`, updateFields[field]);
                    if (typeof updateFields[field] === 'string') {
                        try {
                            updateFields[field] = JSON.parse(updateFields[field]);
                        } catch (e) {
                            console.error(`Erreur lors du parsing du champ ${field}:`, e);
                            delete updateFields[field];
                        }
                    }
                    updateFields[field] = JSON.stringify(updateFields[field]);
                    console.log(`Résultat du traitement pour ${field}:`, updateFields[field]);
                }
            });

            arrayFields.forEach(field => {
                if (updateFields[field]) {
                    console.log(`Traitement du champ tableau ${field}:`, updateFields[field]);
                    if (typeof updateFields[field] === 'string') {
                        try {
                            updateFields[field] = JSON.parse(updateFields[field]);
                        } catch (e) {
                            console.error(`Erreur lors du parsing du champ ${field}:`, e);
                            updateFields[field] = updateFields[field].split(',').map(item => item.trim());
                        }
                    }
                    if (Array.isArray(updateFields[field])) {
                        updateFields[field] = `{${updateFields[field].join(',')}}`;
                    } else {
                        console.error(`Le champ ${field} n'est pas un tableau valide:`, updateFields[field]);
                        delete updateFields[field];
                    }
                    console.log(`Résultat du traitement pour ${field}:`, updateFields[field]);
                }
            });

            // Gestion des champs spécifiques
            if (updateFields.category !== undefined) {
                updateFields.category_id = updateFields.category;
                delete updateFields.category;
            }

            if (updateFields.storeType !== undefined) {
                updateFields.store_type = updateFields.storeType;
                delete updateFields.storeType;
            }

            if (updateFields.sizeChart !== undefined) {
                updateFields.size_chart = JSON.stringify(updateFields.sizeChart);
                delete updateFields.sizeChart;
            }

            // Suppression des champs vides ou null
            Object.keys(updateFields).forEach(key => {
                if (updateFields[key] === '' || updateFields[key] === null || updateFields[key] === undefined) {
                    delete updateFields[key];
                }
            });

            console.log('Champs à mettre à jour (après traitement):', JSON.stringify(updateFields, null, 2));

            // Construction de la requête SQL
            const setClause = Object.keys(updateFields)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(', ');
            const values = Object.values(updateFields);

            console.log('Clause SET:', setClause);
            console.log('Valeurs:', JSON.stringify(values, null, 2));

            const query = `
                UPDATE products
                SET ${setClause}
                WHERE id = $${values.length + 1}
              RETURNING *;
          `;

            console.log('Requête SQL:', query);
            console.log('Valeurs:', JSON.stringify(values, null, 2));

            const result = await pool.query(query, [...values, id]);

            console.log('Résultat de la requête:', JSON.stringify(result.rows[0], null, 2));

            if (result.rows.length === 0) {
                return next(new AppError('Produit non trouvé', 404));
            }

            const updatedProduct = {
                ...result.rows[0],
                price: parseFloat(result.rows[0].price),
                images: Array.isArray(result.rows[0].images) ? result.rows[0].images : JSON.parse(result.rows[0].images || '[]'),
                tags: Array.isArray(result.rows[0].tags) ? result.rows[0].tags : JSON.parse(result.rows[0].tags || '[]'),
                colors: Array.isArray(result.rows[0].colors) ? result.rows[0].colors : JSON.parse(result.rows[0].colors || '[]'),
                variants: typeof result.rows[0].variants === 'string' ? JSON.parse(result.rows[0].variants) : result.rows[0].variants,
                reviews: typeof result.rows[0].reviews === 'string' ? JSON.parse(result.rows[0].reviews) : result.rows[0].reviews,
                questions: typeof result.rows[0].questions === 'string' ? JSON.parse(result.rows[0].questions) : result.rows[0].questions,
                faqs: typeof result.rows[0].faqs === 'string' ? JSON.parse(result.rows[0].faqs) : result.rows[0].faqs,
                size_chart: typeof result.rows[0].size_chart === 'string' ? JSON.parse(result.rows[0].size_chart) : result.rows[0].size_chart
            };

            console.log('Produit mis à jour avec succès:', JSON.stringify(updatedProduct, null, 2));
            res.json(updatedProduct);
        } catch (err) {
            console.error('Erreur détaillée lors de la mise à jour du produit:', err);
            next(new AppError(`Erreur lors de la mise à jour du produit: ${err.message}`, 500));
        }
    }
);

// DELETE pour supprimer un produit
router.delete('/:id',
    authMiddleware,
    param('id').isInt().withMessage('L\'ID du produit doit être un nombre entier'),
    validate,
    async (req, res, next) => {
        try {
            console.log('Début de la suppression du produit');
            console.log('ID du produit à supprimer:', req.params.id);

            const { id } = req.params;

            // Fetch the product before deleting
            const { rows } = await pool.query('SELECT image_url, images FROM products WHERE id = $1', [id]);

            if (rows.length === 0) {
                console.log('Produit non trouvé pour la suppression');
                return next(new AppError('Produit non trouvé', 404));
            }

            console.log('Produit trouvé:', rows[0]);

            // Delete the product from the database
            const deleteResult = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

            if (deleteResult.rows.length === 0) {
                console.log('Échec de la suppression du produit');
                return next(new AppError('Échec de la suppression du produit', 500));
            }

            console.log('Produit supprimé de la base de données');

            // Delete associated image files
            const imageUrl = rows[0].image_url;
            const images = JSON.parse(rows[0].images || '[]');

            if (imageUrl) {
                const imagePath = path.join(__dirname, '..', 'public', imageUrl);
                await fs.unlink(imagePath).catch((err) => console.error('Erreur lors de la suppression de l\'image principale:', err));
            }

            for (const image of images) {
                const imagePath = path.join(__dirname, '..', 'public', image);
                await fs.unlink(imagePath).catch((err) => console.error('Erreur lors de la suppression d\'une image supplémentaire:', err));
            }

            console.log('Images associées supprimées');

            res.json({ message: 'Produit supprimé avec succès', deletedProduct: deleteResult.rows[0] });
        } catch (err) {
            console.error('Erreur détaillée lors de la suppression du produit:', err);
            next(new AppError(`Erreur lors de la suppression du produit: ${err.message}`, 500));
        }
    }
);

module.exports = router;

