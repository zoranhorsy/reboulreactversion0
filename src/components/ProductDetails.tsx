'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Share2, 
  Truck, 
  RefreshCw, 
  ShieldCheck, 
  ShoppingBag, 
  Check, 
  AlertCircle,
  Minus,
  Plus,
  Star
} from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from '@/lib/utils'
import type { Product, Variant } from '@/lib/api'
import { ProductImage } from '@/lib/types/product-image'

// Fonction utilitaire pour formater les prix
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return 'Prix sur demande';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  if (!product.variants || product.variants.length === 0) return true;
  
  const selectedVariant = product.variants.find(
    (v: Variant) => v.size === size && v.color === color
  )
  return selectedVariant ? selectedVariant.stock > 0 : false
}

// Fonction pour obtenir le stock disponible pour une variante
export function getVariantStock(product: Product, size: string, color: string): number {
  if (!product.variants || product.variants.length === 0) return 0;
  
  const selectedVariant = product.variants.find(
    (v: Variant) => v.size === size && v.color === color
  )
  return selectedVariant ? selectedVariant.stock : 0;
}

// Fonction pour calculer le stock total
export function calculateTotalStock(variants: Variant[] | undefined): number {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
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
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const variants = product.variants || [];
  const colors = Array.from(new Set(variants.map(v => v.color)));
  const sizes = Array.from(new Set(variants.map(v => v.size)));
  
  const currentVariantStock = getVariantStock(product, selectedSize, selectedColor);
  const isInStock = checkProductStock(product, selectedSize, selectedColor);
  const totalStock = calculateTotalStock(variants);
  
  // Calcul de la réduction si old_price existe
  const discount = product.old_price && product.price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : null;

  // Fonction pour obtenir la couleur d'affichage
  const getDisplayColor = (colorCode: string): { name: string, hex: string } => {
    const colorMap: Record<string, { name: string, hex: string }> = {
      'black': { name: 'Noir', hex: '#000000' },
      'white': { name: 'Blanc', hex: '#FFFFFF' },
      'red': { name: 'Rouge', hex: '#FF0000' },
      'blue': { name: 'Bleu', hex: '#0000FF' },
      'green': { name: 'Vert', hex: '#008000' },
      'yellow': { name: 'Jaune', hex: '#FFFF00' },
      'purple': { name: 'Violet', hex: '#800080' },
      'orange': { name: 'Orange', hex: '#FFA500' },
      'pink': { name: 'Rose', hex: '#FFC0CB' },
      'gray': { name: 'Gris', hex: '#808080' },
      'brown': { name: 'Marron', hex: '#A52A2A' },
      'navy': { name: 'Bleu Marine', hex: '#000080' },
    };
    
    return colorMap[colorCode.toLowerCase()] || { name: colorCode, hex: colorCode };
  };

  return (
    <div className="space-y-6">
      {/* En-tête produit avec badges et prix */}
      <div className="space-y-4">
        <div className="space-y-2">
          {/* Nom du produit */}
          <h1 className="text-3xl font-light tracking-tight">{product.name}</h1>
          
          {/* Évaluation */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={cn(
                    "w-4 h-4", 
                    star <= (product.rating || 4) 
                      ? "text-amber-400 fill-amber-400" 
                      : "text-muted-foreground"
                  )} 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating || 4}/5 ({product.reviews_count || 12} avis)
            </span>
          </div>
        </div>
        
        {/* Prix et réduction */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-medium">
              {formatPrice(product.price)}
            </p>
            {product.old_price && (
              <p className="text-lg text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </p>
            )}
            {discount && discount > 0 && (
              <Badge variant="destructive" className="px-3 py-1.5 text-xs font-medium tracking-wider">
                -{discount}%
              </Badge>
            )}
          </div>
          
          {/* Informations de livraison */}
          {product.price && product.price >= 100 ? (
            <div className="flex items-center gap-2 text-green-600">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium">Livraison gratuite</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span className="text-sm">Livraison à partir de 4,99€</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="bg-border/10" />
      
      {/* Sélection des variantes */}
      <div className="space-y-6">
        {/* Sélection de couleur */}
        {colors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Couleur</label>
              <span className="text-sm text-muted-foreground">
                {selectedColor ? getDisplayColor(selectedColor).name : 'Sélectionnez une couleur'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => {
                const displayColor = getDisplayColor(color);
                const isSelected = selectedColor === color;
                const hasStock = variants.some(v => v.color === color && v.size === selectedSize && v.stock > 0);
                
                return (
                  <TooltipProvider key={color}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onColorChange(color)}
                          disabled={!hasStock}
                          className={cn(
                            "relative w-12 h-12 rounded-full transition-all duration-200",
                            isSelected 
                              ? "ring-2 ring-primary scale-95" 
                              : "ring-1 ring-border hover:ring-primary/50",
                            !hasStock && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <span 
                            className="absolute inset-1 rounded-full border border-border/20"
                            style={{ backgroundColor: displayColor.hex }}
                          />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white drop-shadow-md" />
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{displayColor.name}</p>
                        {!hasStock && <p className="text-xs text-destructive">Rupture de stock</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Sélection de taille */}
        {sizes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Taille</label>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={() => setShowSizeGuide(true)}
              >
                Guide des tailles
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => {
                const hasStock = variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
                return (
                  <button
                    key={size}
                    onClick={() => onSizeChange(size)}
                    disabled={!hasStock}
                    className={cn(
                      "h-12 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                      selectedSize === size 
                        ? "border-primary bg-primary/5 font-medium" 
                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                      !hasStock && "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            
            {/* Indicateur de stock */}
            <div className="flex items-center gap-2 text-sm">
              {isInStock ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">
                    En stock ({currentVariantStock} disponible{currentVariantStock > 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">Rupture de stock</span>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Sélection de quantité */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quantité</label>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => quantity > 1 && onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="h-10 px-4 flex items-center justify-center border-y border-input min-w-[4rem]">
              {quantity}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => quantity < (currentVariantStock || 10) && onQuantityChange(quantity + 1)}
              disabled={quantity >= (currentVariantStock || 10)}
              className="h-10 w-10 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="ml-4 text-sm text-muted-foreground">
              {currentVariantStock > 0 && (
                <span>Maximum: {currentVariantStock}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="bg-border/10" />
      
      {/* Boutons d'action */}
      <div className="space-y-4">
        <Button 
          size="lg" 
          className="w-full text-base font-medium tracking-wide h-14"
          onClick={onAddToCart}
          disabled={!isInStock}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Ajouter au panier
        </Button>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 font-medium"
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
            size="lg"
            className="flex-1 font-medium"
            onClick={onShare}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Partager
          </Button>
        </div>
      </div>
      
      {/* Avantages et services */}
      <div className="grid grid-cols-1 gap-4 py-6 border-t border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Livraison rapide</p>
            <p className="text-xs text-muted-foreground">Livraison gratuite à partir de 100€</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Retours gratuits</p>
            <p className="text-xs text-muted-foreground">Retours sous 30 jours</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Garantie authentique</p>
            <p className="text-xs text-muted-foreground">Tous nos produits sont 100% authentiques</p>
          </div>
        </div>
      </div>
      
      {/* Guide des tailles (Drawer) */}
      <Drawer open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Guide des tailles</DrawerTitle>
            <DrawerDescription>
              Trouvez votre taille parfaite avec notre guide détaillé
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left font-medium">Taille</th>
                    <th className="py-2 px-4 text-left font-medium">EU</th>
                    <th className="py-2 px-4 text-left font-medium">US</th>
                    <th className="py-2 px-4 text-left font-medium">UK</th>
                    <th className="py-2 px-4 text-left font-medium">CM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">XS</td>
                    <td className="py-2 px-4">36-38</td>
                    <td className="py-2 px-4">4-6</td>
                    <td className="py-2 px-4">8-10</td>
                    <td className="py-2 px-4">84-88</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">S</td>
                    <td className="py-2 px-4">38-40</td>
                    <td className="py-2 px-4">6-8</td>
                    <td className="py-2 px-4">10-12</td>
                    <td className="py-2 px-4">88-92</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">M</td>
                    <td className="py-2 px-4">40-42</td>
                    <td className="py-2 px-4">8-10</td>
                    <td className="py-2 px-4">12-14</td>
                    <td className="py-2 px-4">92-96</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">L</td>
                    <td className="py-2 px-4">42-44</td>
                    <td className="py-2 px-4">10-12</td>
                    <td className="py-2 px-4">14-16</td>
                    <td className="py-2 px-4">96-100</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">XL</td>
                    <td className="py-2 px-4">44-46</td>
                    <td className="py-2 px-4">12-14</td>
                    <td className="py-2 px-4">16-18</td>
                    <td className="py-2 px-4">100-104</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Comment mesurer</h4>
              <p className="text-sm text-muted-foreground">
                Pour trouver votre taille idéale, mesurez votre tour de poitrine, de taille et de hanches. Comparez ensuite vos mesures avec notre tableau des tailles.
              </p>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
} 