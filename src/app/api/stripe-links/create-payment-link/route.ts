import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import config from "@/config";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Utiliser la dernière version de l'API Stripe
});

// Mapping du taux de TVA Stripe (20% uniquement)
const TAX_RATE_ID = "txr_1RNucECvFAONCF3N6FkHnCwt"; // 20%

function getTaxRateId(productData: any) {
  return TAX_RATE_ID;
}

/**
 * Endpoint pour créer un lien de paiement Stripe à la volée
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer les paramètres de la requête
    let body;
    try {
      body = await request.json();
      console.log("[Stripe Links] Corps de la requête:", body);
    } catch (error) {
      console.error(
        "[Stripe Links] Erreur lors du parsing du corps de la requête:",
        error,
      );
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 },
      );
    }

    // Valider les paramètres
    if (!body || !body.productId) {
      console.error(
        "[Stripe Links] Corps de requête invalide ou productId manquant",
      );
      return NextResponse.json(
        { error: "productId est requis" },
        { status: 400 },
      );
    }

    const productId = body.productId;
    const quantity = body.quantity || 1;

    console.log(
      `[Stripe Links] Création d'un lien pour le produit ${productId}, quantité ${quantity}`,
    );

    try {
      // Récupérer les informations du produit depuis notre base de données
      const productData = await getProductData(productId);

      if (!productData) {
        console.error(`[Stripe Links] Produit non trouvé: ${productId}`);
        return NextResponse.json(
          { error: "Produit non trouvé" },
          { status: 404 },
        );
      }

      // Calcul du total (prix * quantité) en centimes
      const total = Math.round(productData.price * 100) * quantity;

      // Récupérer la session utilisateur (si connecté)
      const authSession = await getServerSession(authOptions);
      const userId = authSession?.user?.id || null;

      // Définition dynamique des options de livraison
      let shippingOptions = [];

      // Livraison standard gratuite à partir de 200€
      if (total >= 20000) {
        shippingOptions.push({
          shipping_rate_data: {
            type: "fixed_amount" as const,
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Livraison standard (gratuite dès 200€)",
            delivery_estimate: {
              minimum: { unit: "business_day" as const, value: 3 },
              maximum: { unit: "business_day" as const, value: 5 },
            },
          },
        });
      } else {
        shippingOptions.push({
          shipping_rate_data: {
            type: "fixed_amount" as const,
            fixed_amount: { amount: 590, currency: "eur" },
            display_name: "Livraison standard",
            delivery_estimate: {
              minimum: { unit: "business_day" as const, value: 3 },
              maximum: { unit: "business_day" as const, value: 5 },
            },
          },
        });
      }

      // Livraison express (toujours proposée)
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 990, currency: "eur" },
          display_name: "Livraison express",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 1 },
            maximum: { unit: "business_day" as const, value: 2 },
          },
        },
      });

      // Retrait en magasin (toujours proposé)
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: 0, currency: "eur" },
          display_name: "Retrait en magasin",
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 1 },
            maximum: { unit: "business_day" as const, value: 2 },
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

      // Générer un numéro de commande unique
      const timestamp = Date.now();
      const orderNumber = `ORD-${timestamp}`;

      // Créer une session Stripe Checkout
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: productData.name,
                description: productData.description || "",
                images:
                  productData.images && productData.images.length > 0
                    ? [productData.images[0]]
                    : [],
              },
              unit_amount: Math.round(productData.price * 100), // Convertir en centimes
            },
            quantity: quantity,
            tax_rates: [getTaxRateId(productData)], // Ajout du taux de TVA
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/cancel`,
        metadata: {
          productId,
          quantity,
          order_number: orderNumber,
          user_id: userId ? String(userId) : null,
        },
        phone_number_collection: {
          enabled: true,
        },
        // Limitation des pays de livraison
        shipping_address_collection: {
          allowed_countries: ["FR", "BE", "CH", "LU"],
        },
        // Champs personnalisés
        custom_fields: [
          {
            type: "text",
            key: "instructions",
            label: { type: "custom", custom: "Instructions de livraison" },
            optional: true,
          },
          {
            type: "text",
            key: "info",
            label: { type: "custom", custom: "Message Reboul" },
            optional: true,
          },
        ],
        shipping_options: shippingOptions,
        allow_promotion_codes: true, // Permettre l'utilisation de codes promo
      });

      console.log("[Stripe Links] Session Checkout créée:", checkoutSession.id);

      // Retourner l'URL de la session
      return NextResponse.json({
        url: checkoutSession.url,
        id: checkoutSession.id,
        created: checkoutSession.created,
        expires_at: checkoutSession.expires_at,
      });
    } catch (stripeError: any) {
      console.error("[Stripe Links] Erreur Stripe:", stripeError);
      return NextResponse.json(
        {
          error: "Erreur lors de la création du lien de paiement",
          details: stripeError.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("[Stripe Links] Erreur non gérée:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * Fonction pour récupérer les données d'un produit depuis l'API ou le mock
 */
async function getProductData(productId: string) {
  try {
    // Essayer d'abord de récupérer depuis l'API
    try {
      // Utiliser un fetch à l'API interne
      const apiUrl = `${config.urls.api}/products/${productId}`;
      console.log(
        `[Stripe Links] Tentative de récupération du produit depuis: ${apiUrl}`,
      );

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const product = await response.json();
        console.log(`[Stripe Links] Produit récupéré depuis l'API:`, product);

        // Formater les images si elles sont stockées en JSON
        let images = product.images || [];
        if (typeof images === "string") {
          try {
            images = JSON.parse(images);
          } catch (e) {
            console.warn(
              `[Stripe Links] Impossible de parser les images JSON pour le produit ${productId}`,
            );
            images = [];
          }
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || `Produit Reboul: ${product.name}`,
          price: product.price,
          images: Array.isArray(images) ? images : [],
          slug: product.slug || `produit-${product.id}`,
        };
      } else {
        // Si 404, essayer avec les produits corner
        if (response.status === 404) {
          console.log(
            `[Stripe Links] Produit standard non trouvé, essai avec produit corner`,
          );
          const cornerApiUrl = `${config.urls.api}/corner-products/${productId}`;

          const cornerResponse = await fetch(cornerApiUrl, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (cornerResponse.ok) {
            const cornerProduct = await cornerResponse.json();
            console.log(
              `[Stripe Links] Produit corner récupéré depuis l'API:`,
              cornerProduct,
            );

            // Formater les images
            let images = cornerProduct.images || [];
            if (typeof images === "string") {
              try {
                images = JSON.parse(images);
              } catch (e) {
                images = [];
              }
            }

            return {
              id: cornerProduct.id,
              name: cornerProduct.name,
              description:
                cornerProduct.description ||
                `The Corner: ${cornerProduct.name}`,
              price: cornerProduct.price,
              images: Array.isArray(images) ? images : [],
              slug: cornerProduct.slug || `corner-${cornerProduct.id}`,
            };
          }
        }

        // Si aucune requête API ne réussit, utiliser des données factices
        console.warn(
          `[Stripe Links] API indisponible (${response.status}), utilisation de données factices`,
        );
      }
    } catch (apiError) {
      console.error(`[Stripe Links] Erreur API:`, apiError);
    }

    // Données factices en dernier recours
    console.warn(
      `[Stripe Links] Utilisation de données factices pour le produit ${productId}`,
    );
    return {
      id: productId,
      name: `Reboul Produit #${productId}`,
      description: `Description détaillée du produit #${productId}`,
      price: 99.95, // Prix en euros
      images: ["https://via.placeholder.com/400x300?text=Reboul+Product"],
    };
  } catch (error) {
    console.error(
      `[Stripe Links] Erreur lors de la récupération du produit ${productId}:`,
      error,
    );
    return null;
  }
}
