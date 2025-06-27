# Options de Livraison - Intégration Stripe

## Vue d'Ensemble

Cette documentation couvre la configuration et l'intégration des options de livraison dans Stripe Checkout pour Reboul E-commerce.

## Configuration des Méthodes de Livraison

### 1. Configuration dans le Dashboard Stripe

1. Allez dans Settings > Shipping and delivery
2. Configurez les méthodes de livraison :
   - Standard (3-5 jours)
   - Express (1-2 jours)
   - Retrait en magasin

### 2. Configuration des Frais

```typescript
const shippingOptions = [
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: {
        amount: 500, // 5.00 EUR
        currency: 'eur',
      },
      display_name: 'Livraison Standard',
      delivery_estimate: {
        minimum: {
          unit: 'business_day',
          value: 3,
        },
        maximum: {
          unit: 'business_day',
          value: 5,
        },
      },
    },
  },
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: {
        amount: 1000, // 10.00 EUR
        currency: 'eur',
      },
      display_name: 'Livraison Express',
      delivery_estimate: {
        minimum: {
          unit: 'business_day',
          value: 1,
        },
        maximum: {
          unit: 'business_day',
          value: 2,
        },
      },
    },
  },
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: {
        amount: 0,
        currency: 'eur',
      },
      display_name: 'Retrait en magasin',
      delivery_estimate: {
        minimum: {
          unit: 'business_day',
          value: 1,
        },
        maximum: {
          unit: 'business_day',
          value: 1,
        },
      },
    },
  },
];
```

## Intégration dans Stripe Checkout

### 1. Configuration de la Session

```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  shipping_address_collection: {
    allowed_countries: ['FR', 'BE', 'CH', 'LU'],
  },
  shipping_options: shippingOptions,
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
});
```

### 2. Gestion des Frais Variables

Pour les frais variables selon le montant de la commande :

```typescript
const getShippingOptions = (cartTotal: number) => {
  const baseOptions = [...shippingOptions];
  
  // Ajuster les frais selon le montant
  if (cartTotal >= 10000) { // 100 EUR
    baseOptions[0].shipping_rate_data.fixed_amount.amount = 0; // Livraison gratuite
  }
  
  return baseOptions;
};
```

## Zones de Livraison

### 1. Configuration des Pays

```typescript
const allowedCountries = ['FR', 'BE', 'CH', 'LU'];

const session = await stripe.checkout.sessions.create({
  // ... autres options
  shipping_address_collection: {
    allowed_countries: allowedCountries,
  },
});
```

### 2. Validation des Adresses

```typescript
const validateShippingAddress = (address: any) => {
  const { country, postal_code } = address;
  
  // Validation spécifique par pays
  switch (country) {
    case 'FR':
      return /^[0-9]{5}$/.test(postal_code);
    case 'BE':
      return /^[0-9]{4}$/.test(postal_code);
    // Autres pays...
    default:
      return true;
  }
};
```

## Gestion des Délais

### 1. Configuration des Délais de Livraison

```typescript
const deliveryEstimates = {
  standard: {
    min: 3,
    max: 5,
    unit: 'business_day',
  },
  express: {
    min: 1,
    max: 2,
    unit: 'business_day',
  },
  store: {
    min: 1,
    max: 1,
    unit: 'business_day',
  },
};
```

### 2. Affichage des Délais

```typescript
const formatDeliveryEstimate = (estimate: any) => {
  const { min, max, unit } = estimate;
  if (min === max) {
    return `${min} ${unit}${min > 1 ? 's' : ''}`;
  }
  return `${min}-${max} ${unit}s`;
};
```

## Tests et Validation

### 1. Tests des Options de Livraison

```typescript
describe('Shipping Options', () => {
  test('should return correct shipping options for cart total', () => {
    const options = getShippingOptions(5000); // 50 EUR
    expect(options[0].shipping_rate_data.fixed_amount.amount).toBe(500);
  });

  test('should return free shipping for orders over 100 EUR', () => {
    const options = getShippingOptions(10000); // 100 EUR
    expect(options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
  });
});
```

### 2. Validation des Adresses

```typescript
describe('Address Validation', () => {
  test('should validate French postal codes', () => {
    const address = { country: 'FR', postal_code: '75001' };
    expect(validateShippingAddress(address)).toBe(true);
  });

  test('should reject invalid postal codes', () => {
    const address = { country: 'FR', postal_code: '123' };
    expect(validateShippingAddress(address)).toBe(false);
  });
});
```

## Bonnes Pratiques

1. **Performance**
   - Mettre en cache les options de livraison
   - Optimiser les calculs de frais
   - Utiliser des web workers pour les calculs lourds

2. **Expérience Utilisateur**
   - Afficher clairement les délais de livraison
   - Permettre le changement d'adresse facilement
   - Fournir des estimations précises

3. **Maintenance**
   - Mettre à jour régulièrement les frais de livraison
   - Monitorer les temps de livraison réels
   - Ajuster les zones de livraison selon les retours

## Dépannage

### Problèmes Courants

1. **Erreurs de Calcul des Frais**
   - Vérifier les montants dans la configuration
   - S'assurer que les conversions sont correctes
   - Valider les règles de frais variables

2. **Problèmes d'Adresse**
   - Vérifier la validation des codes postaux
   - S'assurer que les pays sont correctement configurés
   - Tester les adresses internationales

3. **Erreurs de Session**
   - Vérifier la configuration de la session
   - S'assurer que les options sont valides
   - Valider les URLs de redirection 