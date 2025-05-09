'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getColorInfo } from '@/config/productColors'

interface ProductVariantPreviewProps {
  productId: string
  colorImages: Record<string, string>
  availableColors: string[]
  selectedColor: string
  onColorChange: (color: string) => void
  variants: any[]
  selectedSize?: string
  className?: string
}

export function ProductVariantPreview({
  productId,
  colorImages,
  availableColors,
  selectedColor,
  onColorChange,
  variants,
  selectedSize = '',
  className = ''
}: ProductVariantPreviewProps) {
  // Récupérer l'image pour la couleur sélectionnée
  const selectedImage = useMemo(() => {
    const img = colorImages[selectedColor] || '';
    return img && img.trim() ? img : '';
  }, [colorImages, selectedColor])

  // Vérifier si une combinaison est disponible
  const isVariantAvailable = (color: string) => {
    if (!selectedSize) return true
    
    return variants.some(
      v => v.color === color && 
           v.size === selectedSize && 
           v.stock > 0
    )
  }
  
  // Obtenir le stock pour une couleur
  const getColorStock = (color: string) => {
    if (!selectedSize) return 0
    
    const variant = variants.find(
      v => v.color === color && v.size === selectedSize
    )
    
    return variant?.stock || 0
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Grande image de la variante sélectionnée */}
      <div className="relative aspect-square w-full bg-zinc-100 rounded-lg overflow-hidden">
        {selectedImage && selectedImage.trim() ? (
          <Image
            src={selectedImage}
            alt={`${productId} - ${selectedColor}`}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            Pas d&apos;image disponible
          </div>
        )}
      </div>
      
      {/* Prévisualisation des variantes de couleur */}
      <div className="flex flex-wrap gap-2">
        {availableColors.map(color => {
          const colorInfo = getColorInfo(color)
          const available = isVariantAvailable(color)
          const stock = getColorStock(color)
          const colorImage = colorImages[color]
          const isValidImage = colorImage && colorImage.trim()
          
          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              disabled={!available}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
                selectedColor === color 
                  ? "border-primary shadow" 
                  : "border-transparent",
                !available && "opacity-40 cursor-not-allowed border-transparent"
              )}
              title={`${colorInfo.label} - ${available ? `${stock} en stock` : 'Indisponible'}`}
            >
              {isValidImage ? (
                <Image
                  src={colorImage}
                  alt={`${productId} - ${color}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center" 
                  style={{ backgroundColor: colorInfo.hex }}
                />
              )}
              
              {/* Badge de couleur sélectionnée */}
              {selectedColor === color && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-0.5 text-center">
                  Sélectionnée
                </div>
              )}
              
              {/* Badge de stock */}
              {available && stock > 0 && stock <= 3 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 rounded-bl-md">
                  {stock}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 