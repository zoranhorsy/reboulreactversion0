# Architecture Backend de Reboul

## Infrastructure

### Hébergement
- **Railway** pour l'hébergement du backend et de la base de données
- Configuration automatisée avec scaling à la demande
- Connexion sécurisée entre le frontend (Vercel) et le backend (Railway)

### Base de données
- **PostgreSQL** hébergé sur Railway
- Schéma relationnel optimisé pour les requêtes e-commerce
- Indexes stratégiques pour optimiser les performances des requêtes fréquentes
- Backups automatiques journaliers

### Sécurité
- Connexion SSL/TLS pour toutes les communications
- Variables d'environnement sécurisées pour les informations sensibles
- Middleware d'authentification pour protéger les routes sensibles
- Rate limiting pour prévenir les attaques par force brute

## Architecture des données

### Schéma de base de données complet
Reboul utilise une architecture de base de données comprenant 14 tables principales:

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notification_settings JSONB DEFAULT '{"push": false, "email": true, "security": true, "marketing": false}',
  reset_password_token VARCHAR(255) DEFAULT NULL,
  reset_password_expires TIMESTAMP WITHOUT TIME ZONE
);
```

#### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  brand TEXT,
  image_url TEXT,
  images TEXT[],
  variants JSONB,
  tags TEXT[],
  details TEXT[],
  store_type TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  brand_id INTEGER REFERENCES brands(id),
  sku VARCHAR(50),
  active BOOLEAN DEFAULT true,
  new BOOLEAN DEFAULT false,
  _actiontype VARCHAR(50),
  store_reference VARCHAR(100),
  material VARCHAR(100),
  weight INTEGER,
  dimensions VARCHAR(100),
  rating NUMERIC(3,2),
  reviews_count INTEGER DEFAULT 0
);
```

#### Corner Products (The Corner)
```sql
CREATE TABLE corner_products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2),
  category_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  brand TEXT,
  image_url TEXT,
  images TEXT[],
  tags TEXT[],
  details TEXT[],
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  new BOOLEAN DEFAULT false,
  sku VARCHAR(50),
  store_reference VARCHAR(100),
  material VARCHAR(100),
  weight INTEGER,
  dimensions VARCHAR(100),
  rating NUMERIC(3,2),
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  _actiontype VARCHAR(50),
  variants JSONB
);
```

#### Categories
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Brands
```sql
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  logo_dark TEXT,
  logo_light TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Product Variants
```sql
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  products_id INTEGER REFERENCES products(id),
  taille VARCHAR(10),
  couleur VARCHAR(50),
  stock INTEGER DEFAULT 0,
  product_name TEXT,
  store_reference TEXT,
  category_id INTEGER,
  brand_id INTEGER,
  price NUMERIC(10,2),
  active BOOLEAN
);
```

#### Corner Product Variants
```sql
CREATE TABLE corner_product_variants (
  id SERIAL PRIMARY KEY,
  corner_product_id INTEGER REFERENCES corner_products(id),
  taille VARCHAR(10),
  couleur VARCHAR(50),
  stock INTEGER DEFAULT 0,
  product_name TEXT,
  store_reference TEXT,
  category_id INTEGER,
  brand_id INTEGER,
  price NUMERIC(10,2),
  active BOOLEAN
);
```

#### Orders
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  order_number TEXT,
  shipping_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Order Items
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  variant_info JSONB,
  is_corner_product BOOLEAN DEFAULT false,
  corner_product_id INTEGER REFERENCES corner_products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Addresses
```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Favorites
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  is_corner_product BOOLEAN DEFAULT false,
  corner_product_id INTEGER REFERENCES corner_products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Reviews
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  is_corner_product BOOLEAN DEFAULT false,
  corner_product_id INTEGER REFERENCES corner_products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Archives
```sql
CREATE TABLE archives (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  image_paths TEXT[] NOT NULL,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Stats Cache
```sql
CREATE TABLE stats_cache (
  id SERIAL PRIMARY KEY,
  stat_type VARCHAR(50) NOT NULL,
  stat_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stat_type, stat_date)
);
```

### Indexation stratégique
La base de données comprend plusieurs index stratégiques pour optimiser les performances :

- Index sur les clés étrangères (user_id, product_id, etc.)
- Index spécifiques pour les recherches fréquentes (store_reference, categories)
- Index sur les colonnes utilisées pour le tri et le filtrage

## API et middlewares

### Structure des API Routes
- Organisation par domaine fonctionnel (/api/products, /api/orders, etc.)
- Middlewares d'authentification et d'autorisation
- Validation des données entrantes avec Zod
- Gestion des erreurs standardisée

### Middlewares principaux
- **authMiddleware**: Vérifie l'authenticité du JWT et ajoute les infos utilisateur à la requête
- **adminMiddleware**: Vérifie que l'utilisateur a les droits d'administration
- **corsMiddleware**: Gère les règles CORS pour les requêtes API
- **errorHandlerMiddleware**: Capture et formate les erreurs de manière cohérente

## Intégrations externes

### Stripe
- Intégration pour le traitement des paiements
- Gestion des webhooks pour les événements de paiement
- Réconciliation des commandes avec les paiements

### Cloudinary
- Stockage et optimisation des images produits
- Transformations d'images à la volée
- CDN pour une diffusion rapide des assets

### Nodemailer
- Service d'envoi d'emails transactionnels
- Templates pour les confirmations de commande, réinitialisation de mot de passe, etc.
- File d'attente pour les envois asynchrones

## Performances et optimisation

### Caching
- Mise en cache des données produits fréquemment consultées
- Stratégies d'invalidation de cache intelligentes
- Table stats_cache pour stocker les données statistiques précalculées

### Optimisation des requêtes
- Requêtes SQL optimisées avec indexes appropriés
- Pagination pour limiter la taille des résultats
- Selection des champs précis pour éviter de charger des données inutiles

### Monitoring
- Logging des performances et erreurs
- Alertes en cas de problèmes critiques
- Tableaux de bord pour suivre la santé du système 