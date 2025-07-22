"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import React from "react";
import { DynamicOptionsLoadingProps } from "next/dynamic";

const LoadingFallback = (props: DynamicOptionsLoadingProps): JSX.Element => {
  if (props.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-red-500">
          Une erreur est survenue lors du chargement
        </p>
        <button onClick={props.retry} className="text-blue-500 hover:underline">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <span>⏳</span>
    </div>
  );
};

// Composant de profil utilisateur - Client only
export const DynamicUserProfile = dynamic(() => import("./user/UserProfile"), {
  loading: LoadingFallback,
  ssr: false,
});

// Composant de tableau de bord administrateur - Client only
export const DynamicAdminDashboard = dynamic(
  () => import("./admin/AdminDashboard"),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

// Composant de sélection de magasin - SSR enabled
export const DynamicStoreSelection = dynamic(() => import("./StoreSelection"), {
  loading: LoadingFallback,
  ssr: true,
});

// Composant des dernières collections - SSR enabled
export const DynamicLatestCollections = dynamic(
  () => import("./LatestCollections"),
  {
    loading: LoadingFallback,
    ssr: true,
  },
);

// Composant de modal des variantes de produit - Client only
export const DynamicProductVariantModal = dynamic(
  () =>
    import("./ProductVariantModal").then((mod) => ({
      default: mod.ProductVariantModal,
    })),
  {
    loading: LoadingFallback,
    ssr: false,
  },
);

// Fonction pour précharger des modules spécifiques
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== "undefined") {
    // Précharger après l'hydratation pour améliorer la performance perçue
    setTimeout(() => {
      importFn().catch(() => {
        // Ignorer les erreurs de préchargement silencieusement
      });
    }, 0);
  }
}

// Précharger les composants importants lors de l'hydratation initiale
if (typeof window !== "undefined") {
  // Utilisation d'un délai minimal pour donner la priorité à l'hydratation
  setTimeout(() => {
    preloadComponent(() => import("./ProductVariantModal"));
    preloadComponent(() => import("./user/UserProfile"));
  }, 2000); // Délai pour permettre l'hydratation complète d'abord
}
