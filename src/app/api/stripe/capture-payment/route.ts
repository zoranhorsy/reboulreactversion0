import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Configuration des comptes Stripe Connect
const STRIPE_ACCOUNTS = {
  THE_CORNER: 'acct_1RlnwI2QtSgjqCiP',
} as const;

/**
 * Fonction pour gérer les transferts automatiques vers The Corner
 */
async function handleStoreTransfers(paymentIntentId: string) {
  try {
    console.log(`[Stripe Transfer] Recherche des transferts pour PaymentIntent: ${paymentIntentId}`);
    
    // Récupérer le PaymentIntent et ses métadonnées
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Récupérer la session associée pour obtenir les métadonnées
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });
    
    if (sessions.data.length === 0) {
      console.log(`[Stripe Transfer] Aucune session trouvée pour PaymentIntent: ${paymentIntentId}`);
      return { success: false, error: "Session non trouvée" };
    }
    
    const session = sessions.data[0];
    const metadata = session.metadata || {};
    
    console.log(`[Stripe Transfer] Métadonnées de la session:`, metadata);
    
    // Parse les items et les stores_involved
    let items = [];
    let storesInvolved = {};
    
    try {
      if (metadata.items) {
        items = JSON.parse(metadata.items);
      }
      if (metadata.stores_involved) {
        storesInvolved = JSON.parse(metadata.stores_involved);
      }
    } catch (parseError) {
      console.error(`[Stripe Transfer] Erreur parsing métadonnées:`, parseError);
      return { success: false, error: "Erreur parsing métadonnées" };
    }
    
    console.log(`[Stripe Transfer] Produits analysés:`, { items, storesInvolved });
    
    // Vérifier s'il y a des produits The Corner
    const cornerItems = items.filter((item: any) => item.store === 'the_corner');
    
    if (cornerItems.length === 0) {
      console.log(`[Stripe Transfer] Aucun produit The Corner, pas de transfert nécessaire`);
      return { success: true, message: "Pas de transfert nécessaire" };
    }
    
    // Calculer le montant à transférer pour The Corner
    // Approche simplifiée : récupérer les line_items de la session
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    });
    
    const lineItems = sessionWithLineItems.line_items?.data || [];
    
    // Calculer le montant total pour les produits The Corner
    let cornerAmount = 0;
    
    // Approche plus robuste : identifier tous les line items The Corner
    const cornerLineItems = lineItems.filter((lineItem: any) => 
      lineItem.description?.includes('🏬 The Corner') || 
      lineItem.description?.includes('The Corner')
    );
    
    console.log(`[Stripe Transfer] Line items The Corner trouvés:`, cornerLineItems.map(item => ({
      id: item.id,
      description: item.description,
      amount_total: item.amount_total
    })));
    
    // Calculer le montant total pour The Corner
    for (const lineItem of cornerLineItems) {
      cornerAmount += lineItem.amount_total || 0;
      console.log(`[Stripe Transfer] Line item ${lineItem.id}: ${(lineItem.amount_total || 0) / 100}€`);
    }
    
    // Fallback : si on ne trouve pas les line_items, utiliser une proportion
    if (cornerAmount === 0 && cornerItems.length > 0) {
      const totalItems = items.length;
      const cornerItemsCount = cornerItems.length;
      const proportion = cornerItemsCount / totalItems;
      cornerAmount = Math.round(paymentIntent.amount * proportion);
      console.log(`[Stripe Transfer] Utilisation du calcul proportionnel: ${cornerAmount / 100}€`);
    }
    
    console.log(`[Stripe Transfer] Montant à transférer à The Corner: ${cornerAmount / 100}€`);
    
    if (cornerAmount <= 0) {
      console.log(`[Stripe Transfer] Montant invalide: ${cornerAmount}`);
      return { success: false, error: "Montant invalide" };
    }
    
    // Créer le transfert vers The Corner
    const transfer = await stripe.transfers.create({
      amount: cornerAmount,
      currency: 'eur',
      destination: STRIPE_ACCOUNTS.THE_CORNER,
      transfer_group: `order_${metadata.order_number}`,
      metadata: {
        order_number: metadata.order_number,
        payment_intent_id: paymentIntentId,
        store: 'the_corner',
        items_count: cornerItems.length,
        user_email: metadata.user_email || '',
      },
    });
    
    console.log(`[Stripe Transfer] ✅ Transfert créé avec succès:`, {
      id: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency,
      destination: transfer.destination,
    });
    
    return { 
      success: true, 
      transfer: {
        id: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        destination: transfer.destination,
      }
    };
    
  } catch (error: any) {
    console.error(`[Stripe Transfer] ❌ Erreur lors du transfert:`, error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}

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

    // 🚀 **ÉTAPE 2 : TRANSFERTS AUTOMATIQUES VERS THE CORNER**
    console.log(`[Stripe Capture] Déclenchement des transferts automatiques...`);
    const transferResult = await handleStoreTransfers(payment_intent_id);

    return NextResponse.json({
      success: true,
      payment_intent: capturedPayment,
      amount_captured: capturedPayment.amount_received / 100,
      currency: capturedPayment.currency,
      status: capturedPayment.status,
      // Informations sur les transferts
      transfer: transferResult.success ? transferResult.transfer : null,
      transfer_status: transferResult.success ? 'completed' : 'failed',
      transfer_error: transferResult.success ? null : transferResult.error,
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