import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Utiliser la dernière version de l'API Stripe
});

/**
 * Endpoint pour vérifier le statut d'une session Stripe
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer l'ID de session dans la query string
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("[Stripe Check Session] ID de session manquant");
      return NextResponse.json(
        { error: "ID de session requis" },
        { status: 400 },
      );
    }

    try {
      // Récupérer les détails de la session depuis Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      console.log("[Stripe Check Session] Détails de la session récupérés", {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
      });

      // Vérifier si la session a un client associé
      let customer = null;
      if (session.customer) {
        try {
          customer = await stripe.customers.retrieve(
            session.customer as string,
          );
        } catch (customerError) {
          console.warn(
            "[Stripe Check Session] Erreur lors de la récupération du client:",
            customerError,
          );
        }
      }

      // Préparer les données à retourner
      const sessionData = {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total ? session.amount_total / 100 : 0, // Convertir en euros
        currency: session.currency,
        customer_email:
          session.customer_details?.email ||
          (customer && "email" in customer ? customer.email : null) ||
          null,
        customer_name: session.customer_details?.name || null,
        created: session.created,
        expires_at: session.expires_at,
        metadata: session.metadata || {},
        payment_method_types: session.payment_method_types,
        success_url: session.success_url,
        cancel_url: session.cancel_url,
      };

      return NextResponse.json(sessionData);
    } catch (stripeError: any) {
      console.error("[Stripe Check Session] Erreur Stripe:", stripeError);

      // Vérifier si l'erreur est que la session n'existe pas
      if (stripeError.code === "resource_missing") {
        return NextResponse.json(
          { error: "Session introuvable" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de la session",
          details: stripeError.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("[Stripe Check Session] Erreur non gérée:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
