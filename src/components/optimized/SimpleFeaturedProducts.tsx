"use client";

import React from "react";
export function SimpleFeaturedProducts() {
  return (
    <section className="w-full py-8 lg:py-12 overflow-hidden">
      {/* Titre */}
      <div className="text-center mb-8 lg:mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-primary/60 to-primary/40"></div>
          <span>TrendingUp</span>
          <div className="h-[2px] w-16 bg-gradient-to-l from-transparent via-primary/60 to-primary/40"></div>
        </div>
        <h2 className="font-geist text-3xl lg:text-4xl text-foreground tracking-wide mb-3 font-medium">
          Produits en vedette
        </h2>
        <p className="font-geist text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Découvrez notre sélection exclusive des pièces les plus tendance du
          moment
        </p>
      </div>

      {/* Contenu temporaire */}
      <div className="flex justify-center items-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Chargement des produits optimisés...
          </p>
        </div>
      </div>
    </section>
  );
}
