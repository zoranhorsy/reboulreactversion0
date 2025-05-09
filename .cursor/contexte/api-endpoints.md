# API Endpoints

Ce document décrit les endpoints API disponibles pour l'application e-commerce Reboul.

## Structure API
Les API sont implémentées via les API Routes de Next.js, situées dans `/src/app/api/`.

## Authentification
La plupart des endpoints nécessitent une authentification via JWT:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription d'un nouvel utilisateur |
| POST | /api/auth/login | Connexion utilisateur |
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Récupération des infos de l'utilisateur connecté |
| POST | /api/auth/reset-password | Demande de réinitialisation de mot de passe |

### Produits
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/products | Récupérer tous les produits (avec filtres) |
| GET | /api/products/[id] | Récupérer un produit par son ID |
| GET | /api/products/featured | Récupérer les produits mis en avant |
| POST | /api/products | Ajouter un nouveau produit (admin) |
| PUT | /api/products/[id] | Mettre à jour un produit (admin) |
| DELETE | /api/products/[id] | Supprimer un produit (admin) |

### Catégories
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/categories | Récupérer toutes les catégories |
| GET | /api/categories/[id]/products | Récupérer les produits d'une catégorie |
| POST | /api/categories | Créer une nouvelle catégorie (admin) |
| PUT | /api/categories/[id] | Mettre à jour une catégorie (admin) |

### Panier
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/cart | Récupérer le panier de l'utilisateur |
| POST | /api/cart/items | Ajouter un article au panier |
| PUT | /api/cart/items/[id] | Mettre à jour la quantité d'un article |
| DELETE | /api/cart/items/[id] | Supprimer un article du panier |

### Commandes
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/orders | Récupérer toutes les commandes de l'utilisateur |
| GET | /api/orders/[id] | Récupérer les détails d'une commande |
| POST | /api/orders | Créer une nouvelle commande |
| PUT | /api/orders/[id]/status | Mettre à jour le statut d'une commande (admin) |

### Paiement
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/payment/create-intent | Créer une intention de paiement Stripe |
| POST | /api/payment/confirm | Confirmer un paiement |
| POST | /api/payment/webhook | Webhook pour les événements Stripe |

### Utilisateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/users/[id] | Récupérer les détails d'un utilisateur (admin) |
| PUT | /api/users/[id] | Mettre à jour un utilisateur |
| GET | /api/users/[id]/orders | Récupérer les commandes d'un utilisateur |
| POST | /api/users/addresses | Ajouter une adresse à un utilisateur |

## Exemples de réponses

### GET /api/products/[id]
```json
{
  "id": "prod_123",
  "name": "Nike Air Max 90",
  "description": "Chaussure de sport emblématique avec amorti Air visible",
  "price": 149.99,
  "discount_price": 129.99,
  "images": [
    "https://example.com/images/product1.jpg",
    "https://example.com/images/product1-2.jpg"
  ],
  "category_id": "cat_shoes",
  "brand": "Nike",
  "stock": 25,
  "sizes": ["40", "41", "42", "43", "44"],
  "colors": ["black", "white", "red"],
  "featured": true,
  "created_at": "2023-05-10T08:30:00Z",
  "updated_at": "2023-06-15T14:20:00Z"
}
```

### Codes d'erreur
| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Permission refusée |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 500 | Erreur serveur | 