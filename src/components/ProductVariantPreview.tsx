"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getColorInfo } from "@/config/productColors";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductVariantPreviewProps {
  productId: string;
  colorImages: string[]; // Changé en tableau d'images
  availableColors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  variants: any[];
  selectedSize?: string;
  className?: string;
}

export function ProductVariantPreview({
  productId,
  colorImages, // Now a string[]
  availableColors,
  selectedColor,
  onColorChange,
  variants,
  selectedSize = "",
  className = "",
}: ProductVariantPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log("🔍 ProductVariantPreview - Props reçues:", {
    productId,
    colorImages,
    colorImagesLength: colorImages?.length,
    availableColors,
    selectedColor
  });

  // Récupérer toutes les images du produit
  const allImages = useMemo(() => {
    // Ne pas filtrer les doublons pour le test - afficher toutes les images
    const images = colorImages || [];
    console.log("🎯 ProductVariantPreview - Images filtrées:", {
      total: images.length,
      images: images
    });
    return images;
  }, [colorImages]);

  // Navigation dans les images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

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
      {/* Grande image avec carrousel */}
      <div className="relative aspect-square w-full bg-zinc-100 rounded-lg overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <Image
              src={allImages[currentImageIndex]}
              alt={`${productId} - Image ${currentImageIndex + 1}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Navigation du carrousel */}
            {allImages.length > 1 && (
              <>
                {/* Bouton précédent */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Bouton suivant */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                {/* Indicateurs de position */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      )}
                    />
                  ))}
                </div>

                {/* Compteur d'images */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
            Pas d&apos;image disponible
          </div>
        )}
      </div>

      {/* Miniatures des images */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all",
                index === currentImageIndex
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={image}
                alt={`${productId} - Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Debug: {allImages.length} images, index actuel: {currentImageIndex}
      </div>

      {/* Prévisualisation des variantes de couleur */}
      {availableColors.length > 1 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
          {availableColors.map((color) => {
            const colorInfo = getColorInfo(color);
            const available = isVariantAvailable(color);
            const stock = getColorStock(color);

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
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: colorInfo.hex }}
                />

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
