import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductVariantModal } from "@/components/ProductVariantModal"
import { useCart } from "@/app/contexts/CartContext"
import { useFavorites } from "@/app/contexts/FavoritesContext"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from '@/app/contexts/AuthContext'
import type { CartItemVariant } from '@/lib/types/cart'
import { getImageUrl } from '@/lib/cloudinary'

// Import du mapping des couleurs
const colorMap: Record<string, { hex: string; label: string }> = {
  "noir": { hex: "#000000", label: "Noir" },
  "blanc": { hex: "#FFFFFF", label: "Blanc" },
  "gris": { hex: "#808080", label: "Gris" },
  "marine": { hex: "#1B1B3A", label: "Marine" },
  "bleu": { hex: "#0052CC", label: "Bleu" },
  "rouge": { hex: "#E12B38", label: "Rouge" },
  "vert": { hex: "#2D8C3C", label: "Vert" },
  "jaune": { hex: "#FFD700", label: "Jaune" },
  "orange": { hex: "#FFA500", label: "Orange" },
  "violet": { hex: "#800080", label: "Violet" },
  "rose": { hex: "#FFB6C1", label: "Rose" },
  "marron": { hex: "#8B4513", label: "Marron" },
  "beige": { hex: "#F5F5DC", label: "Beige" }
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addItem } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user } = useAuth()

  if (!product) return null

  const imageUrl = getImageUrl(product.image_url)

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return null
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price))
  }

  const handleAddToCart = (size: string, color: string, quantity: number) => {
    try {
      // Vérifier que le variant existe et a du stock
      const variant = product.variants.find((v) => v.size === size && v.color === color)
      if (!variant) {
        throw new Error(`Cette combinaison de taille (${size}) et couleur (${color}) n'est pas disponible.`)
      }

      if (variant.stock < quantity) {
        throw new Error(`Stock insuffisant. Seulement ${variant.stock} unité(s) disponible(s).`)
      }

      const colorInfo = colorMap[color.toLowerCase()] || { hex: color, label: color }
      const cartVariant: CartItemVariant = {
        size,
        color,
        colorLabel: colorInfo.label
      }

      const cartItemId = `${product.id}-${size}-${color}`
      addItem({
        id: cartItemId,
        name: `${product.name} (${size}, ${cartVariant.colorLabel})`,
        price: product.price,
        quantity: quantity,
        image: getImageUrl(typeof imageUrl === 'string' ? imageUrl : "/placeholder.svg"),
        variant: cartVariant
      })

      toast({
        title: "Produit ajouté au panier",
        description: `${product.name} (${size}, ${cartVariant.colorLabel}) × ${quantity} a été ajouté à votre panier.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter le produit au panier. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter des favoris",
        variant: "destructive"
      })
      return
    }

    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id)
      } else {
        await addToFavorites(product)
      }
    } catch (error) {
      console.error('Erreur avec les favoris:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue avec les favoris",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Link href={`/produit/${product.id}`} className="block group">
        <div className={cn(
          "relative rounded-xl overflow-hidden group",
          "transition-all duration-300",
          "hover:shadow-lg",
          viewMode === "list" && "flex"
        )}>
          <div className={cn(
            "aspect-[3/4] relative overflow-hidden",
            viewMode === "list" && "w-48"
          )}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={viewMode === "list" ? "192px" : "(max-width: 768px) 100vw, 25vw"}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 
              transition-all duration-300 flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "w-10 h-10 rounded-full",
                  "bg-background/95 backdrop-blur-sm",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-300",
                  "hover:scale-110 hover:bg-primary hover:text-background",
                  "shadow-sm",
                  isFavorite(product.id) && "text-red-500 hover:text-background"
                )}
                onClick={handleFavoriteClick}
              >
                <Heart className="w-4 h-4" fill={isFavorite(product.id) ? "currentColor" : "none"} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-10 h-10 rounded-full 
                  bg-background/95 backdrop-blur-sm
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-300
                  hover:scale-110 hover:bg-primary hover:text-background
                  shadow-sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsModalOpen(true)
                }}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className={cn(
            "p-4 space-y-2 bg-card",
            viewMode === "list" && "flex-1"
          )}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.brand || 'REBOUL'}
                </h3>
                <p className="text-sm font-medium text-primary line-clamp-1">
                  {product.name}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {product.category || 'Nouveauté'}
              </Badge>
            </div>

            {/* Couleurs disponibles */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground">Couleurs :</span>
                <div className="flex gap-1">
                  {Array.from(new Set(product.variants.map(v => v.color?.toLowerCase())))
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((color, index) => {
                      const colorInfo = colorMap[color] || { hex: color, label: color }
                      return (
                        <div
                          key={color}
                          className={cn(
                            "w-4 h-4 rounded-full border border-border/50",
                            "transition-transform hover:scale-125",
                            colorInfo.hex === "#FFFFFF" && "border-border"
                          )}
                          title={colorInfo.label}
                          style={{ 
                            background: colorInfo.hex.startsWith('linear-gradient') 
                              ? colorInfo.hex 
                              : colorInfo.hex
                          }}
                        />
                      )
                    })}
                  {product.variants.length > 4 && (
                    <div className="text-xs text-muted-foreground font-medium">
                      +{Array.from(new Set(product.variants.map(v => v.color))).length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tailles disponibles */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Tailles :</span>
                <div className="flex gap-1">
                  {Array.from(new Set(product.variants.map(v => v.size)))
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((size) => (
                      <span key={size} className="text-xs font-medium">
                        {size}
                      </span>
                    ))}
                  {Array.from(new Set(product.variants.map(v => v.size))).length > 5 && (
                    <span className="text-xs text-muted-foreground font-medium">
                      +{Array.from(new Set(product.variants.map(v => v.size))).length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              {product.price ? (
                <span className="text-base font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Prix sur demande
                </span>
              )}
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-xs">
                  En stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Rupture de stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
      <ProductVariantModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}