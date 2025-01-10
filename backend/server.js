const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const pool = require('./db');
const { errorHandler } = require('./middleware/errorHandler');
const uploadRoutes = require('./routes/upload');
const app = express();

// Création du dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Dossier uploads créé:', uploadsDir);
} else {
    console.log('Dossier uploads existant:', uploadsDir);
}

// Middleware
app.use(cors({
    origin: '*', // Attention : à utiliser uniquement en développement
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Ajout du middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ajoutez ce middleware juste avant la ligne app.use('/uploads', express.static(...))
app.use('/uploads', (req, res, next) => {
    console.log(`Tentative d'accès à l'image: ${req.url}`);
    next();
});

// Servir les fichiers statiques
app.use('/api/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
const categoriesRouter = require('./routes/categories');
app.use('/api/categories', categoriesRouter);

const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API de Reboul Store' });
});

const brandRoutes = require('./routes/brandRoutes');
app.use('/api/brands', brandRoutes);

// Route de test pour les uploads
app.get('/test-uploads', (req, res) => {
    fs.readdir(path.join(__dirname, 'public', 'uploads'), (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la lecture du dossier uploads' });
        }
        res.json({ files });
    });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Le port ${PORT} est déjà utilisé. Tentative avec le port ${PORT + 1}`);
        app.listen(PORT + 1, () => {
            console.log(`Serveur démarré sur le port ${PORT + 1}`);
        });
    } else {
        console.error('Erreur lors du démarrage du serveur:', err);
    }
});

