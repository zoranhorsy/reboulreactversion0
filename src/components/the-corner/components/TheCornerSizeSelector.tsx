import React from 'react'
import { Variant } from "@/lib/types/product"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TheCornerSizeSelectorProps {
  sizes: string[]
  selectedSize: string
  selectedColor: string
  onSizeChange: (size: string) => void
  variants: Variant[]
}

export function TheCornerSizeSelector({
  sizes,
  selectedSize,
  selectedColor,
  onSizeChange,
  variants
}: TheCornerSizeSelectorProps) {
  const getSizeStock = (size: string) => {
    if (!variants || !selectedColor) return 0
    const variant = variants.find(v => v.size === size && v.color === selectedColor)
    return variant?.stock || 0
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Taille: {selectedSize}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock = getSizeStock(size)
          return (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => onSizeChange(size)}
              disabled={stock === 0}
              className={cn(
                "h-8 px-3 text-sm font-normal",
                stock === 0 && "opacity-50"
              )}
            >
              {size}
            </Button>
          )
        })}
      </div>
    </div>
  )
} 