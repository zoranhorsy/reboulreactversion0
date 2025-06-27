import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Utiliser la dernière version de l'API Stripe
});

/**
 * Endpoint pour récupérer les détails d'une session Stripe Checkout
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer l'ID de session depuis les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      console.error("[Session] Paramètre id manquant");
      return NextResponse.json(
        { error: "Le paramètre id est requis" },
        { status: 400 },
      );
    }

    console.log(
      `[Session] Récupération des détails pour la session ${sessionId}`,
    );

    // Récupérer les détails de la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log(`[Session] Détails récupérés pour ${sessionId}`);

    // Retourner les détails nécessaires au frontend
    return NextResponse.json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customer_email: session.customer_details?.email || session.customer_email,
      customer_name: session.customer_details?.name,
      created: session.created,
      expires_at: session.expires_at,
      metadata: session.metadata,
      payment_method_types: session.payment_method_types,
      success_url: session.success_url,
      cancel_url: session.cancel_url,
    });
  } catch (error: any) {
    console.error("[Session] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des détails de la session",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
