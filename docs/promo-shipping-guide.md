# Guide de Configuration - Codes Promo et Livraison

## Système de Codes Promo

Le système de codes promo de Reboul E-commerce permet d'offrir diverses réductions à vos clients. Ce document explique comment le système fonctionne et comment le configurer.

### Types de Codes Promo

Notre système supporte actuellement les types de réductions suivants :

1. **Réduction en pourcentage** - Réduit le montant du panier d'un pourcentage spécifié
2. **Livraison gratuite** - Supprime les frais de livraison pour les commandes éligibles
3. **Combinaisons spéciales** - Offres spécifiques basées sur des conditions particulières

### Codes Promo Actuellement Configurés

| Code        | Type de Réduction          | Valeur     | Description                                   |
|-------------|----------------------------|------------|-----------------------------------------------|
| `WELCOME10` | Pourcentage                | 10%        | Réduction de 10% sur l'ensemble du panier    |
| `SUMMER20`  | Pourcentage                | 20%        | Réduction de 20% sur l'ensemble du panier    |
| `REBOUL25`  | Pourcentage                | 25%        | Réduction de 25% sur l'ensemble du panier    |
| `FREE50`    | Livraison gratuite         | -          | Livraison gratuite pour les commandes > 50€   |

### Comment Ajouter ou Modifier des Codes Promo

Les codes promo sont actuellement définis dans le `cartWorker.ts`. Pour ajouter ou modifier des codes :

1. Ouvrez le fichier `src/workers/cartWorker.ts`
2. Localisez la fonction `calculateDiscount()`
3. Ajoutez votre nouveau code dans la structure switch/case :

```typescript
function calculateDiscount(subtotal: number, code?: string): number {
  if (!code) return 0;
  
  switch (code.toUpperCase()) {
    case 'VOTRE_NOUVEAU_CODE':
      return subtotal * 0.15; // 15% de réduction
    // Autres codes...
    default:
      return 0;
  }
}
```

4. Compilez les workers avec `npm run build:workers`

### Implémentation Future

Dans les versions futures, nous prévoyons d'implémenter :

- Interface d'administration pour gérer les codes promo
- Codes à durée limitée
- Codes à usage unique
- Codes applicables à des catégories ou produits spécifiques
- Réductions par paliers (acheter X, obtenir Y)

## Système de Livraison

Le système de livraison de Reboul offre plusieurs options et calcule automatiquement les frais en fonction du montant du panier.

### Options de Livraison Disponibles

| Méthode      | Description                           | Délai Estimé        | Frais                               |
|--------------|---------------------------------------|--------------------|-------------------------------------|
| `standard`   | Livraison standard                    | 3-5 jours ouvrés   | 8€ (gratuit pour commandes > 50€)   |
| `express`    | Livraison rapide                      | 1-2 jours ouvrés   | 15€ (gratuit pour commandes > 100€) |
| `pickup`     | Retrait en boutique                   | Immédiat           | Gratuit                             |

### Calcul des Frais de Livraison

Les frais de livraison sont calculés automatiquement en fonction du montant du panier et de la méthode sélectionnée :

```typescript
function calculateShipping(subtotal: number, method?: string): number {
  switch (method) {
    case 'express':
      return subtotal > 100 ? 0 : 15;
    case 'pickup':
      return 0;
    case 'standard':
    default:
      return subtotal > 50 ? 0 : 8;
  }
}
```

### Délais de Livraison

Les délais indiqués sont estimatifs et dépendent de plusieurs facteurs :

- **Livraison Standard (3-5 jours)** : Délai habituel pour la majorité des commandes en France métropolitaine.
- **Livraison Express (1-2 jours)** : Service premium avec livraison prioritaire, disponible uniquement en France métropolitaine.
- **Retrait en Boutique** : Disponible dès validation de la commande, aux heures d'ouverture des boutiques Reboul.

### Extensions Planifiées

Pour les versions futures, nous prévoyons d'implémenter :

- Intégration avec des API de transporteurs (Colissimo, Chronopost, DHL)
- Calcul de frais de livraison basé sur le poids et la destination
- Suivi de commande en temps réel
- Livraison internationale
- Fenêtres de livraison personnalisables

## Intégration dans le Parcours Client

### Fonctionnement Actuel

1. **Panier** : Le client peut voir le sous-total avant les frais de livraison
2. **Checkout** : 
   - Choix de la méthode de livraison
   - Application des codes promo
   - Affichage des totaux détaillés (sous-total, frais de livraison, réduction, total)

### Comment Modifier l'Interface

Le composant principal gérant l'affichage des informations de livraison et codes promo est en cours de développement.

### Tests

Pour tester différentes configurations de codes promo et méthodes de livraison :

1. Utilisez l'interface utilisateur pour appliquer les codes promo
2. Vérifiez les calculs dans la console (outils de développement du navigateur)
3. Utilisez les méthodes `applyDiscountCode()` et `setShippingMethod()` du CartContext

## Problèmes Connus et Solutions

1. **Codes non appliqués** : Vérifiez la casse (convertie en majuscules automatiquement)
2. **Frais de livraison incorrects** : Validez le montant du panier et la méthode sélectionnée

---

Document mis à jour le : [Date actuelle]  
Contact pour questions : [Email de support technique] 