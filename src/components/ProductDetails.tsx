import React from 'react'
import { motion } from 'framer-motion'
import { ProductGallery } from '@/components/ProductGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Heart, Share2, Truck, RefreshCw, ShieldCheck, ShoppingBag } from 'lucide-react'
import { SimilarProducts } from '@/components/SimilarProducts'
import type { Product, Variant } from '@/lib/api'

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export interface ProductDetailsProps {
  product: Product
  selectedSize: string
  selectedColor: string
  quantity: number
  onSizeChange: (size: string) => void
  onColorChange: (color: string) => void
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  onToggleWishlist: () => void
  onShare: () => void
  isWishlist: boolean
}

// Fonction utilitaire pour vérifier le stock
export function checkProductStock(product: Product, size: string, color: string): boolean {
  const selectedVariant = product.variants?.find(
    (v: Variant) => v.size === size && v.color === color
  )
  return selectedVariant ? selectedVariant.stock > 0 : false
}

export function ProductDetails({
  product,
  selectedSize,
  selectedColor,
  quantity,
  onSizeChange,
  onColorChange,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
  onShare,
  isWishlist,
}: ProductDetailsProps) {
  // Convertir les images en URLs si nécessaire
  const imageUrls = product.images.map(image => 
    typeof image === 'string' ? image : URL.createObjectURL(image)
  )

  // Extraire les tailles et couleurs uniques des variants
  const availableSizes = Array.from(new Set(product.variants?.map((v: Variant) => v.size) || []))
  const availableColors = Array.from(new Set(product.variants?.map((v: Variant) => v.color) || []))

  // Trouver la variante sélectionnée
  const selectedVariant = product.variants?.find(
    (v: Variant) => v.size === selectedSize && v.color === selectedColor
  )

  // Vérifier si la variante sélectionnée est en stock
  const isInStock = checkProductStock(product, selectedSize, selectedColor)

  // Obtenir le stock maximum pour la variante sélectionnée
  const maxStock = selectedVariant?.stock || 1

  return (
    <div className="max-w-[2000px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colonne gauche - Galerie d'images */}
        <div className="lg:h-full">
          <ProductGallery images={imageUrls} productName={product.name} />
        </div>

        {/* Colonne droite - Informations produit */}
        <div className="flex flex-col space-y-4">
          {/* En-tête produit */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
                <p className="text-xl lg:text-2xl font-semibold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={onShare}
              >
                <Share2 className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>

            <Badge 
              variant={isInStock ? "outline" : "destructive"} 
              className={isInStock ? "bg-green-50" : ""}
            >
              {isInStock ? "En stock" : "Rupture de stock"}
            </Badge>

            <p className="text-gray-600 text-sm lg:text-base">
              {product.description}
            </p>
          </div>

          {/* Options de sélection */}
          <div className="space-y-3 border-y py-3">
            {/* Sélecteur de taille */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Taille</label>
                <button className="text-xs text-primary hover:underline">
                  Guide des tailles
                </button>
              </div>
              <Select value={selectedSize} onValueChange={onSizeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une taille" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélecteur de couleur */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Couleur</label>
              <Select value={selectedColor} onValueChange={onColorChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une couleur" />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantité et Ajout au panier */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => quantity > 1 && onQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={(e) => {
                    const newValue = Number(e.target.value)
                    if (newValue >= 1 && newValue <= maxStock) {
                      onQuantityChange(newValue)
                    }
                  }}
                  className="w-20 text-center h-12"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => quantity < maxStock && onQuantityChange(quantity + 1)}
                  disabled={quantity >= maxStock}
                  className="h-12 w-12"
                >
                  +
                </Button>
              </div>
              <div className="flex gap-2 flex-1">
                <Button
                  className="flex-1 h-12 text-lg"
                  size="lg"
                  disabled={!selectedSize || !selectedColor || !isInStock}
                  onClick={onAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={onToggleWishlist}
                >
                  <Heart className={isWishlist ? "fill-red-500 text-red-500" : ""} />
                </Button>
              </div>
            </div>

            {/* Message de stock */}
            {selectedVariant && (
              <p className="text-sm text-gray-600">
                {selectedVariant.stock > 10
                  ? "Stock disponible"
                  : selectedVariant.stock > 0
                  ? `Plus que ${selectedVariant.stock} en stock !`
                  : "Rupture de stock"}
              </p>
            )}
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-t">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Livraison gratuite</p>
                <p className="text-sm text-gray-600">À partir de 100€</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Retours gratuits</p>
                <p className="text-sm text-gray-600">Sous 30 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Garantie authentique</p>
                <p className="text-sm text-gray-600">100% authentique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produits similaires - espacement minimal */}
      <div className="mt-1">
        <SimilarProducts currentProductId={product.id} />
      </div>
    </div>
  )
} 