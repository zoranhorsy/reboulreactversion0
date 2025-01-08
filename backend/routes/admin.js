const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// Middleware to check if the user is an admin
const adminMiddleware = (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(new AppError('Access denied. Admin privileges required.', 403));
    }
    next();
};

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
        const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
        const totalRevenue = await pool.query('SELECT SUM(total_amount) FROM orders');

        res.json({
            totalUsers: totalUsers.rows[0].count,
            totalProducts: totalProducts.rows[0].count,
            totalOrders: totalOrders.rows[0].count,
            totalRevenue: totalRevenue.rows[0].sum || 0
        });
    } catch (error) {
        next(new AppError('Error fetching dashboard stats', 500));
    }
});

// Get recent orders
router.get('/recent-orders', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const recentOrders = await pool.query(
            'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
        );
        res.json(recentOrders.rows);
    } catch (error) {
        next(new AppError('Error fetching recent orders', 500));
    }
});

// Get top products
router.get('/top-products', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const topProducts = await pool.query(
            'SELECT p.id, p.name, SUM(oi.quantity) as total_sold ' +
            'FROM products p ' +
            'JOIN order_items oi ON p.id = oi.product_id ' +
            'GROUP BY p.id, p.name ' +
            'ORDER BY total_sold DESC ' +
            'LIMIT 5'
        );
        res.json(topProducts.rows);
    } catch (error) {
        next(new AppError('Error fetching top products', 500));
    }
});

// Get weekly sales
router.get('/weekly-sales', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const weeklySales = await pool.query(
            "SELECT DATE_TRUNC('day', created_at) as date, SUM(total_amount) as total " +
            "FROM orders " +
            "WHERE created_at >= NOW() - INTERVAL '7 days' " +
            "GROUP BY DATE_TRUNC('day', created_at) " +
            "ORDER BY date"
        );
        res.json(weeklySales.rows);
    } catch (error) {
        next(new AppError('Error fetching weekly sales', 500));
    }
});

module.exports = router;

