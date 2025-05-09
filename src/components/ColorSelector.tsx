import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { getColorInfo, isWhiteColor } from '@/config/productColors'
import Image from 'next/image'

interface ColorSelectorProps {
  colors: string[]
  variants: any[]
  selectedColor: string
  selectedSize: string
  onColorChange: (color: string) => void
  productImages?: Record<string, string> // Images indexées par couleur
}

export function ColorSelector({
  colors,
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  productImages = {}
}: ColorSelectorProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  
  // Vérifie si une couleur est disponible pour la taille sélectionnée
  const isColorAvailable = (color: string) => {
    // Si aucune taille n'est sélectionnée, toutes les couleurs sont disponibles
    if (!selectedSize) return true
    
    // Vérifier s'il existe une variante avec la taille et la couleur spécifiées qui a du stock
    return variants.some(variant => 
      variant.color === color && 
      variant.size === selectedSize && 
      variant.stock > 0
    )
  }
  
  // Obtenir le stock pour une combinaison couleur/taille
  const getColorStock = (color: string) => {
    if (!selectedSize) return 0
    
    const variant = variants.find(v => 
      v.color === color && 
      v.size === selectedSize
    )
    
    return variant?.stock || 0
  }
  
  // Classification du niveau de stock
  const getStockLevel = (stock: number) => {
    if (stock === 0) return 'none'
    if (stock <= 3) return 'low'
    if (stock <= 10) return 'medium'
    return 'high'
  }

  return (
    <div className="mb-6 relative">
      <h3 className="text-sm font-medium mb-3">
        Couleur: {selectedColor ? getColorInfo(selectedColor).label : ''}
      </h3>
      
      {/* Preview de l'image au survol */}
      {hoveredColor && productImages[hoveredColor] && (
        <div className="absolute right-0 -top-16 w-20 h-20 border border-zinc-300 rounded-md overflow-hidden shadow-lg z-10 bg-white">
          <Image 
            src={productImages[hoveredColor]}
            alt={`Prévisualisation ${getColorInfo(hoveredColor).label}`}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {colors.map(color => {
          const colorInfo = getColorInfo(color);
          const isWhite = isWhiteColor(colorInfo.hex);
          const available = isColorAvailable(color);
          const stock = getColorStock(color);
          const stockLevel = getStockLevel(stock);
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              onMouseEnter={() => setHoveredColor(color)}
              onMouseLeave={() => setHoveredColor(null)}
              disabled={!available}
              className={cn(
                "relative px-3 py-2.5 rounded-md flex items-center justify-center",
                "transition-all duration-200 border min-w-[80px]",
                selectedColor === color 
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-semibold" 
                  : "bg-white text-black border-zinc-200 hover:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-zinc-600",
                !available && "opacity-40 cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900"
              )}
            >
              <span className="text-sm whitespace-nowrap">{colorInfo.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

