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

// Middleware pour les logs d'accès aux images
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


const brandRoutes = require('./routes/brandRoutes');
app.use('/api/brands', brandRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API de Reboul Store' });
});

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

// Fonction pour démarrer le serveur
const startServer = (port) => {
    app.listen(port, () => {
        console.log(`Serveur démarré sur le port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Le port ${port} est déjà utilisé. Tentative avec le port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Erreur lors du démarrage du serveur:', err);
        }
    });
};

// Vérification de la connexion à la base de données avant de démarrer le serveur
pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        process.exit(1);
    } else {
        console.log('Connexion à la base de données réussie');
        const PORT = process.env.PORT || 5001;
        startServer(PORT);
    }
});

