# Architecture de l'application Reboul E-commerce

## Architecture globale
L'application Reboul utilise une architecture moderne full-stack basée sur Next.js avec des API Routes pour le backend et des composants React pour le frontend.

## Structure des données principales

### Produit
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  images: string[];
  category_id: string;
  brand: string;
  stock: number;
  sizes: string[];
  colors: string[];
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Commande
```typescript
interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_intent_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Utilisateur
```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  created_at: Date;
  updated_at: Date;
}
```

## Gestion d'état
- **Context API** pour la gestion du panier et de l'authentification
- **React Query** pour la récupération et le cache des données
- **localStorage** pour persister le panier et les préférences utilisateur

## Flux de données
1. Les données sont récupérées depuis les API Routes Next.js
2. Ces API Routes communiquent avec la base de données PostgreSQL hébergée sur Railway
3. Les données sont mises en cache et gérées côté client avec React Query
4. Les états globaux comme le panier sont gérés via Context API

## Infrastructure
- **Frontend**: Déployé sur Vercel
- **Backend & Base de données**: Hébergés sur Railway
- **CI/CD**: Pipeline automatisé via GitHub Actions

## Patterns utilisés
- Server-Side Rendering (SSR) pour les pages qui nécessitent des données à l'initialisation
- Static Site Generation (SSG) pour les pages de contenu statique
- Client-Side Rendering pour les interactions dynamiques
- Incremental Static Regeneration pour la mise à jour périodique des pages statiques

## Routes principales
- `/` - Page d'accueil
- `/catalogue` - Catalogue de produits avec filtres
- `/produit/[id]` - Page détaillée d'un produit
- `/panier` - Panier d'achat
- `/checkout` - Processus de paiement
- `/profil` - Profil utilisateur
- `/admin/*` - Interface d'administration 