import React from 'react'
import { cn } from '@/lib/utils'
import { getColorInfo, isWhiteColor } from '@/config/productColors'

interface ColorSelectorProps {
  colors: string[]
  variants: any[]
  selectedColor: string
  selectedSize: string
  onColorChange: (color: string) => void
}

export function ColorSelector({
  colors,
  variants,
  selectedColor,
  selectedSize,
  onColorChange
}: ColorSelectorProps) {
  
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

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">Couleur: {selectedColor ? getColorInfo(selectedColor).label : ''}</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map(color => {
          const colorInfo = getColorInfo(color);
          const isWhite = isWhiteColor(colorInfo.hex);
          const available = isColorAvailable(color);
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              disabled={!available}
              className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center",
                "transition-all duration-200",
                !available && "opacity-40 cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-full border",
                  selectedColor === color ? "ring-2 ring-primary ring-offset-2" : "",
                  isWhite ? "border-zinc-300" : "border-transparent"
                )}
                style={{ 
                  backgroundColor: colorInfo.hex.startsWith('linear-gradient') 
                    ? colorInfo.hex 
                    : colorInfo.hex
                }}
              />
              {selectedColor === color && (
                <span className="absolute right-0 bottom-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

