const db = require('../db');

// Get all brands
exports.getAllBrands = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM brands ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error in getAllBrands:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des marques' });
    }
};

// Create a new brand
exports.createBrand = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if brand already exists
        const existingBrand = await db.query('SELECT * FROM brands WHERE name = $1', [name]);
        if (existingBrand.rows.length > 0) {
            return res.status(400).json({ message: 'Cette marque existe déjà' });
        }

        const result = await db.query('INSERT INTO brands (name) VALUES ($1) RETURNING *', [name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error in createBrand:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la marque' });
    }
};

// Update a brand
exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const result = await db.query('UPDATE brands SET name = $1 WHERE id = $2 RETURNING *', [name, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Marque non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in updateBrand:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la marque' });
    }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Marque non trouvée' });
        }

        res.json({ message: 'Marque supprimée avec succès' });
    } catch (error) {
        console.error('Error in deleteBrand:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la marque' });
    }
};