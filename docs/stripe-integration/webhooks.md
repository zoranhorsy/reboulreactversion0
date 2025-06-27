# Webhooks et Événements - Stripe

## Vue d'Ensemble

Cette documentation couvre la configuration et la gestion des webhooks Stripe dans l'application Reboul E-commerce, incluant la gestion des événements, la validation des signatures et les bonnes pratiques.

## Configuration des Webhooks

### 1. Configuration dans le Dashboard Stripe

1. Accéder au [Dashboard Stripe](https://dashboard.stripe.com/webhooks)
2. Cliquer sur "Add endpoint"
3. Configurer l'endpoint :
   - URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `charge.dispute.created`

### 2. Configuration dans l'Application

```typescript
// pages/api/webhooks/stripe.ts
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}
```

## Gestion des Événements

### 1. Checkout Session Completed

```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { customer, payment_intent, metadata } = session;

  // Mettre à jour la commande dans la base de données
  await prisma.order.update({
    where: { id: metadata.orderId },
    data: {
      status: 'PAID',
      paymentIntentId: payment_intent as string,
      customerId: customer as string,
    },
  });

  // Envoyer un email de confirmation
  await sendOrderConfirmationEmail(session);
}
```

### 2. Payment Intent Succeeded

```typescript
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { id, customer, metadata } = paymentIntent;

  // Mettre à jour le statut de paiement
  await prisma.payment.update({
    where: { paymentIntentId: id },
    data: {
      status: 'SUCCEEDED',
    },
  });

  // Mettre à jour le stock
  await updateInventory(metadata.orderId);
}
```

### 3. Payment Intent Failed

```typescript
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id, last_payment_error } = paymentIntent;

  // Mettre à jour le statut de paiement
  await prisma.payment.update({
    where: { paymentIntentId: id },
    data: {
      status: 'FAILED',
      errorMessage: last_payment_error?.message,
    },
  });

  // Notifier le client
  await sendPaymentFailedEmail(paymentIntent);
}
```

### 4. Charge Refunded

```typescript
async function handleChargeRefunded(charge: Stripe.Charge) {
  const { payment_intent, metadata } = charge;

  // Mettre à jour le statut de la commande
  await prisma.order.update({
    where: { id: metadata.orderId },
    data: {
      status: 'REFUNDED',
    },
  });

  // Mettre à jour le stock
  await updateInventory(metadata.orderId, true);
}
```

### 5. Dispute Created

```typescript
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const { payment_intent, metadata } = dispute;

  // Mettre à jour le statut de la commande
  await prisma.order.update({
    where: { id: metadata.orderId },
    data: {
      status: 'DISPUTED',
    },
  });

  // Notifier l'équipe
  await notifyTeamOfDispute(dispute);
}
```

## Bonnes Pratiques

1. **Sécurité**
   - Toujours valider les signatures des webhooks
   - Utiliser HTTPS
   - Limiter les accès à l'endpoint des webhooks

2. **Fiabilité**
   - Implémenter une gestion des erreurs robuste
   - Utiliser des transactions pour les mises à jour de base de données
   - Mettre en place des logs détaillés

3. **Performance**
   - Traiter les webhooks de manière asynchrone
   - Mettre en place des files d'attente pour les tâches longues
   - Optimiser les requêtes de base de données

## Dépannage

### Problèmes Courants

1. **Erreurs de Signature**
   - Vérifier le secret du webhook
   - S'assurer que le corps de la requête n'est pas modifié
   - Vérifier l'encodage des données

2. **Événements Manquants**
   - Vérifier les logs Stripe
   - S'assurer que l'endpoint est accessible
   - Vérifier les timeouts

3. **Erreurs de Base de Données**
   - Vérifier les connexions
   - S'assurer que les transactions sont atomiques
   - Vérifier les contraintes d'intégrité

## Monitoring

1. **Logs**
   - Implémenter des logs détaillés pour chaque événement
   - Stocker les erreurs dans une base de données
   - Mettre en place des alertes pour les erreurs critiques

2. **Métriques**
   - Suivre le nombre d'événements reçus
   - Mesurer les temps de traitement
   - Surveiller les taux d'erreur

3. **Alertes**
   - Configurer des alertes pour les échecs de webhook
   - Notifier l'équipe pour les disputes
   - Surveiller les problèmes de performance 