import { Button } from "@/components/ui/button"
import { Calendar, Heart, Share2, ShoppingBag } from "lucide-react"
import { Variant } from "@/lib/types/variant"
import { cn } from "@/lib/utils"

interface TheCornerProductActionsProps {
  onAddToCart: () => void
  selectedColor: string
  selectedSize: string
  variant?: Variant
  quantity: number
  isWishlist: boolean
  onToggleWishlist: () => void
  onShare: () => void
}

export function TheCornerProductActions({
  onAddToCart,
  selectedColor,
  selectedSize,
  variant,
  quantity,
  isWishlist,
  onToggleWishlist,
  onShare
}: TheCornerProductActionsProps) {
  return (
    <div className="space-y-4">
      <Button 
        onClick={onAddToCart}
        disabled={!selectedSize || !selectedColor || !variant}
        className="w-full h-14 text-base font-medium bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        Ajouter au panier
      </Button>

      {variant && variant.stock > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm text-green-800 dark:text-green-400">
                <span className="font-medium">Livraison estimée</span>
              </p>
              <p className="text-sm text-green-700 dark:text-green-500">
                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long'})} - {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long'})}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 font-medium"
          onClick={onToggleWishlist}
        >
          <Heart 
            className={cn(
              "w-5 h-5 mr-2 transition-colors",
              isWishlist ? "fill-red-500 text-red-500" : ""
            )} 
          />
          Favoris
        </Button>
        <Button
          variant="outline"
          className="h-12 font-medium"
          onClick={onShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Partager
        </Button>
      </div>
    </div>
  )
} 