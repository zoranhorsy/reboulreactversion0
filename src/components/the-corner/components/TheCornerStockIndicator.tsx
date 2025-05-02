import { Minus, Plus, Package } from "lucide-react"
import { Variant } from "@/lib/types/variant"
import { cn } from "@/lib/utils"

interface TheCornerStockIndicatorProps {
  variant?: Variant
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export function TheCornerStockIndicator({
  variant,
  quantity,
  onQuantityChange
}: TheCornerStockIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Quantité</h3>
        {variant && (
          <div className="flex items-center text-sm">
            <Package className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Stock: <span className="font-medium text-foreground">{variant.stock}</span>
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border shadow-sm">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-l-lg transition-colors",
              "hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label="Diminuer la quantité"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-10 w-12 flex items-center justify-center border-l border-r">
            <span className="text-sm font-medium">{quantity}</span>
          </div>
          <button
            onClick={() => onQuantityChange(Math.min(variant?.stock || 10, quantity + 1))}
            disabled={quantity >= (variant?.stock || 10)}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-r-lg transition-colors",
              "hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label="Augmenter la quantité"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {variant && variant.stock <= 3 && (
          <p className="text-sm text-orange-600 font-medium">
            Plus que {variant.stock} en stock !
          </p>
        )}
      </div>
    </div>
  )
} 