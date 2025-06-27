"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Définir les routes critiques à précharger
const CRITICAL_ROUTES = [
  "/catalogue",
  "/produit/[id]", // Cette syntax sera remplacée par le routeur
  "/panier",
  "/the-corner",
  "/about",
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    // Préchargement immédiat des routes critiques
    const prefetchCriticalRoutes = () => {
      CRITICAL_ROUTES.forEach((route) => {
        // Pour les routes dynamiques, nous préchargeons un exemple
        if (route.includes("[id]")) {
          // Précharger quelques produits populaires (remplacer par vos IDs réels)
          const popularProductIds = ["1", "2", "3"];
          popularProductIds.forEach((id) => {
            const actualRoute = route.replace("[id]", id);
            router.prefetch(actualRoute);
          });
        } else {
          router.prefetch(route);
        }
      });
    };

    // Précharger immédiatement si le navigateur est inactif
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      // @ts-ignore - requestIdleCallback existe dans la plupart des navigateurs
      window.requestIdleCallback(prefetchCriticalRoutes);
    } else {
      // Fallback pour les navigateurs ne supportant pas requestIdleCallback
      setTimeout(prefetchCriticalRoutes, 1000);
    }
  }, [router]);

  // Ce composant ne rend rien visuellement
  return null;
}
