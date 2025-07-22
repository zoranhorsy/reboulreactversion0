"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getColorInfo } from "@/config/productColors";

interface ProductVariantPreviewProps {
  productId: string;
  colorImages: Record<string, string>;
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  variants: any[];
  selectedSize?: string;
  className?: string;
}

export function ProductVariantPreview({
  productId,
  colorImages,
  availableColors,
  selectedColor,
  onColorChange,
  variants,
  selectedSize = "",
  className = "",
}: ProductVariantPreviewProps) {
  // Récupérer l'image pour la couleur sélectionnée
  const selectedImage = useMemo(() => {
    const img = colorImages[selectedColor] || "";
    return img && img.trim() ? img : "";
  }, [colorImages, selectedColor]);

  // Vérifier si une combinaison est disponible
  const isVariantAvailable = (color: string) => {
    if (!selectedSize) return true;

    return variants.some(
      (v) => v.color === color && v.size === selectedSize && v.stock > 0,
    );
  };

  // Obtenir le stock pour une couleur
  const getColorStock = (color: string) => {
    if (!selectedSize) return 0;

    const variant = variants.find(
      (v) => v.color === color && v.size === selectedSize,
    );

    return variant?.stock || 0;
  };

  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Grande image de la variante sélectionnée */}
      <div className="relative aspect-square w-full bg-zinc-100 rounded-lg overflow-hidden">
        {selectedImage && selectedImage.trim() ? (
          <Image
            src={selectedImage}
            alt={`${productId} - ${selectedColor}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
            Pas d&apos;image disponible
          </div>
        )}
      </div>

      {/* Prévisualisation des variantes de couleur */}
      {availableColors.length > 1 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
          {availableColors.map((color) => {
            const colorInfo = getColorInfo(color);
            const available = isVariantAvailable(color);
            const stock = getColorStock(color);
            const colorImage = colorImages[color];
            const isValidImage = colorImage && colorImage.trim();

            return (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                disabled={!available}
                className={cn(
                  "relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  "touch-manipulation", // Optimisation touch
                  selectedColor === color
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-primary/50",
                  !available &&
                    "opacity-40 cursor-not-allowed border-transparent",
                )}
                title={`${colorInfo.label} - ${available ? `${stock} en stock` : "Indisponible"}`}
              >
                {isValidImage ? (
                  <Image
                    src={colorImage}
                    alt={`${productId} - ${color}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 48px, 64px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: colorInfo.hex }}
                  />
                )}

                {/* Badge de couleur sélectionnée - Adaptatif */}
                {selectedColor === color && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] sm:text-xs py-0.5 text-center font-medium">
                    <span className="hidden sm:inline">Sélectionnée</span>
                    <span className="sm:hidden"></span>
                  </div>
                )}

                {/* Badge de stock - Mobile optimisé */}
                {available && stock > 0 && stock <= 3 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] sm:text-[10px] px-1 rounded-bl-md font-medium">
                    {stock}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
