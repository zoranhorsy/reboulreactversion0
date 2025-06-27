"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createViewportLoadedComponent,
  createInteractionLoadedComponent,
  useIdlePreload,
} from "@/lib/dynamic-loading-strategies";

// Imports optimisés de lodash
import debounce from "lodash/debounce";

// Import d'utilitaires optimisés au lieu de lodash
import { rafThrottle } from "@/lib/utils";

// Import d'animations CSS au lieu de framer-motion
import "@/styles/animation-utils.css";

/**
 * Exemple de composant optimisé avec des stratégies de chargement dynamique
 *
 * Ce composant illustre comment implémenter ces stratégies pour réduire
 * la taille du bundle JavaScript initial.
 */
export default function OptimizedComponentExample() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("featured");

  // Préchargement intelligent des composants lourds pendant les périodes d'inactivité
  useIdlePreload([
    { fn: () => import("@/components/products/ProductInfo"), priority: "high" },
  ]);

  // Gestionnaire d'événement optimisé
  const handleScroll = rafThrottle(() => {
    // Code de gestion du défilement...
    console.log("Défilement optimisé");
  });

  // Gestionnaire avec debounce importé de façon optimisée
  const handleSearch = debounce((term: string) => {
    console.log("Recherche:", term);
  }, 300);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 animate-fade-in">
        Exemple de composant optimisé
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section principale - Chargée immédiatement */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 animate-slide-up delay-100">
          <h2 className="text-xl font-semibold mb-4">Contenu principal</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Cette section est chargée immédiatement car elle fait partie du
            contenu essentiel. Les animations utilisent des classes CSS au lieu
            de framer-motion.
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "featured"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "stats"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab("model")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "model"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Modèle 3D
            </button>
          </div>

          {/* Contenu des onglets - Chargé dynamiquement */}
          <div className="min-h-[300px] bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
            {activeTab === "featured" && <LazyProductTab />}
            {activeTab === "stats" && <LazyStatsTab />}
            {activeTab === "model" && <Lazy3DModelViewer />}
          </div>
        </div>

        {/* Section secondaire - Chargée lorsque visible */}
        <div className="space-y-6">
          {/* Recommandations - Chargées uniquement lorsque visibles */}
          <LazyRecommendations />

          {/* Éditeur avancé - Chargé uniquement lors de l'interaction */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Éditeur avancé</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cet éditeur se charge uniquement lorsque vous interagissez avec
              lui. Passez la souris sur le bouton ci-dessous pour déclencher le
              chargement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant chargé dynamiquement lorsqu'il devient visible
const LazyRecommendations = () => (
  <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4">Recommandations</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-4">
      Le système de recommandations est en cours de développement.
    </p>
    <div className="space-y-3">
      <div className="h-20 bg-gray-200 dark:bg-zinc-700 rounded-md"></div>
      <div className="h-20 bg-gray-200 dark:bg-zinc-700 rounded-md"></div>
      <div className="h-20 bg-gray-200 dark:bg-zinc-700 rounded-md"></div>
    </div>
  </div>
);

// Composant chargé dynamiquement lorsque l'onglet est sélectionné
const LazyProductTab = createViewportLoadedComponent(
  () => import("@/components/products/ProductInfo"),
  {
    loadingComponent: (
      <div className="h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
    preload: true,
    priority: "high",
  },
);

// Composant de statistiques (temporairement désactivé)
const LazyStatsTab = () => (
  <div className="h-[300px] flex items-center justify-center">
    <p className="text-gray-600 dark:text-gray-300">
      Statistiques en cours de développement
    </p>
  </div>
);

// Composant 3D (temporairement désactivé)
const Lazy3DModelViewer = () => (
  <div className="h-[300px] flex items-center justify-center">
    <p className="text-gray-600 dark:text-gray-300">
      Visualisation 3D en cours de développement
    </p>
  </div>
);

// Composant chargé lors de l'interaction (hover/click)
const LazyEditor = () => (
  <div className="h-32 bg-gray-200 dark:bg-zinc-700 rounded-md p-4">
    <p className="text-gray-600 dark:text-gray-300">
      L&apos;éditeur de texte riche est en cours de développement.
    </p>
  </div>
);
