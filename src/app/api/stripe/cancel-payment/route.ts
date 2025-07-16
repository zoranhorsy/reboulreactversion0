import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Endpoint pour annuler un paiement Stripe (libérer l'autorisation)
 * POST /api/stripe/cancel-payment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stripe Cancel] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const { payment_intent_id, cancellation_reason } = body;

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: "payment_intent_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Cancel] Annulation du PaymentIntent: ${payment_intent_id}`);

    // Récupérer le PaymentIntent pour vérifier son statut
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    console.log(`[Stripe Cancel] Statut actuel: ${paymentIntent.status}`);

    // Vérifier que le PaymentIntent peut être annulé
    if (!['requires_payment_method', 'requires_capture', 'requires_confirmation', 'requires_action'].includes(paymentIntent.status)) {
      return NextResponse.json(
        { 
          error: `Impossible d'annuler ce paiement. Statut actuel: ${paymentIntent.status}`,
          current_status: paymentIntent.status
        },
        { status: 400 }
      );
    }

    // Annuler le PaymentIntent
    const cancelledPayment = await stripe.paymentIntents.cancel(payment_intent_id, {
      cancellation_reason: cancellation_reason || 'requested_by_customer', // Raison par défaut
    });

    console.log(`[Stripe Cancel] ✅ Paiement annulé avec succès: ${cancelledPayment.id}`);
    console.log(`[Stripe Cancel] Raison: ${cancellation_reason || 'requested_by_customer'}`);

    return NextResponse.json({
      success: true,
      payment_intent: cancelledPayment,
      status: cancelledPayment.status,
      cancellation_reason: cancelledPayment.cancellation_reason,
      amount: cancelledPayment.amount / 100,
      currency: cancelledPayment.currency,
    });

  } catch (error: any) {
    console.error("[Stripe Cancel] ❌ Erreur lors de l'annulation:", error);
    
    // Gestion spécifique des erreurs Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: "Requête invalide",
          details: error.message,
          code: error.code
        },
        { status: 400 }
      );
    }

    if (error.code === 'payment_intent_unexpected_state') {
      return NextResponse.json(
        { 
          error: "Le paiement ne peut pas être annulé dans son état actuel",
          details: error.message,
          code: error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'annulation du paiement",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 