import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Endpoint pour récupérer un PaymentIntent depuis une Session ID Stripe
 * POST /api/stripe/get-payment-intent
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stripe Get PaymentIntent] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Get PaymentIntent] Récupération de la session: ${session_id}`);

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    console.log(`[Stripe Get PaymentIntent] Session trouvée:`, {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
    });

    // Vérifier que la session a un PaymentIntent
    if (!session.payment_intent) {
      return NextResponse.json(
        { 
          error: "Aucun PaymentIntent trouvé pour cette session",
          session_id: session.id,
          payment_status: session.payment_status
        },
        { status: 404 }
      );
    }

    // Récupérer les détails du PaymentIntent
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(`[Stripe Get PaymentIntent] ✅ PaymentIntent récupéré:`, {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      },
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        capture_method: paymentIntent.capture_method,
        confirmation_method: paymentIntent.confirmation_method,
      },
    });

  } catch (error: any) {
    console.error("[Stripe Get PaymentIntent] ❌ Erreur:", error);
    
    // Gestion spécifique des erreurs Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: "Session ID invalide",
          details: error.message,
          code: error.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du PaymentIntent",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 