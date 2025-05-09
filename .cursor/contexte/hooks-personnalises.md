# Hooks Personnalisés pour Reboul E-commerce

Ce document décrit les hooks personnalisés utilisés dans l'application Reboul E-commerce.

## useCart

Hook principal pour la gestion du panier d'achat.

```typescript
const { 
  cart,
  totalItems,
  totalPrice,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  isInCart
} = useCart();
```

### Retourne
- `cart`: Tableau des articles dans le panier
- `totalItems`: Nombre total d'articles dans le panier
- `totalPrice`: Prix total du panier
- `addToCart`: Fonction pour ajouter un produit au panier
- `removeFromCart`: Fonction pour supprimer un produit du panier
- `updateQuantity`: Fonction pour mettre à jour la quantité d'un produit
- `clearCart`: Fonction pour vider le panier
- `isInCart`: Fonction pour vérifier si un produit est dans le panier

## useAuth

Hook pour gérer l'authentification et les sessions utilisateur.

```typescript
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  register,
  resetPassword
} = useAuth();
```

### Retourne
- `user`: Objet contenant les informations de l'utilisateur authentifié
- `isAuthenticated`: Boolean indiquant si l'utilisateur est authentifié
- `isLoading`: Boolean indiquant si une requête d'authentification est en cours
- `login`: Fonction pour connecter l'utilisateur
- `logout`: Fonction pour déconnecter l'utilisateur
- `register`: Fonction pour enregistrer un nouvel utilisateur
- `resetPassword`: Fonction pour réinitialiser le mot de passe

## useProducts

Hook pour récupérer et filtrer les produits.

```typescript
const {
  products,
  isLoading,
  error,
  fetchProducts,
  fetchProductById,
  fetchFeaturedProducts,
  filterProducts
} = useProducts();
```

### Retourne
- `products`: Tableau des produits
- `isLoading`: Boolean indiquant si une requête est en cours
- `error`: Objet d'erreur éventuel
- `fetchProducts`: Fonction pour récupérer tous les produits
- `fetchProductById`: Fonction pour récupérer un produit par son ID
- `fetchFeaturedProducts`: Fonction pour récupérer les produits mis en avant
- `filterProducts`: Fonction pour filtrer les produits

## useLocalStorage

Hook pour stocker et récupérer des données dans le localStorage.

```typescript
const [value, setValue] = useLocalStorage<T>(key, initialValue);
```

### Paramètres
- `key`: Clé pour le stockage (string)
- `initialValue`: Valeur initiale (T)

### Retourne
- `value`: Valeur stockée (T)
- `setValue`: Fonction pour mettre à jour la valeur

## useOrders

Hook pour gérer les commandes utilisateur.

```typescript
const {
  orders,
  isLoading,
  createOrder,
  fetchOrders,
  fetchOrderById,
  trackOrder
} = useOrders();
```

### Retourne
- `orders`: Tableau des commandes utilisateur
- `isLoading`: Boolean indiquant si une requête est en cours
- `createOrder`: Fonction pour créer une nouvelle commande
- `fetchOrders`: Fonction pour récupérer toutes les commandes
- `fetchOrderById`: Fonction pour récupérer une commande par son ID
- `trackOrder`: Fonction pour suivre l'état d'une commande

## useFavorites

Hook pour gérer les produits favoris.

```typescript
const {
  favorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite
} = useFavorites();
```

### Retourne
- `favorites`: Tableau des produits favoris
- `addToFavorites`: Fonction pour ajouter un produit aux favoris
- `removeFromFavorites`: Fonction pour retirer un produit des favoris
- `isFavorite`: Fonction pour vérifier si un produit est dans les favoris 