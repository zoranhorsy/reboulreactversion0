import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  groupProductsByStore, 
  createStripeSessionParams, 
  generateOrderNumber,
  getStoreDisplayInfo,
  STRIPE_ACCOUNTS,
  ProductsByStore,
  type StoreType
} from "@/lib/stripe-connect-helpers";

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Checkout Connect] === DÉBUT DE LA REQUÊTE ===");
  
  try {
    const body = await request.json();
    console.log("[Checkout Connect] Corps de la requête:", JSON.stringify(body, null, 2));

    // Validation des paramètres
    if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.error("[Checkout Connect] Articles manquants ou invalides");
      return NextResponse.json(
        { error: "Un tableau d'articles (items) est requis" },
        { status: 400 }
      );
    }

    const { items } = body;
    const discount_code = body.discount_code || null;
    const shippingMethod = body.shipping_method || "standard";
    const forceUserEmail = body.force_user_email || null;

    // Récupérer la session utilisateur via NextAuth
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email || forceUserEmail;
    const userUsername = session?.user?.username;

    console.log("[Checkout Connect] Session utilisateur:", {
      userId,
      userEmail,
      userUsername,
      isAuthenticated: !!session,
    });

    // **ÉTAPE 1 : Grouper les produits par magasin**
    console.log("[Checkout Connect] Groupement des produits par magasin...");
    const productsByStore = await groupProductsByStore(items);
    
    console.log("[Checkout Connect] Produits groupés:", {
      adult: productsByStore.adult.length,
      sneakers: productsByStore.sneakers.length,
      kids: productsByStore.kids.length,
      the_corner: productsByStore.the_corner.length,
    });

    // Vérifier qu'il y a des produits
    if (productsByStore.adult.length === 0 && productsByStore.sneakers.length === 0 && 
        productsByStore.kids.length === 0 && productsByStore.the_corner.length === 0) {
      return NextResponse.json(
        { error: "Aucun produit valide trouvé" },
        { status: 400 }
      );
    }

    // **ÉTAPE 2 : Créer des sessions Stripe séparées**
    const sessions = [];
    const orderNumbers = [];

    // Paramètres de base pour toutes les sessions
    const baseParams = {
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/cancel`,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU"] },
      allow_promotion_codes: true,
      metadata: {
        user_id: userId ? String(userId) : null,
        user_email: userEmail || null,
        shipping_method: shippingMethod,
        discount_code: discount_code || null,
        created_at: new Date().toISOString(),
      },
    };

    // **ÉTAPE 3 : Créer sessions pour chaque store (architecture complète)**
    const storeKeys: (keyof ProductsByStore)[] = ['adult', 'sneakers', 'kids', 'the_corner'];
    
    for (const storeKey of storeKeys) {
      const storeProducts = productsByStore[storeKey];
      
      if (storeProducts.length > 0) {
        console.log(`[Checkout Connect] Création session ${storeKey}...`);
      
        const orderNumber = generateOrderNumber(storeKey);
        const storeParams = createStripeSessionParams(
          storeProducts,
          storeKey,
        {
          ...baseParams,
          metadata: {
            ...baseParams.metadata,
              order_number: orderNumber,
          },
        }
      );

      // Ajouter customer si disponible
      if (userEmail) {
          storeParams.customer_email = userEmail;
      }

      try {
          const storeSession = await stripe.checkout.sessions.create(storeParams);
        sessions.push({
            store: storeKey as StoreType,
            session: storeSession,
            order_number: orderNumber,
            items: storeProducts,
        });
          orderNumbers.push(orderNumber);
          console.log(`[Checkout Connect] ✅ Session ${storeKey} créée:`, storeSession.id);
      } catch (error) {
          console.error(`[Checkout Connect] ❌ Erreur session ${storeKey}:`, error);
        throw error;
      }
      }
    }

    // **ÉTAPE 5 : Retourner les informations des sessions**
    console.log("[Checkout Connect] Sessions créées avec succès:", sessions.length);

    // Pour l'instant, rediriger vers la première session
    // TODO: Implémenter une page de sélection pour les commandes multiples
    const primarySession = sessions[0];
    
    const response = {
      success: true,
      session_count: sessions.length,
      primary_session: {
        id: primarySession.session.id,
        url: primarySession.session.url,
        store: primarySession.store,
        order_number: primarySession.order_number,
      },
      all_sessions: sessions.map(s => ({
        store: s.store,
        session_id: s.session.id,
        url: s.session.url,
        order_number: s.order_number,
        store_info: getStoreDisplayInfo(s.store),
        item_count: s.items.length,
      })),
      order_numbers: orderNumbers,
      metadata: {
        user_email: userEmail || null,
        total_sessions: sessions.length,
        stores: sessions.map(s => s.store),
      },
    };

    console.log("[Checkout Connect] Réponse:", JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error: any) {
    console.error("[Checkout Connect] Erreur:", error);
    
    let errorMessage = "Erreur lors de la création de la session de paiement";
    let errorStatus = 500;

    if (error.type === 'StripeError') {
      errorMessage = error.message;
      errorStatus = error.statusCode || 500;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code || 'unknown',
      },
      { status: errorStatus }
    );
  }
} 