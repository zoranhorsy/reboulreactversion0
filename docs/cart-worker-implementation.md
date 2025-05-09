# Documentation Technique - cartWorker

## Présentation

Le `cartWorker` est un Web Worker dédié aux calculs liés au panier d'achat dans l'application Reboul E-commerce. Il permet de décharger le thread principal en effectuant les calculs intensifs dans un thread séparé, améliorant ainsi les performances de l'interface utilisateur.

## Structure

Le système complet comprend trois composants principaux :

1. **Worker (`cartWorker.js`)** : Effectue les calculs liés au panier
2. **Hook (`useCartWorker.ts`)** : Facilite l'utilisation du worker depuis les composants React
3. **Intégration (`CartContext.tsx`)** : Utilise le hook pour intégrer les calculs du worker dans le contexte du panier

## Fonctionnalités

Le `cartWorker` prend en charge les fonctionnalités suivantes :

### 1. Calcul du total du panier

- Somme des prix des articles (quantité × prix unitaire)
- Calcul du nombre total d'articles dans le panier
- Application des frais de livraison en fonction de la méthode choisie
- Application des remises via codes promo

### 2. Codes promo

Le worker gère plusieurs types de codes promo :

| Code | Type | Effet |
|------|------|-------|
| WELCOME10 | Pourcentage | 10% de réduction sur le total |
| SUMMER20 | Pourcentage | 20% de réduction sur le total |
| REBOUL25 | Pourcentage | 25% de réduction sur le total |
| FREE50 | Livraison | Frais de livraison offerts, minimum 50€ d'achat |

### 3. Options de livraison

Plusieurs méthodes de livraison sont disponibles :

| Méthode | Frais | Seuil de gratuité | Temps estimé |
|---------|-------|-------------------|--------------|
| standard | 8€ | 50€ | 3-5 jours |
| express | 15€ | 100€ | 1-2 jours |
| pickup | 0€ | 0€ | Immédiat |

## Implémentation technique

### Structure de données

Le worker attend un message avec la structure suivante :

```typescript
interface CartWorkerMessage {
  type: 'CALCULATE_TOTAL';
  items: CartItem[];
  options: {
    shippingMethod: 'standard' | 'express' | 'pickup';
    discountCode: string | null;
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    colorLabel: string;
    stock: number;
  };
}
```

Et retourne un résultat avec cette structure :

```typescript
interface CartTotals {
  subtotal: number;      // Total des articles avant remise et frais
  shipping: number;      // Frais de livraison
  discount: number;      // Montant de la remise
  total: number;         // Total final (subtotal + shipping - discount)
  itemCount: number;     // Nombre total d'articles
}
```

### Algorithme de calcul

L'algorithme de calcul suit ces étapes :

1. **Calcul du sous-total** : Somme des (prix × quantité) pour chaque article
2. **Calcul du nombre d'articles** : Somme des quantités de tous les articles
3. **Application du code promo** (si applicable) :
   - Codes pourcentage : Réduction du sous-total selon le pourcentage
   - Code FREE50 : Frais de livraison à 0 si le sous-total ≥ 50€
4. **Calcul des frais de livraison** :
   - `standard` : 8€, gratuit si sous-total ≥ 50€
   - `express` : 15€, gratuit si sous-total ≥ 100€
   - `pickup` : Toujours gratuit
5. **Calcul du total final** : sous-total + frais de livraison - remise

### Hook React

Le hook `useCartWorker` simplifie l'utilisation du worker dans les composants React :

```typescript
const { 
  calculateTotals, 
  isCalculating, 
  totals 
} = useCartWorker(cartItems, shippingMethod, discountCode);
```

Il gère :
- La création/terminaison du worker
- La communication avec le worker
- Les états de chargement
- Les fallbacks en cas d'erreur
- La mise en cache des résultats

### Intégration dans CartContext

Le CartContext utilise le hook pour maintenir les totaux à jour :

```typescript
const { totals, isCalculating } = useCartWorker(
  cartItems,
  shippingMethod,
  discountCode
);

// Utilisation des totals dans le contexte
const contextValue = {
  items: cartItems,
  addItem,
  removeItem,
  // ...
  subtotal: totals.subtotal,
  shipping: totals.shipping,
  discount: totals.discount,
  total: totals.total,
  itemCount: totals.itemCount,
  isCalculating
};
```

## Tests

Le `cartWorker` est testé via la page de test dédiée aux workers :

```
http://localhost:3000/tests/workers.html
```

Les tests vérifient :
- Le calcul correct du panier de base
- L'application correcte de tous les codes promo
- Le calcul correct des frais de livraison pour toutes les méthodes
- Les cas limites (panier vide, code promo invalide, etc.)

## Performance

L'utilisation du Web Worker pour les calculs du panier présente plusieurs avantages :
- Élimination du blocage du thread principal pendant les calculs
- Amélioration de la réactivité de l'interface utilisateur
- Réduction du temps de blocage total (TBT)

Des tests de performance ont montré une réduction significative du temps de calcul sur le thread principal, contribuant à l'amélioration générale des Web Vitals de l'application.

## Évolutions futures

Plusieurs améliorations sont envisagées pour les versions futures :

1. Ajout de nouveaux types de codes promo (montant fixe, produit offert, etc.)
2. Support de règles de livraison par région géographique
3. Mise en cache avancée des résultats pour éviter les calculs redondants
4. Système de règles de promotion dynamiques configurables via l'admin 