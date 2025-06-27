"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, Variant } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TheCornerVariantSelectorProps {
  variants: Variant[];
  selectedColor: string;
  selectedSize: string;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}

export function TheCornerVariantSelector({
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: TheCornerVariantSelectorProps) {
  // Extraire les couleurs et tailles uniques
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color)),
  ).filter(Boolean);
  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size)),
  ).filter(Boolean);

  // Vérifier le stock pour une couleur donnée
  const getColorStock = (color: string) => {
    return variants
      .filter((v) => v.color === color)
      .reduce((total, v) => total + (v.stock || 0), 0);
  };

  // Vérifier le stock pour une taille donnée
  const getSizeStock = (size: string) => {
    return variants
      .filter((v) => v.size === size)
      .reduce((total, v) => total + (v.stock || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de couleurs */}
      {availableColors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Couleur
            {selectedColor && (
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                - {selectedColor}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const stock = getColorStock(color);
              const isSelected = selectedColor === color;
              const isAvailable = stock > 0;

              return (
                <motion.button
                  key={color}
                  onClick={() => isAvailable && onColorChange(color)}
                  disabled={!isAvailable}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border-2 transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : isAvailable
                        ? "bg-background hover:bg-secondary border-border hover:border-primary/50"
                        : "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50",
                  )}
                  whileHover={isAvailable ? { scale: 1.02 } : {}}
                  whileTap={isAvailable ? { scale: 0.98 } : {}}
                >
                  {color}
                  {!isAvailable && (
                    <span className="ml-1 text-xs">(Épuisé)</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de tailles */}
      {availableSizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Taille
            {selectedSize && (
              <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                - {selectedSize}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const stock = getSizeStock(size);
              const isSelected = selectedSize === size;
              const isAvailable = stock > 0;

              return (
                <motion.button
                  key={size}
                  onClick={() => isAvailable && onSizeChange(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border-2 transition-all min-w-[3rem]",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : isAvailable
                        ? "bg-background hover:bg-secondary border-border hover:border-primary/50"
                        : "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50",
                  )}
                  whileHover={isAvailable ? { scale: 1.02 } : {}}
                  whileTap={isAvailable ? { scale: 0.98 } : {}}
                >
                  {size}
                  {!isAvailable && (
                    <span className="ml-1 text-xs">(Épuisé)</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateur de stock pour la combinaison sélectionnée */}
      {selectedColor && selectedSize && (
        <div className="p-3 bg-secondary/50 rounded-lg">
          {(() => {
            const selectedVariant = variants.find(
              (v) => v.color === selectedColor && v.size === selectedSize,
            );
            const stock = selectedVariant?.stock || 0;

            if (stock === 0) {
              return (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="m12 17 .01 0" />
                  </svg>
                  Cette combinaison n&apos;est plus disponible
                </div>
              );
            }

            return (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {stock} exemplaire{stock > 1 ? "s" : ""} en stock
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
