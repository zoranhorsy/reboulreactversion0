import { Badge } from "@/components/ui/badge"
import { Star, Truck, Package } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface TheCornerProductInfoProps {
  name: string
  brand: string
  description: string
  price: number
  oldPrice?: number
  rating?: number
  reviewsCount?: number
  sku?: string | null
  storeReference?: string | null
  tags?: string[]
  technicalSpecs?: {
    label: string
    value: string
  }[]
}

export function TheCornerProductInfo({
  name,
  brand,
  description,
  price,
  oldPrice,
  rating,
  reviewsCount,
  sku,
  storeReference,
  tags,
  technicalSpecs
}: TheCornerProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* Note et avis */}
      {typeof rating !== 'undefined' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-5 h-5",
                  star <= (rating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {rating?.toFixed(1)} ({reviewsCount} avis)
          </span>
        </div>
      )}

      {/* Nom et marque */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {name}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {brand}
        </p>
      </div>

      {/* Prix */}
      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-semibold">
          {formatPrice(price)}
        </p>
        {oldPrice && (
          <p className="text-lg text-muted-foreground line-through">
            {formatPrice(oldPrice)}
          </p>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Informations produit */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
        {sku && (
          <div>
            <span className="text-sm text-muted-foreground">SKU</span>
            <p className="text-sm font-medium mt-0.5">{sku}</p>
          </div>
        )}
        {storeReference && (
          <div>
            <span className="text-sm text-muted-foreground">Réf. Magasin</span>
            <p className="text-sm font-medium mt-0.5">{storeReference}</p>
          </div>
        )}
        <div>
          <span className="text-sm text-muted-foreground">Boutique</span>
          <p className="text-sm font-medium mt-0.5">THE CORNER</p>
        </div>
      </div>

      {/* Livraison */}
      <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/50">
        <Truck className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">
            {price >= 100
              ? "Livraison gratuite"
              : "Livraison à partir de 4,99€"}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Livraison en 3-5 jours ouvrés
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h3 className="text-base font-medium">Description</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>{description}</p>
        </div>
      </div>

      {/* Caractéristiques techniques */}
      {technicalSpecs && technicalSpecs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-medium">Caractéristiques techniques</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-muted/20 rounded-lg border border-border/50">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{spec.label}</span>
                <span className="text-sm font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 