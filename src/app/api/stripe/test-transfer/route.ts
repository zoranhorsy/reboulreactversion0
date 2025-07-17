import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Endpoint pour tester les transferts Stripe Connect
 * POST /api/stripe/test-transfer
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Stripe Test Transfer] === DÉBUT DU TEST ===");
  
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id est requis" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Test Transfer] Test avec session: ${session_id}`);

    // Récupérer la session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items']
    });

    console.log(`[Stripe Test Transfer] Session trouvée:`, {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      amount_total: session.amount_total,
    });

    // Vérifier les métadonnées
    const metadata = session.metadata || {};
    console.log(`[Stripe Test Transfer] Métadonnées:`, metadata);

    // Vérifier les line_items
    const lineItems = session.line_items?.data || [];
    console.log(`[Stripe Test Transfer] Line items:`, lineItems.map(item => ({
      id: item.id,
      description: item.description,
      amount_total: item.amount_total,
      quantity: item.quantity,
    })));

    // Parse les items
    let items = [];
    try {
      if (metadata.items) {
        items = JSON.parse(metadata.items);
      }
    } catch (e) {
      console.error(`[Stripe Test Transfer] Erreur parsing items:`, e);
    }

    console.log(`[Stripe Test Transfer] Items parsés:`, items);

    // Identifier les produits The Corner
    const cornerItems = items.filter((item: any) => item.store === 'the_corner');
    console.log(`[Stripe Test Transfer] Produits The Corner:`, cornerItems);

    // Calculer le montant à transférer
    let cornerAmount = 0;
    
    // Approche plus robuste : identifier tous les line items The Corner
    const cornerLineItems = lineItems.filter((lineItem: any) => 
      lineItem.description?.includes('🏬 The Corner') || 
      lineItem.description?.includes('The Corner')
    );
    
    console.log(`[Stripe Test Transfer] Line items The Corner trouvés:`, cornerLineItems.map(item => ({
      id: item.id,
      description: item.description,
      amount_total: item.amount_total
    })));
    
    // Calculer le montant total pour The Corner
    for (const lineItem of cornerLineItems) {
      cornerAmount += lineItem.amount_total || 0;
      console.log(`[Stripe Test Transfer] Line item ${lineItem.id}: ${(lineItem.amount_total || 0) / 100}€`);
    }

    console.log(`[Stripe Test Transfer] Montant total à transférer: ${cornerAmount / 100}€`);

    return NextResponse.json({
      success: true,
      session_id: session.id,
      payment_status: session.payment_status,
      total_amount: session.amount_total ? session.amount_total / 100 : 0,
      metadata: metadata,
      items: items,
      corner_items: cornerItems,
      corner_amount: cornerAmount / 100,
      line_items: lineItems.map(item => ({
        id: item.id,
        description: item.description,
        amount_total: item.amount_total ? item.amount_total / 100 : 0,
      })),
    });

  } catch (error: any) {
    console.error("[Stripe Test Transfer] ❌ Erreur:", error);
    
    return NextResponse.json(
      {
        error: "Erreur lors du test de transfert",
        details: error.message,
      },
      { status: 500 }
    );
  }
} 