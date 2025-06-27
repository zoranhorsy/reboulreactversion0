import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer les paramètres de la requête avec gestion d'erreur
    let body;
    try {
      body = await request.json();
      console.log("[Proxy Stripe] Corps de la requête:", body);
    } catch (error) {
      console.error(
        "[Proxy Stripe] Erreur lors du parsing du corps de la requête:",
        error,
      );
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 },
      );
    }

    // Vérifier si body existe avant de le déstructurer
    if (!body) {
      console.error("[Proxy Stripe] Corps de requête vide ou invalide");
      return NextResponse.json(
        { error: "Corps de requête vide ou invalide" },
        { status: 400 },
      );
    }

    const productId = body.productId;
    const quantity = body.quantity || 1;

    console.log(
      `[Proxy Stripe] Requête reçue avec productId=${productId}, quantity=${quantity}`,
    );

    if (!productId) {
      console.error("[Proxy Stripe] Erreur: productId manquant");
      return NextResponse.json(
        { error: "productId est requis" },
        { status: 400 },
      );
    }

    // En développement, nous utilisons notre propre API route pour créer un lien de paiement
    const endpoint = `/api/stripe-links/create-payment-link`;

    console.log(`[Proxy Stripe] Relais de la requête vers: ${endpoint}`);
    console.log(`[Proxy Stripe] Données envoyées:`, { productId, quantity });

    // Faire la requête vers notre API route locale avec timeout augmenté
    const response = await axios.post(
      endpoint,
      {
        productId,
        quantity,
      },
      {
        timeout: 15000, // 15 secondes de timeout
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    console.log(`[Proxy Stripe] Réponse reçue:`, response.data);

    // Retourner la réponse du backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("[Proxy Stripe] Erreur détaillée:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });

    // Retourner l'erreur avec le même format que l'API backend
    return NextResponse.json(
      {
        error:
          error.response?.data?.error ||
          "Erreur lors de la communication avec l'API",
        details: error.message,
        statusText: error.response?.statusText,
      },
      { status: error.response?.status || 500 },
    );
  }
}
