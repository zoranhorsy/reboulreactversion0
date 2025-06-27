"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  selectedSize: string;
  onSizeChange: (size: string) => void;
  variants?: any[];
  selectedColor?: string;
  sizes?: string[];
}

export function SizeSelector({
  selectedSize,
  onSizeChange,
  variants = [],
  selectedColor = "",
  sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
}: SizeSelectorProps) {
  // Vérifie si une taille est disponible pour la couleur sélectionnée
  const isSizeAvailable = (size: string) => {
    // Si aucune couleur n'est sélectionnée, toutes les tailles sont disponibles
    if (!selectedColor) return true;

    // Vérifier s'il existe une variante avec la taille et la couleur spécifiées qui a du stock
    return variants.some(
      (variant) =>
        variant.size === size &&
        variant.color === selectedColor &&
        variant.stock > 0,
    );
  };

  // Obtenir le stock pour une combinaison taille/couleur
  const getSizeStock = (size: string) => {
    if (!selectedColor) return 0;

    const variant = variants.find(
      (v) => v.size === size && v.color === selectedColor,
    );

    return variant?.stock || 0;
  };

  // Classification du niveau de stock
  const getStockLevel = (stock: number) => {
    if (stock === 0) return "none";
    if (stock <= 3) return "low";
    if (stock <= 10) return "medium";
    return "high";
  };

  // Tooltip pour afficher le stock
  const getStockTooltip = (size: string) => {
    const stock = getSizeStock(size);
    const available = isSizeAvailable(size);
    
    if (!available) return "Indisponible";
    if (stock === 0) return "Rupture de stock";
    if (stock <= 3) return `Plus que ${stock} en stock`;
    return `${stock} en stock`;
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
      {sizes.map((size) => {
        const available = isSizeAvailable(size);
        const stock = getSizeStock(size);
        const stockLevel = getStockLevel(stock);

        return (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            disabled={!available}
            title={getStockTooltip(size)}
            className={cn(
              "h-9 sm:h-10 px-2 sm:px-3 rounded border transition-all relative flex items-center justify-center",
              "text-sm font-medium touch-manipulation",
              "min-w-[44px] sm:min-w-[48px]", // Zone de touch minimale
              selectedSize === size
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-semibold"
                : "bg-white text-black border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-zinc-600",
              !available && "opacity-40 cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-zinc-900",
              // Responsivité des hover effects
              "@media (hover: hover) { hover:shadow-sm }",
            )}
          >
            {size}
            {/* Indicateur de stock faible sur mobile */}
            {available && stock > 0 && stock <= 3 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full sm:hidden"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
