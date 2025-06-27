import React, { useState } from "react";
import axios from "axios";

/**
 * Bouton "Acheter maintenant" qui génère un Payment Link Stripe à la volée
 *
 * @param {Object} props
 * @param {string|number} props.productId - ID du produit à acheter
 * @param {number} props.quantity - Quantité à acheter (défaut: 1)
 * @param {string} props.className - Classes CSS additionnelles
 * @param {string} props.label - Texte du bouton (défaut: "Acheter maintenant")
 * @param {string} props.size - Taille du bouton ('sm', 'md', 'lg') (défaut: 'md')
 * @param {string} props.variant - Variante du bouton ('default', 'outline', 'ghost') (défaut: 'default')
 */
const BuyNowButton = ({
  productId,
  quantity = 1,
  className = "",
  label = "Acheter maintenant",
  size = "md",
  variant = "default",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuyNow = async () => {
    if (!productId) {
      setError("ID de produit manquant");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Toujours utiliser la route API locale pour le client Next.js
      const endpoint = "/api/stripe-links/create-payment-link";

      console.log("Création du lien de paiement via:", endpoint);

      // Préparer les données à envoyer
      const data = {
        productId: String(productId), // Assurer que c'est une chaîne de caractères
        quantity: Number(quantity) || 1, // Assurer que c'est un nombre
      };

      console.log("Données envoyées:", data);

      const response = await axios.post(endpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Vérifier si la réponse contient une URL
      if (response.data && response.data.url) {
        // Stocker l'ID de session dans le localStorage pour le récupérer sur la page de succès
        if (response.data.id) {
          localStorage.setItem("lastStripeSession", response.data.id);
        }

        // Rediriger vers le lien de paiement Stripe
        console.log("Redirection vers:", response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error("Réponse sans URL:", response.data);
        setError("Réponse invalide du serveur: URL de paiement manquante");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erreur lors de la création du lien de paiement:", err);

      // Log détaillé de l'erreur
      if (err.response) {
        console.error("Détails de l'erreur de réponse:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });

        // Message d'erreur plus précis
        const serverError =
          err.response.data?.error || err.response.data?.details;
        setError(
          serverError ||
            `Erreur serveur (${err.response.status}): Impossible de créer le lien de paiement`,
        );
      } else if (err.request) {
        // La requête a été envoyée mais aucune réponse n'a été reçue
        console.error("Pas de réponse reçue:", err.request);
        setError(
          "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet.",
        );
      } else {
        // Erreur lors de la préparation de la requête
        setError(`Erreur: ${err.message}`);
      }

      setIsLoading(false);
    }
  };

  // Déterminer les classes CSS en fonction de la taille et de la variante
  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4",
    lg: "py-3 px-6 text-lg",
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
  };

  const buttonClasses = `
    buy-now-button 
    ${sizeClasses[size] || sizeClasses.md} 
    ${variantClasses[variant] || variantClasses.default} 
    ${className} 
    ${isLoading ? "opacity-70 cursor-wait" : ""}
    rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  `;

  return (
    <div className="buy-now-container">
      <button
        className={buttonClasses}
        onClick={handleBuyNow}
        disabled={isLoading || !productId}
      >
        {isLoading ? "Chargement..." : label}
      </button>

      {error && <div className="text-destructive text-sm mt-2">{error}</div>}
    </div>
  );
};

export default BuyNowButton;
