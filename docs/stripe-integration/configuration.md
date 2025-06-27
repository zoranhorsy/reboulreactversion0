# Configuration de Base - Intégration Stripe

## Installation

### Dépendances

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Configuration
STRIPE_CURRENCY=eur  # L'euro est la seule devise supportée
STRIPE_COUNTRY=FR
```

## Configuration du Backend

### Initialisation de Stripe

Dans `lib/stripe.ts` :

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

### Configuration des Webhooks

Dans `pages/api/webhooks/stripe.ts` :

```typescript
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ message: 'Missing stripe signature' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Traitement des événements
    switch (event.type) {
      case 'checkout.session.completed':
        // Traitement du paiement réussi
        break;
      case 'payment_intent.succeeded':
        // Traitement du paiement confirmé
        break;
      // Autres événements...
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ message: 'Webhook error' });
  }
}
```

## Configuration du Frontend

### Initialisation du Client Stripe

Dans `lib/stripe-client.ts` :

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};
```

### Configuration des Composants

Dans `components/stripe/StripeProvider.tsx` :

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

## Configuration des Options de Paiement

### Méthodes de Paiement

Dans le dashboard Stripe :
1. Allez dans Settings > Payment methods
2. Activez les méthodes souhaitées (cartes, Apple Pay, etc.)
3. Configurez les règles de paiement par pays

### Devises Supportées

Dans le dashboard Stripe :
1. Allez dans Settings > Business settings
2. Configurez uniquement l'euro (EUR) comme devise supportée
3. Désactivez toutes les autres devises

## Bonnes Pratiques

1. **Sécurité**
   - Ne jamais exposer les clés secrètes côté client
   - Toujours vérifier les signatures des webhooks
   - Utiliser HTTPS en production

2. **Performance**
   - Charger Stripe.js de manière asynchrone
   - Utiliser le lazy loading pour les composants non critiques
   - Mettre en cache les sessions de paiement

3. **Maintenance**
   - Garder les dépendances à jour
   - Monitorer les logs Stripe
   - Tester régulièrement les webhooks

## Dépannage

### Problèmes Courants

1. **Erreur de signature webhook**
   - Vérifier que le secret est correct
   - S'assurer que la requête n'est pas modifiée

2. **Erreur de clé API**
   - Vérifier les variables d'environnement
   - S'assurer que les clés sont valides

3. **Problèmes de CORS**
   - Vérifier les headers de la requête
   - Configurer correctement les domaines autorisés

### Logs et Monitoring

1. **Dashboard Stripe**
   - Voir les événements en temps réel
   - Vérifier les logs d'erreur
   - Monitorer les performances

2. **Logs Application**
   - Vérifier les logs serveur
   - Monitorer les erreurs client
   - Tracer les transactions 