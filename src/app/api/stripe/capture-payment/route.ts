import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Endpoint pour capturer un paiement Stripe (finaliser la transaction)
 * POST /api/stripe/capture-payment
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stripe Capture] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const { payment_intent_id, amount_to_capture } = body;

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: "payment_intent_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Capture] Capture du PaymentIntent: ${payment_intent_id}`);

    // Récupérer le PaymentIntent pour vérifier son statut
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    console.log(`[Stripe Capture] Statut actuel: ${paymentIntent.status}`);

    // Vérifier que le PaymentIntent peut être capturé
    if (paymentIntent.status !== 'requires_capture') {
      return NextResponse.json(
        { 
          error: `Impossible de capturer ce paiement. Statut actuel: ${paymentIntent.status}`,
          current_status: paymentIntent.status
        },
        { status: 400 }
      );
    }

    // Capturer le paiement
    const capturedPayment = await stripe.paymentIntents.capture(payment_intent_id, {
      amount_to_capture: amount_to_capture || undefined, // Capturer le montant total si non spécifié
    });

    console.log(`[Stripe Capture] ✅ Paiement capturé avec succès: ${capturedPayment.id}`);
    console.log(`[Stripe Capture] Montant capturé: ${capturedPayment.amount_received / 100}€`);

    return NextResponse.json({
      success: true,
      payment_intent: capturedPayment,
      amount_captured: capturedPayment.amount_received / 100,
      currency: capturedPayment.currency,
      status: capturedPayment.status,
    });

  } catch (error: any) {
    console.error("[Stripe Capture] ❌ Erreur lors de la capture:", error);
    
    // Gestion spécifique des erreurs Stripe
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { 
          error: "Erreur de carte bancaire",
          details: error.message,
          code: error.code
        },
        { status: 402 }
      );
    }

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

    return NextResponse.json(
      {
        error: "Erreur lors de la capture du paiement",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 