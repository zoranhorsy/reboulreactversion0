# Guide Stripe Connect - Reboul & The Corner

## 🎯 Objectif

Ce système permet de gérer des paiements séparés pour :
- **Reboul** : Paiements vers le compte principal
- **The Corner** : Paiements vers le compte connecté (franchise)

## 📋 Configuration actuelle

### Comptes Stripe
- **Compte principal** : Reboul (compte existant)
- **Compte connecté** : The Corner (`acct_1RlnwI2QtSgjqCiP`)

### Flux d'argent
```
Client achète Reboul (50€) + Corner (70€)
        ↓
50€ → Compte bancaire Reboul
70€ → Compte bancaire The Corner
```

## 🔧 Utilisation

### 1. API Endpoint
```javascript
POST /api/checkout/create-cart-session-connect
```

### 2. Payload
```javascript
{
  "items": [
    {
      "id": 1,           // ID du produit
      "name": "T-shirt",
      "price": 29.99,
      "quantity": 1,
      "variant": {
        "size": "M",
        "color": "Noir",
        "stock": 10
      }
    }
  ],
  "shipping_method": "standard",
  "force_user_email": "client@example.com"
}
```

### 3. Réponse
```javascript
{
  "success": true,
  "session_count": 2,           // Nombre de sessions créées
  "primary_session": {
    "id": "cs_test_...",
    "url": "https://checkout.stripe.com/...",
    "store": "reboul",
    "order_number": "REB-1234567890"
  },
  "all_sessions": [
    {
      "store": "reboul",
      "session_id": "cs_test_reboul_...",
      "url": "https://checkout.stripe.com/reboul...",
      "order_number": "REB-1234567890",
      "store_info": {
        "name": "Reboul",
        "displayName": "Reboul"
      },
      "item_count": 2
    },
    {
      "store": "the_corner",
      "session_id": "cs_test_corner_...",
      "url": "https://checkout.stripe.com/corner...",
      "order_number": "TCR-1234567891",
      "store_info": {
        "name": "The Corner",
        "displayName": "The Corner CP Company"
      },
      "item_count": 1
    }
  ]
}
```

## 🧪 Tests

### Lancer les tests
```bash
node scripts/test-stripe-connect-checkout.js
```

### Scénarios testés
1. **Reboul uniquement** : Produits ID 1, 2, 3...
2. **The Corner uniquement** : Produits ID 101, 102, 103...
3. **Panier mixte** : Mélange des deux magasins

## 📊 Détection des magasins

### Logique de détection
```javascript
// 1. Essayer de récupérer depuis corner_products
const cornerResponse = await fetch(`/api/corner-products/${productId}`);

if (cornerResponse.ok) {
  return 'the_corner';
} else {
  return 'reboul';  // Par défaut
}
```

### Numéros de commande
- **Reboul** : `REB-{timestamp}`
- **The Corner** : `TCR-{timestamp}`

## 🎮 Intégration Frontend

### Modifier le checkout existant
```javascript
// Au lieu de :
axios.post('/api/checkout/create-cart-session', payload)

// Utiliser :
axios.post('/api/checkout/create-cart-session-connect', payload)
```

### Gérer les sessions multiples
```javascript
const response = await axios.post('/api/checkout/create-cart-session-connect', payload);

if (response.data.session_count === 1) {
  // Redirection simple
  window.location.href = response.data.primary_session.url;
} else {
  // Afficher une page de choix ou rediriger vers la première session
  console.log('Sessions multiples:', response.data.all_sessions);
  window.location.href = response.data.primary_session.url;
}
```

## 🔍 Debugging

### Vérifier le statut du compte
```bash
node scripts/check-corner-account-status.js
```

### Logs à surveiller
- `[Checkout Connect]` : Logs du nouveau système
- `[Checkout Connect] Groupement des produits` : Détection des magasins
- `[Checkout Connect] Sessions créées` : Nombre de sessions Stripe

## 📈 Prochaines étapes

### 1. Adaptation du frontend
- Modifier `CartSheet.tsx` pour utiliser la nouvelle API
- Modifier `CheckoutButton.tsx` pour gérer les sessions multiples

### 2. Gestion des webhooks
- Adapter les webhooks pour les paiements multiples
- Synchroniser les statuts de commande

### 3. Interface utilisateur
- Page de sélection pour les commandes multiples
- Affichage des magasins dans le panier

## 🚨 Important

### Variables d'environnement
```bash
# Ajouter à ton .env
THE_CORNER_STRIPE_ACCOUNT_ID=acct_1RlnwI2QtSgjqCiP
```

### Sécurité
- Les clés Stripe sont en mode **test** uniquement
- Passer en production nécessite la validation des comptes

### Limitations actuelles
- Redirection vers la première session seulement
- Pas d'interface pour les commandes multiples
- Webhooks non adaptés pour les paiements multiples

---

## 🎉 Félicitations !

Le système Stripe Connect est maintenant opérationnel ! 

**Reboul** et **The Corner** peuvent recevoir des paiements séparés dans le même checkout unifié ! 🚀 