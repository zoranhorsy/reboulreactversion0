import React from 'react'
import { motion } from 'framer-motion'
import { ProductGallery } from '@/components/ProductGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Heart, Share2, Truck, RefreshCw, ShieldCheck, ShoppingBag, ChevronRight } from 'lucide-react'
import { SimilarProducts } from '@/components/SimilarProducts'
import { RecommendedProducts } from '@/components/RecommendedProducts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product, Variant } from '@/lib/api'

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

interface ProductDetailsProps {
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
  const images = product.images || []
  const variants = product.variants || []
  const colors = Array.from(new Set(variants.map(v => v.color)))
  const sizes = Array.from(new Set(variants.map(v => v.size)))

  return (
    <div className="max-w-[1400px] mx-auto px-4">
      {/* Section principale du produit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        {/* Galerie d'images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProductGallery images={images} productName={product.name} />
        </motion.div>

        {/* Informations produit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* En-tête produit */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {product.brand && (
                <Badge variant="outline" className="text-xs font-medium tracking-wider">
                  {product.brand}
                </Badge>
              )}
              {product.category && (
                <Badge variant="outline" className="text-xs font-medium tracking-wider">
                  {product.category}
                </Badge>
              )}
            </div>
            <h1 className="font-geist text-3xl font-light tracking-tight">{product.name}</h1>
            <div className="flex items-baseline gap-4">
              <span className="font-geist text-2xl">{formatPrice(product.price)}</span>
              {product.old_price && (
                <span className="font-geist text-lg text-muted-foreground line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
          </div>

          {/* Sélecteurs et actions */}
          <div className="space-y-6">
            {/* Sélecteur de couleur */}
            {colors.length > 0 && (
              <div className="space-y-4">
                <label className="font-geist text-sm font-medium">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onColorChange(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sélecteur de taille */}
            {sizes.length > 0 && (
              <div className="space-y-4">
                <label className="font-geist text-sm font-medium">Taille</label>
                <Select value={selectedSize} onValueChange={onSizeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sélecteur de quantité */}
            <div className="space-y-4">
              <label className="font-geist text-sm font-medium">Quantité</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value, 10))}
                className="w-24"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col gap-4">
              <Button 
                size="lg" 
                className="w-full font-geist text-sm tracking-wider"
                onClick={onAddToCart}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ajouter au panier
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 font-geist text-sm tracking-wider"
                  onClick={onToggleWishlist}
                >
                  <Heart className="w-4 h-4 mr-2" fill={isWishlist ? "currentColor" : "none"} />
                  Favoris
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 font-geist text-sm tracking-wider"
                  onClick={onShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 gap-4 py-6 border-t border-b">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-geist text-sm font-medium">Livraison gratuite</p>
                <p className="font-geist text-xs text-muted-foreground">À partir de 100€</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-geist text-sm font-medium">Retours gratuits</p>
                <p className="font-geist text-xs text-muted-foreground">Sous 30 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-geist text-sm font-medium">Garantie authentique</p>
                <p className="font-geist text-xs text-muted-foreground">100% authentique</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Onglets d'information */}
      <div className="mb-24">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent">
            <TabsTrigger value="description" className="font-geist text-sm tracking-wider">
              Description
            </TabsTrigger>
            <TabsTrigger value="details" className="font-geist text-sm tracking-wider">
              Détails
            </TabsTrigger>
            <TabsTrigger value="delivery" className="font-geist text-sm tracking-wider">
              Livraison
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-8">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="font-geist text-base leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-8">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <ul className="font-geist text-base leading-relaxed space-y-2">
                {product.details?.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="delivery" className="mt-8">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="font-geist text-base leading-relaxed space-y-4">
                <p>
                  Livraison standard gratuite pour toute commande supérieure à 100€.
                  Délai de livraison estimé : 2-4 jours ouvrés.
                </p>
                <p>
                  Retours gratuits sous 30 jours à compter de la réception de votre commande.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Produits similaires et recommandés */}
      <div className="space-y-24">
        <SimilarProducts currentProductId={product.id} />
        {product.category && (
          <RecommendedProducts currentProductId={product.id} category={product.category} />
        )}
      </div>
    </div>
  )
} 