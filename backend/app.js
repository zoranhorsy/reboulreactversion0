const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const brandsRoutes = require('./routes/brandRoutes');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const reviewsRoutes = require('./routes/reviews');
const addressesRoutes = require('./routes/addresses');

const app = express();

// Configuration CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://reboul-store.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Serve static files
app.use(express.static('public'));
app.use('/brands', express.static(path.join(__dirname, 'public', 'brands')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/addresses', addressesRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 