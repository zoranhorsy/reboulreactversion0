"use client";

import React from "react";
import { ReboulButton } from "./reboul-button";
import Link from "next/link";

export function ReboulButtonExamples() {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Exemples ReboulButton
      </h1>

      {/* Variants principaux */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants principaux</h2>
        <div className="flex flex-wrap gap-4">
          <ReboulButton variant="primary">Bouton Principal</ReboulButton>

          <ReboulButton variant="secondary">Bouton Secondaire</ReboulButton>

          <ReboulButton variant="outline">Bouton Outline</ReboulButton>

          <ReboulButton variant="ghost">Bouton Ghost</ReboulButton>

          <ReboulButton variant="destructive">Bouton Destructif</ReboulButton>
        </div>
      </section>

      {/* Tailles */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tailles</h2>
        <div className="flex flex-wrap items-center gap-4">
          <ReboulButton size="sm">Small</ReboulButton>
          <ReboulButton size="default">Default</ReboulButton>
          <ReboulButton size="md">Medium</ReboulButton>
          <ReboulButton size="lg">Large</ReboulButton>
          <ReboulButton size="xl">Extra Large</ReboulButton>
        </div>
      </section>

      {/* Avec icônes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Avec icônes</h2>
        <div className="flex flex-wrap gap-4">
          <ReboulButton variant="primary" icon={<span>🛒</span>}>
            Ajouter au panier
          </ReboulButton>

          <ReboulButton variant="outline" icon={<span>👁️</span>}>
            Voir détails
          </ReboulButton>

          <ReboulButton
            variant="primary"
            icon={<span>→</span>}
            iconPosition="right"
          >
            Voir catalogue
          </ReboulButton>

          <ReboulButton variant="ghost" icon={<span>♥</span>}>
            Favoris
          </ReboulButton>
        </div>
      </section>

      {/* États de chargement */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">États de chargement</h2>
        <div className="flex flex-wrap gap-4">
          <ReboulButton onClick={handleClick}>Ajouter au panier</ReboulButton>

          <ReboulButton loading>Traitement...</ReboulButton>
        </div>
      </section>

      {/* Tailles spéciales (Mobile First) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tailles Mobile First</h2>
        <div className="flex flex-wrap gap-4">
          <ReboulButton size="sm" className="sm:size-md" icon={<span>+</span>}>
            <span className="hidden sm:inline">Ajouter au panier</span>
            <span className="sm:hidden">Panier</span>
          </ReboulButton>

          <ReboulButton variant="outline" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Voir détails</span>
            <span className="sm:hidden">Détails</span>
          </ReboulButton>
        </div>
      </section>

      {/* Avec Link (asChild) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Avec Link (asChild)</h2>
        <div className="flex flex-wrap gap-4">
          <ReboulButton asChild>
            <Link href="/catalogue">Voir tout le catalogue</Link>
          </ReboulButton>

          <ReboulButton variant="outline" asChild>
            <Link href="/produit/123">Voir ce produit</Link>
          </ReboulButton>
        </div>
      </section>

      {/* Exemples de style des cartes produits */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Style cartes produits</h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border max-w-sm">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <h3 className="font-semibold mb-2">Nom du produit</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Description du produit
          </p>

          <div className="flex gap-2">
            <ReboulButton variant="outline" size="sm" className="flex-1">
              <span className="hidden sm:inline">Voir détails</span>
              <span className="sm:hidden">Détails</span>
            </ReboulButton>

            <ReboulButton size="sm" icon={<span>+</span>}>
              <span className="hidden sm:inline">Panier</span>
            </ReboulButton>
          </div>
        </div>
      </section>

      {/* Bouton pleine largeur */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pleine largeur</h2>
        <ReboulButton className="w-full" icon={<span>🛒</span>}>
          Ajouter au panier - Pleine largeur
        </ReboulButton>
      </section>
    </div>
  );
}
