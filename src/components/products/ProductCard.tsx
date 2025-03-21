import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductVariantModal } from "@/components/ProductVariantModal"
import { useCart } from "@/app/contexts/CartContext"
import { useFavorites } from "@/app/contexts/FavoritesContext"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from '@/app/contexts/AuthContext'
import type { CartItemVariant } from '@/lib/types/cart'
import { ProductImage } from "@/lib/types/product-image"
import { getColorInfo, isWhiteColor } from '@/config/productColors'
import { api } from "@/lib/api"

// Hook pour récupérer les marques
function useBrands() {
  const [brands, setBrands] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBrands() {
      try {
        const brandsData = await api.fetchBrands()
        const brandsMap = brandsData.reduce((acc, brand) => {
          acc[brand.id] = brand.name
          return acc
        }, {} as Record<number, string>)
        setBrands(brandsMap)
      } catch (error) {
        console.error("Error loading brands:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBrands()
  }, [])

  return { brands, isLoading }
}

// Hook pour récupérer les catégories
function useCategories() {
  const [categories, setCategories] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await api.fetchCategories()
        const categoriesMap = categoriesData.reduce((acc, category) => {
          acc[category.id] = category.name
          return acc
        }, {} as Record<number, string>)
        setCategories(categoriesMap)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, isLoading }
}

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
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user } = useAuth()
  const { brands } = useBrands()
  const { categories } = useCategories()

  if (!product) return null

  const getImageUrl = (product: Product) => {
    // Fonction pour vérifier si une URL est valide
    const isValidUrl = (url: string): boolean => {
      if (!url) return false;
      // Vérifier si c'est une URL absolue
      if (url.startsWith('http://') || url.startsWith('https://')) return true;
      // Vérifier si c'est une URL relative
      if (url.startsWith('/')) return true;
      return false;
    };
    
    // Essayer d'abord les images du tableau
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      // Vérifier si c'est un objet ProductImage
      if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage && 'publicId' in firstImage) {
        const url = (firstImage as ProductImage).url;
        if (isValidUrl(url)) return url;
      }
      // Vérifier si c'est une chaîne de caractères (ancien format)
      else if (typeof firstImage === 'string') {
        if (isValidUrl(firstImage)) return firstImage;
      }
    }
    
    // Essayer ensuite l'image principale
    if (product.image && isValidUrl(product.image)) {
      return product.image;
    }
    
    // Essayer enfin l'image_url
    if (product.image_url && isValidUrl(product.image_url)) {
      return product.image_url;
    }
    
    return "/placeholder.png";
  }

  const handleImageError = () => {
    setImageError(true);
  }

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
        colorLabel: colorInfo.label,
        stock: variant.stock
      }

      const cartItemId = `${product.id}-${size}-${color}`
      addItem({
        id: cartItemId,
        name: `${product.name} (${size}, ${cartVariant.colorLabel})`,
        price: product.price,
        quantity: quantity,
        image: getImageUrl(product),
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
        description: error instanceof Error ? error.message : "Impossible d&apos;ajouter le produit au panier. Veuillez réessayer.",
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
            {imageError ? (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageOff className="w-8 h-8 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={getImageUrl(product)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={viewMode === "list" ? "192px" : "(max-width: 768px) 100vw, 25vw"}
                onError={handleImageError}
              />
            )}
            
            {/* Bouton favoris (toujours visible) */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute top-2 right-2 z-10",
                "w-9 h-9 rounded-full",
                "bg-zinc-200/80 dark:bg-zinc-700/80 backdrop-blur-sm",
                "hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90",
                isFavorite(product.id) 
                  ? "text-red-500" 
                  : "text-zinc-500 dark:text-zinc-400"
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className="w-[18px] h-[18px]" fill={isFavorite(product.id) ? "currentColor" : "none"} />
            </Button>
            
            {/* Boutons desktop (hover) */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 
              transition-all duration-300 hidden sm:flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "w-8 h-8 rounded-full",
                  "bg-background/95 backdrop-blur-sm",
                  "opacity-0 group-hover:opacity-100",
                  "transition-all duration-300",
                  "hover:scale-110 hover:bg-primary hover:text-background",
                  "shadow-sm"
                )}
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
            "p-3 space-y-1.5",
            viewMode === "list" && "flex-1"
          )}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-medium line-clamp-1">
                  {product.name}
                </p>
                {/* Affichage de la marque et catégorie */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.brand_id && brands[product.brand_id] && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {brands[product.brand_id]}
                    </span>
                  )}
                  {product.brand_id && brands[product.brand_id] && product.category_id && categories[product.category_id] && (
                    <span className="text-xs text-muted-foreground">•</span>
                  )}
                  {product.category_id && categories[product.category_id] && (
                    <span className="text-xs text-muted-foreground">
                      {categories[product.category_id]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Couleurs disponibles - Taille augmentée */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-2 overflow-hidden mt-2">
                <span className="text-xs font-medium text-muted-foreground">Couleurs:</span>
                <div className="flex items-center gap-1.5">
                  {Array.from(new Set(product.variants.map(v => v.color.toLowerCase())))
                    .slice(0, 3)
                    .map((color, index) => {
                      const colorInfo = getColorInfo(color)
                      return (
                        <div 
                          key={index}
                          className={cn(
                            "h-4 w-4 rounded-full", 
                            isWhiteColor(color) && "border border-gray-200"
                          )}
                          style={{ background: colorInfo.hex }}
                          title={colorInfo.label}
                        />
                      )
                    })}
                  {Array.from(new Set(product.variants.map(v => v.color.toLowerCase()))).length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{Array.from(new Set(product.variants.map(v => v.color.toLowerCase()))).length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tailles disponibles - Taille augmentée */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-2 overflow-hidden mt-1.5">
                <span className="text-xs font-medium text-muted-foreground">Tailles:</span>
                <div className="flex items-center gap-1.5">
                  {Array.from(new Set(product.variants.map(v => v.size)))
                    .slice(0, 5)
                    .map((size, index) => (
                      <span 
                        key={index} 
                        className="text-xs text-foreground"
                      >
                        {size}{index < Math.min(Array.from(new Set(product.variants.map(v => v.size))).length, 5) - 1 ? "," : ""}
                      </span>
                    ))}
                  {Array.from(new Set(product.variants.map(v => v.size))).length > 5 && (
                    <span className="text-xs text-muted-foreground">...</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-1.5">
              <div className="font-medium text-sm sm:text-base">
                {formatPrice(product.price)}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-muted-foreground hidden sm:block">
                  {product.variants && product.variants.some(v => v.stock > 0) ? 'En stock' : 'Rupture'}
                </div>
              </div>
            </div>
          </div>

          {/* Bouton ajouter au panier sur mobile - positionné en bas à droite */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "sm:hidden absolute bottom-3 right-3 z-10",
              "w-8 h-8 rounded-full",
              "bg-zinc-200/80 dark:bg-zinc-700/80 backdrop-blur-sm",
              "hover:bg-zinc-200/90 dark:hover:bg-zinc-700/90",
              "text-zinc-600 dark:text-zinc-300"
            )}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsModalOpen(true)
            }}
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
          </Button>
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