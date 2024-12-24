import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
    try {
        const { amount, items } = await req.json();

        // Vérification des données reçues
        if (!amount || amount <= 0 || !items || items.length === 0) {
            return NextResponse.json({ error: { message: 'Données de commande invalides' } }, { status: 400 });
        }

        // Création de l'intention de paiement
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'eur',
            metadata: {
                order_items: JSON.stringify(items),
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Erreur lors de la création de l\'intention de paiement:', error);
        return NextResponse.json(
            { error: { message: 'Une erreur est survenue lors de la création de l\'intention de paiement' } },
            { status: 500 }
        );
    }
}

