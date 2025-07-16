import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import config from "@/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fonction utilitaire pour décoder du base64 en environnement serveur (remplace atob)
function decodeBase64(str: string): string {
  // Sur le serveur, Buffer est disponible
  return Buffer.from(str, "base64").toString("utf-8");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
console.log("[Checkout] Initialisation de Stripe...");
console.log(
  "[Checkout] STRIPE_SECRET_KEY présente:",
  !!process.env.STRIPE_SECRET_KEY,
);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Utiliser la dernière version de l'API Stripe
});
console.log("[Checkout] Stripe initialisé avec succès");

// Mapping du taux de TVA Stripe (20% uniquement)
const TAX_RATE_ID = "txr_1RNucECvFAONCF3N6FkHnCwt"; // 20%

function getTaxRateId(item: any) {
  return TAX_RATE_ID;
}

/**
 * Endpoint pour créer une session Stripe Checkout avec plusieurs produits (panier)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("[Checkout] === DÉBUT DE LA REQUÊTE ===");
  try {
    // Récupérer les paramètres de la requête
    let body;
    try {
      body = await request.json();
      console.log(
        "[Checkout] Corps de la requête reçu:",
        JSON.stringify(body, null, 2),
      );
    } catch (error) {
      console.error(
        "[Checkout] Erreur lors du parsing du corps de la requête:",
        error,
      );
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 },
      );
    }

    // Valider les paramètres
    if (
      !body ||
      !body.items ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      console.error("[Checkout] Corps de requête invalide ou items manquants");
      return NextResponse.json(
        { error: "Un tableau d'articles (items) est requis" },
        { status: 400 },
      );
    }

    // Extraire les données avec validation et valeurs par défaut
    const { items } = body;
    const discount_code = body.discount_code || null;
    const cartId = body.cart_id || `cart-${Date.now()}`;
    const shippingMethod = body.shipping_method || "standard";
    // Garder une trace de l'email forcé s'il existe
    const forceUserEmail = body.force_user_email || null;

    // Protéger contre les erreurs de parsing pour items
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Le format des articles est invalide" },
        { status: 400 },
      );
    }

    // Vérification supplémentaire pour s'assurer que chaque item a les propriétés requises
    for (const item of items) {
      if (
        !item.id ||
        !item.name ||
        typeof item.price !== "number" ||
        !item.quantity
      ) {
        return NextResponse.json(
          { error: "Un ou plusieurs articles ont un format invalide" },
          { status: 400 },
        );
      }
    }

    // Calcul du total du panier en centimes
    const total = items.reduce(
      (sum: number, item: any) =>
        sum + Math.round(item.price * 100) * item.quantity,
      0,
    );

    // Définition dynamique des options de livraison
    let shippingOptions = [];

    // Livraison standard gratuite à partir de 200€
    if (total >= 20000) {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "eur" },
          display_name: "Livraison standard (gratuite dès 200€)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      });
    } else {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 590, currency: "eur" },
          display_name: "Livraison standard",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      });
    }

    // Livraison express (toujours proposée)
    shippingOptions.push({
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: 990, currency: "eur" },
        display_name: "Livraison express",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 1 },
          maximum: { unit: "business_day", value: 2 },
        },
      },
    });

    // Retrait en magasin (toujours proposé)
    shippingOptions.push({
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: 0, currency: "eur" },
        display_name: "Retrait en magasin",
        delivery_estimate: {
          minimum: { unit: "business_day", value: 1 },
          maximum: { unit: "business_day", value: 2 },
        },
      },
    });

    // Supprimer l'option Service Coursier
    shippingOptions = shippingOptions.filter(
      (option) =>
        !option.shipping_rate_data?.display_name
          ?.toLowerCase()
          .includes("coursier"),
    );

    console.log(
      `[Checkout] Création d'une session pour ${items.length} produits, panier ${cartId}, livraison ${shippingMethod}`,
    );

    // Récupérer la session utilisateur via Next-Auth (si connecté)
    console.log("[Checkout] Récupération de la session utilisateur...");
    let session,
      userId = null,
      userEmail = null,
      userUsername = null;

    try {
      session = await getServerSession(authOptions);
      userId = session?.user?.id || null;
      userEmail = session?.user?.email || null;
      userUsername = session?.user?.username || null;
      console.log("[DEBUG] Next-Auth session récupérée:", {
        userId,
        userEmail,
        userUsername,
      });
    } catch (sessionError) {
      console.error(
        "[DEBUG] Erreur lors de la récupération de la session Next-Auth:",
        sessionError,
      );
      // Continuer sans erreur, car l'utilisateur pourrait ne pas être connecté
    }

    // SOLUTION - Priorité à l'email forcé s'il existe
    if (forceUserEmail) {
      console.log(`[DEBUG] Utilisation de l'email forcé: ${forceUserEmail}`);
      userEmail = forceUserEmail;
    }

    console.log("[DEBUG] Informations utilisateur finales:", {
      userId,
      userEmail,
      userUsername,
    });

    // Détecter si l'utilisateur est authentifié
    const isAuthenticated = !!(userId && userEmail);

    console.log("[DEBUG] Session utilisateur:", {
      userId,
      userEmail,
      userUsername,
      isAuthenticated,
    });

    // Si l'utilisateur est connecté, on s'assure d'utiliser un customer Stripe existant ou d'en créer un nouveau
    try {
      let stripeCustomer;
      if (userEmail) {
        try {
          // Chercher si un customer existe déjà avec cet email
          const existingCustomers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
          });

          // Utiliser le customer existant ou en créer un nouveau
          if (existingCustomers.data.length > 0) {
            stripeCustomer = existingCustomers.data[0];
            console.log(
              `[Checkout] Customer Stripe existant utilisé: ${stripeCustomer.id}`,
            );
          } else {
            // Créer un nouveau customer avec l'email de l'utilisateur
            stripeCustomer = await stripe.customers.create({
              email: userEmail,
              name: userUsername || undefined,
              metadata: {
                user_id: userId ? String(userId) : null,
              },
            });
            console.log(
              `[Checkout] Nouveau customer Stripe créé: ${stripeCustomer.id}`,
            );
          }
        } catch (error) {
          console.error(
            "[Checkout] Erreur lors de la gestion du customer Stripe:",
            error,
          );
        }
      }

      // Utiliser directement les informations des produits envoyées par le client
      const lineItems = items.map((item: any) => {
        // Filtrer les URLs d'images invalides (relatives ou placeholder)
        let validImages: string[] = [];
        if (item.image && typeof item.image === "string") {
          // Vérifier que l'URL est absolue et valide
          if (
            item.image.startsWith("http://") ||
            item.image.startsWith("https://")
          ) {
            validImages = [item.image];
          }
          // Ignorer les URLs relatives comme "/placeholder.png"
        }

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
              description: item.variant
                ? `Taille: ${item.variant.size || "N/A"}, Couleur: ${item.variant.colorLabel || item.variant.color || "N/A"}`
                : "",
              images: validImages, // Utiliser seulement les images valides
            },
            unit_amount: Math.round(item.price * 100), // Convertir en centimes
          },
          quantity: item.quantity,
          tax_rates: [getTaxRateId(item)], // Ajout du taux de TVA
        };
      });

      // Si un code de réduction est fourni, vérifier et appliquer
      let discount = null;
      if (discount_code) {
        try {
          // Chercher dans les codes promotionnels actifs
          const promotionCodes = await stripe.promotionCodes.list({
            active: true,
            code: discount_code,
            limit: 1,
          });

          if (promotionCodes.data.length > 0) {
            const promotionCode = promotionCodes.data[0];
            discount = { promotion_code: promotionCode.id };
            console.log(
              `Réduction appliquée avec le code promotionnel ${promotionCode.code}`,
            );
          } else {
            // Fallback : chercher directement par ID de coupon
            try {
              const coupon = await stripe.coupons.retrieve(discount_code);
              if (coupon && coupon.valid) {
                discount = { coupon: coupon.id };
                console.log(
                  `Réduction appliquée avec le coupon ${coupon.id}`,
                );
              }
            } catch {
              console.log(`Code de réduction ${discount_code} non trouvé`);
            }
          }
        } catch (error) {
          console.error(
            "Erreur lors de la vérification du code promotionnel:",
            error,
          );
        }
      }

      // Générer un numéro de commande unique
      const timestamp = Date.now();
      const orderNumber = `ORD-${timestamp}`;

      // Enrichir les métadonnées pour s'assurer que l'email de l'utilisateur est bien stocké
      // même si l'utilisateur entre un email différent dans Stripe
      const enrichedMetadata = {
        cartId,
        items: JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            variant: item.variant ? JSON.stringify(item.variant) : null,
          })),
        ),
        shipping_method: shippingMethod,
        discount_code: discount_code || null,
        order_number: orderNumber,
        user_id: userId ? String(userId) : null,
        user_email: userEmail || null,
        user_username: userUsername || null,
        shipping_type: shippingMethod,
        created_timestamp: String(Date.now()),
        is_authenticated_user: isAuthenticated ? "true" : "false",
        account_email: userEmail || "", // Forcer un email même si non détecté
      };

      // Protéger contre les métadonnées trop grandes
      // Stripe limite la taille des métadonnées à 40KB, réduisons-les si nécessaire
      let metadataItemsString = enrichedMetadata.items;
      if (metadataItemsString.length > 1000) {
        // Simplifier les métadonnées des articles si trop volumineux
        enrichedMetadata.items = JSON.stringify(
          items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        );
      }

      // Log des métadonnées pour debugging
      console.log(
        "[DEBUG] Métadonnées envoyées à Stripe:",
        JSON.stringify(enrichedMetadata, null, 2),
      );

      // Créer une session Stripe Checkout avec les paramètres appropriés selon que l'utilisateur est connecté ou non
      const checkoutParams: any = {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        payment_intent_data: {
          capture_method: 'manual', // 🚀 CAPTURE DIFFÉRÉE : Autoriser mais ne pas capturer immédiatement
          setup_future_usage: 'off_session', // Optionnel : pour réutiliser le moyen de paiement
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/cancel`,
        metadata: enrichedMetadata,
        phone_number_collection: {
          enabled: true,
        },
        shipping_address_collection: {
          allowed_countries: ["FR", "BE", "CH", "LU"],
        },
        shipping_options: shippingOptions,
        allow_promotion_codes: true,
      };

      // Ajouter les réductions si définies et valides
      if (discount && (discount.coupon || discount.promotion_code)) {
        checkoutParams.discounts = [discount];
      }

      // Utiliser les métadonnées pour passer l'information au webhook
      if (stripeCustomer) {
        checkoutParams.customer = stripeCustomer.id;
        // Ne pas inclure customer_creation quand on a déjà un customer
      } else if (userEmail) {
        checkoutParams.customer_email = userEmail;
      }

      // Créer la session avec les paramètres préparés
      console.log(
        "[Checkout] Création de la session Stripe avec les paramètres:",
        JSON.stringify(checkoutParams, null, 2),
      );
      try {
        const session = await stripe.checkout.sessions.create(checkoutParams);

        console.log(
          "[Checkout] Session Checkout créée avec succès:",
          session.id,
        );
        console.log("[Checkout] Méthode de livraison:", shippingMethod);

        // Ajouter ces informations dans la réponse pour que le frontend puisse les stocker localement
        // et les utiliser pour associer la commande à l'utilisateur dans l'historique des commandes
        return NextResponse.json({
          url: session.url,
          id: session.id,
          created: session.created,
          expires_at: session.expires_at,
          metadata: {
            orderNumber,
            userEmail: userEmail || null,
          },
        });
      } catch (stripeError: any) {
        // Détails spécifiques pour les erreurs Stripe
        console.error("[Checkout] Erreur Stripe détaillée:", {
          type: stripeError.type,
          code: stripeError.code,
          param: stripeError.param,
          message: stripeError.message,
        });

        let errorStatus = 500;
        let errorMessage =
          "Erreur lors de la création de la session de paiement";

        // Gérer différents types d'erreurs Stripe
        if (stripeError.code === "parameter_invalid_empty") {
          errorStatus = 400;
          errorMessage = `Paramètre invalide: ${stripeError.param}`;
        } else if (stripeError.code === "resource_missing") {
          errorStatus = 404;
          errorMessage = `Ressource introuvable: ${stripeError.param}`;
        } else if (stripeError.code === "rate_limit_exceeded") {
          errorStatus = 429;
          errorMessage = "Trop de requêtes, veuillez réessayer plus tard";
        }

        return NextResponse.json(
          {
            error: errorMessage,
            details: stripeError.message,
            code: stripeError.code,
          },
          { status: errorStatus },
        );
      }
    } catch (error: any) {
      // Erreur non liée à Stripe (erreur de serveur générique)
      console.error("[Checkout] Erreur non gérée:", error);

      // Essayons de donner autant d'informations que possible
      const errorDetails = error.stack
        ? error.stack.split("\n").slice(0, 3).join("\n")
        : error.message;

      return NextResponse.json(
        {
          error: "Erreur serveur",
          details: error.message,
          context: errorDetails,
        },
        { status: 500 },
      );
    }
  } catch (globalError: any) {
    // Bloc de récupération final en cas d'erreur vraiment inattendue
    console.error("[Checkout] Erreur critique:", globalError);
    return NextResponse.json(
      {
        error: "Une erreur critique est survenue",
        message: globalError.message || "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
