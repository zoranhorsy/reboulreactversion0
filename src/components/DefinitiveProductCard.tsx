"use client";

import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { type Product } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DefinitiveProductCardProps {
  product: Product;
  index?: number;
  className?: string;
  showRating?: boolean;
  showDescription?: boolean;
  size?: "small" | "medium" | "large";
  baseUrl?: string; // Pour personnaliser l'URL de base (/produit ou /the-corner)
  variant?: "main" | "corner"; // Pour différencier les styles si nécessaire
}

export const DefinitiveProductCard = React.memo(
  ({
    product,
    index = 0,
    className,
    showRating = true,
    showDescription = true,
    size = "medium",
    baseUrl = "/produit",
    variant = "main",
  }: DefinitiveProductCardProps) => {
    const sizeClasses = {
      small: "p-3",
      medium: "p-4",
      large: "p-6",
    };

    const titleClasses = {
      small: "text-base",
      medium: "text-lg",
      large: "text-xl",
    };

    return (
      <div
        className={cn(
          "bg-white dark:bg-zinc-900 rounded-lg shadow-md dark:shadow-zinc-800/20 overflow-hidden hover:shadow-lg dark:hover:shadow-zinc-800/30 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 hover:border-primary/20 dark:hover:border-primary/20",
          className
        )}
      >
        {/* Image du produit */}
        <div className="aspect-square relative overflow-hidden group">
          <Image
            src={product.image || product.image_url || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Badge nouveau */}
          {product.new && (
            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded-md font-medium">
              Nouveau
            </span>
          )}
          
          {/* Badge promotion si applicable */}
          {product.original_price && product.original_price > product.price && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-md font-medium">
              Promo
            </span>
          )}
        </div>

        {/* Contenu de la carte */}
        <div className={sizeClasses[size]}>
          {/* Nom du produit */}
          <h3
            className={cn(
              "font-semibold mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-100",
              titleClasses[size]
            )}
          >
            {product.name}
          </h3>

          {/* Description (optionnelle) */}
          {showDescription && (
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">
              {product.description ||
                "Un produit exclusif de la collection Reboul"}
            </p>
          )}

          {/* Prix et note */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {/* Prix actuel */}
              <span className="text-xl font-bold text-primary dark:text-primary">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(product.price)}
              </span>
              
              {/* Prix barré si promotion */}
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400 line-through">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(product.original_price)}
                </span>
              )}
            </div>

            {/* Note (optionnelle) */}
            {showRating && product.rating && (
              <div className="flex items-center">
                <span className="ml-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Bouton d'action */}
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 transition-colors duration-200"
          >
            <Link href={`${baseUrl}/${product.id}`}>
              {variant === "corner" ? "Voir dans The Corner" : "Voir le produit"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }
);

DefinitiveProductCard.displayName = "DefinitiveProductCard"; 