"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/lib/api";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import { Viewport } from "next";
import { LoaderComponent } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";

// Page de redirection automatique vers le bon shop
const RedirectingLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 text-center">
    <LoaderComponent />
    <h2 className="text-xl font-semibold mb-4 mt-6">Redirection en cours...</h2>
    <p className="text-zinc-600 dark:text-zinc-400">
      Nous vous redirigeons vers la page du produit dans le bon univers.
    </p>
  </div>
);

const ErrorFallback = ({ onRetry, onGoHome }: { onRetry: () => void; onGoHome: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 text-center">
    <div className="mb-6 text-red-500">
      <span>⚠️</span>
    </div>
    <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
    <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
      Le produit que vous recherchez n&apos;existe pas ou a été supprimé.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button onClick={onRetry} variant="default">
        Réessayer
      </Button>
      <Button onClick={onGoHome} variant="outline">
        Retour à l&apos;accueil
      </Button>
    </div>
  </div>
);

export const viewport: Viewport = defaultViewport;

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fonction pour détecter le store_type et rediriger
  const detectAndRedirect = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      // Récupérer le produit pour connaître son store_type
      const product = await getProductById(id);

      if (!product) {
        throw new Error("Produit non trouvé");
      }

      console.log("Produit détecté:", product);
      console.log("Store type:", product.store_type);

      // Déterminer la redirection selon le store_type
      let redirectPath = "/produit/" + id; // fallback

      if (product.store_type === "adult") {
        redirectPath = `/reboul/${id}`;
      } else if (product.store_type === "sneakers") {
        redirectPath = `/sneakers/${id}`;
      } else if (product.store_type === "kids") {
        redirectPath = `/kids/${id}`;
      } else if (product.store_type === "cpcompany") {
        // Pour The Corner, rediriger vers l'ancienne page
        redirectPath = `/the-corner/${id}`;
             } else {
         // Si pas de store_type spécifique, rediriger vers reboul par défaut
         redirectPath = `/reboul/${id}`;
       }

      console.log("Redirection vers:", redirectPath);

      // Rediriger avec remplacement de l'historique
      router.replace(redirectPath);

    } catch (error) {
      console.error("Erreur lors de la détection du produit:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  // Effectuer la détection au montage
  useEffect(() => {
    if (id) {
      detectAndRedirect();
    }
  }, [id, detectAndRedirect]);

  const handleRetry = useCallback(() => {
    detectAndRedirect();
  }, [detectAndRedirect]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <ClientPageWrapper>
      <div className="min-h-screen bg-background">
        {isLoading ? (
          <RedirectingLoader />
        ) : isError ? (
          <ErrorFallback onRetry={handleRetry} onGoHome={handleGoHome} />
        ) : (
          <RedirectingLoader />
        )}
      </div>
    </ClientPageWrapper>
  );
}
