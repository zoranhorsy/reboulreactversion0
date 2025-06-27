"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    colorLabel?: string;
    stock: number;
  };
  [key: string]: any; // Pour les autres propriétés du panier
}

interface CheckoutButtonProps {
  items: CartItem[];
  cartId?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onCheckoutStart?: () => void;
  onCheckoutSuccess?: (url: string) => void;
  onCheckoutError?: (error: Error) => void;
  shippingMethod?: "standard" | "express" | "pickup";
  discountCode?: string;
}

export default function CheckoutButton({
  items,
  cartId,
  disabled = false,
  className = "",
  label = "Payer maintenant",
  variant = "default",
  size = "default",
  onCheckoutStart,
  onCheckoutSuccess,
  onCheckoutError,
  shippingMethod = "standard",
  discountCode,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Vérifier si le panier est vide
  const isCartEmpty = !items || items.length === 0;

  const handleCheckout = async () => {
    if (isCartEmpty) {
      toast({
        title: "Panier vide",
        description:
          "Votre panier est vide. Ajoutez des produits avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Appeler le callback de début si défini
    if (onCheckoutStart) {
      onCheckoutStart();
    }

    try {
      // Préparer les données complètes pour l'API
      const cartItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variant: {
          size: item.variant.size,
          color: item.variant.color,
          colorLabel: item.variant.colorLabel || item.variant.color,
          stock: item.variant.stock,
        },
      }));

      console.log("Items envoyés à l'API:", cartItems);

      // SOLUTION - Vérifier s'il y a un email de compte à forcer dans la session Stripe
      let userEmail = null;

      // Essayer de récupérer l'email de l'utilisateur depuis localStorage
      if (typeof window !== "undefined") {
        try {
          // D'abord, essayer de récupérer les emails déjà associés
          const stripeEmails = localStorage.getItem("stripe_user_emails");
          if (stripeEmails) {
            try {
              const emails = JSON.parse(stripeEmails);
              if (Array.isArray(emails) && emails.length > 0) {
                // Utiliser le premier email de la liste si disponible
                userEmail = emails[0];
                console.log(
                  "Utilisation d'un email précédemment utilisé pour Stripe:",
                  userEmail,
                );
              }
            } catch (e) {
              console.error("Erreur lors du parsing des emails Stripe:", e);
            }
          }

          // Si pas d'email dans la liste, vérifier le profil utilisateur
          if (!userEmail) {
            const userProfileData = localStorage.getItem("user_profile");
            if (userProfileData) {
              try {
                const profileData = JSON.parse(userProfileData);
                if (profileData && profileData.email) {
                  userEmail = profileData.email;
                  console.log(
                    "Email utilisateur trouvé dans le profil:",
                    userEmail,
                  );
                }
              } catch (e) {
                console.error(
                  "Erreur lors du parsing du profil utilisateur:",
                  e,
                );
              }
            }
          }

          // Si toujours pas d'email, utiliser l'email hardcodé comme fallback
          if (!userEmail) {
            userEmail = "zoran@reboul.com";
            console.log(
              "Utilisation de l'email hardcodé pour Stripe:",
              userEmail,
            );
          }
        } catch (storageError) {
          console.error(
            "Erreur lors de la lecture du localStorage:",
            storageError,
          );
          // Fallback en cas d'erreur
          userEmail = "zoran@reboul.com";
        }
      }

      // Appeler l'API pour créer une session Stripe avec l'email forcé
      console.log(
        `[Checkout] Envoi de la requête avec email forcé: ${userEmail}`,
      );

      const response = await axios.post("/api/checkout/create-cart-session", {
        items: cartItems,
        cart_id: cartId || `cart-${Date.now()}`,
        shipping_method: shippingMethod,
        discount_code: discountCode,
        force_user_email: userEmail, // Ajouter l'email forcé aux données envoyées
      });

      // Vérifier si la réponse contient une URL
      if (response.data && response.data.url) {
        // Stocker l'ID de session pour référence ultérieure
        if (response.data.id) {
          localStorage.setItem("lastStripeSession", response.data.id);
        }

        // Appeler le callback de succès si défini
        if (onCheckoutSuccess) {
          onCheckoutSuccess(response.data.url);
        } else {
          // Sinon, rediriger vers l'URL Stripe
          window.location.href = response.data.url;
        }
      } else {
        throw new Error("URL de paiement non trouvée dans la réponse");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création de la session de paiement:",
        error,
      );

      // Extraire les détails de l'erreur
      let errorMessage =
        "Une erreur est survenue lors de la préparation du paiement.";
      let errorDetails = "";

      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        // Afficher tous les détails disponibles
        if (responseData) {
          if (responseData.error) errorMessage = responseData.error;
          if (responseData.details) errorDetails = responseData.details;
          if (responseData.code)
            errorDetails += ` (Code: ${responseData.code})`;
          if (responseData.context)
            console.error("Contexte de l'erreur:", responseData.context);
        }

        // Log détaillé pour le debugging
        console.error("Détails de l'erreur Axios:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
        if (error.stack) {
          console.error("Stack trace:", error.stack);
        }
      }

      // Afficher l'erreur avec plus de détails pour aider au debugging
      toast({
        title: "Erreur de paiement",
        description: errorDetails
          ? `${errorMessage}: ${errorDetails}`
          : errorMessage,
        variant: "destructive",
      });

      // Appeler le callback d'erreur si défini
      if (onCheckoutError && error instanceof Error) {
        onCheckoutError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading || isCartEmpty}
      onClick={handleCheckout}
    >
      {isLoading ? (
        <>
          <span>⏳</span>
          Chargement...
        </>
      ) : (
        <>
          <span>🛒</span>
          {label}
        </>
      )}
    </Button>
  );
}
