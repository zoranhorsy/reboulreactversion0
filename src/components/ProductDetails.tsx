'use client'

import React, { useState, useEffect } from 'react'
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
  Star,
  Tag
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
import { SizeGuide } from '@/components/SizeGuide'
import { SocialShare } from '@/components/SocialShare'
import { api } from '@/lib/api'
import { useCart } from '@/app/contexts/CartContext'
import { toast } from '@/components/ui/use-toast'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getColorInfo, isWhiteColor } from '@/config/productColors'

// Fonction pour transformer le type de magasin en nom d'affichage
const getStoreDisplayName = (storeType: string | undefined): string => {
  if (!storeType) return '';
  
  switch (storeType) {
    case 'adult':
      return 'REBOUL ADULTE';
    case 'kids':
      return 'LES MINOTS DE REBOUL';
    case 'sneakers':
      return 'REBOUL SNEAKERS';
    case 'cpcompany':
      return 'THE CORNER - C.P.COMPANY';
    default:
      return storeType;
  }
};

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
  if (!product.variants || product.variants.length === 0) return true; // Considérer comme disponible par défaut
  
  // Si aucune taille ou couleur n'est sélectionnée, vérifier si au moins une variante a du stock
  if (!size || !color) {
    return product.variants.some(v => v.stock > 0);
  }
  
  // Sinon, vérifier si la variante sélectionnée a du stock
  const selectedVariant = product.variants.find(
    (v: Variant) => v.size === size && v.color === color
  )
  return selectedVariant ? selectedVariant.stock > 0 : false
}

// Fonction pour obtenir le stock disponible pour une variante
export function getVariantStock(product: Product, size: string, color: string): number {
  if (!product.variants || product.variants.length === 0) return 0;
  
  // Si aucune taille ou couleur n'est sélectionnée, retourner 0
  if (!size || !color) return 0;
  
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
  const oldPrice = (product as any).old_price;
  const discount = oldPrice && product.price 
    ? Math.round(((oldPrice - product.price) / oldPrice) * 100) 
    : null;

  return (
    <div className="space-y-6">
      {/* En-tête produit avec badges et prix */}
      <div className="space-y-4">
        <div className="space-y-2">
          {/* Nom du produit */}
          <h1 className="text-3xl font-light tracking-tight">{product.name}</h1>
          
          {/* Prix et réduction */}
          <div className="flex items-baseline gap-3 mt-1">
            <p className="text-2xl font-medium">
              {formatPrice(product.price)}
            </p>
            {oldPrice && (
              <p className="text-lg text-muted-foreground line-through">
                {formatPrice(oldPrice)}
              </p>
            )}
            {discount && discount > 0 && (
              <Badge variant="destructive" className="px-3 py-1.5 text-xs font-medium tracking-wider">
                -{discount}%
              </Badge>
            )}
          </div>
          
          {/* Tags du produit */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {product.tags.map((tag, index) => (
                <div key={index} className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <Tag className="h-3 w-3 mr-1" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Référence, SKU et Type de magasin */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
            {product.sku && (
              <div className="flex items-center gap-1">
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
            )}
            {(product as any).store_reference && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Réf. Magasin:</span> {(product as any).store_reference}
              </div>
            )}
            {product.store_type && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Boutique:</span> {getStoreDisplayName(product.store_type)}
              </div>
            )}
          </div>
          
          {/* Informations de livraison */}
          {product.price && product.price >= 100 ? (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <Truck className="w-4 h-4" />
              <span className="text-sm font-medium">Livraison gratuite</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <Truck className="w-4 h-4" />
              <span className="text-sm">Livraison à partir de 4,99€</span>
            </div>
          )}
          
          {/* Description du produit */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>{product.description}</p>
          </div>
          
          {/* Caractéristiques */}
          {product.details && product.details.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Caractéristiques:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="bg-border/10" />
      
      {/* Sélection des variantes */}
      <div className="space-y-6">
        {/* Sélecteur de couleurs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Couleur: <span className="text-muted-foreground">{selectedColor ? getColorInfo(selectedColor).label : 'Sélectionnez une couleur'}</span></h3>
            {/* Information sur le stock */}
            {selectedSize && selectedColor && (
              <span className={`text-xs ${isInStock ? 'text-green-500' : 'text-red-500'}`}>
                {isInStock 
                  ? currentVariantStock > 5 ? 'En stock' : `Plus que ${currentVariantStock} en stock` 
                  : 'Rupture de stock'}
              </span>
            )}
          </div>
          
          {/* Options de couleurs */}
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const colorInfo = getColorInfo(color);
              const isWhite = isWhiteColor(colorInfo.hex);
              
              return (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  aria-label={`Sélectionner couleur ${colorInfo.label}`}
                  className={cn(
                    "relative px-3 py-2 rounded-md flex items-center justify-center",
                    "transition-all duration-200 ease-in-out border",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    selectedColor === color 
                      ? "border-primary bg-primary/10 font-medium" 
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-4 h-4 rounded border",
                        isWhite && "border-zinc-300 dark:border-zinc-600"
                      )}
                      style={{ 
                        backgroundColor: colorInfo.hex.startsWith('linear-gradient') 
                          ? colorInfo.hex 
                          : colorInfo.hex
                      }}
                    />
                    <span className="text-sm">{colorInfo.label}</span>
                  </div>
                  {selectedColor === color && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
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
              {!selectedColor ? (
                <div className="col-span-4 text-center py-3 text-sm text-muted-foreground bg-muted/30 rounded-md">
                  Veuillez d&apos;abord sélectionner une couleur
                </div>
              ) : (
                sizes.map((size) => {
                  // Vérifier si la taille est disponible pour la couleur sélectionnée
                  const isSizeAvailable = variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
                  
                  // Ne pas afficher les tailles indisponibles pour la couleur sélectionnée
                  if (!isSizeAvailable) return null;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => onSizeChange(size)}
                      className={cn(
                        "h-12 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
                        selectedSize === size 
                          ? "border-primary bg-primary/5 font-medium" 
                          : "border-border hover:border-primary/50 hover:bg-primary/5",
                      )}
                    >
                      {size}
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Indicateur de stock */}
            <div className="flex items-center gap-2 text-sm">
              {!selectedSize || !selectedColor ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Sélectionnez une taille et une couleur pour voir la disponibilité
                  </span>
                </>
              ) : isInStock ? (
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
      
      {/* Avantages d'achat */}
      <div className="mt-8 space-y-4">
        <h3 className="font-medium">Pourquoi nous choisir</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center border border-border">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Garantie authentique</h4>
              <p className="text-xs text-muted-foreground">Tous nos produits sont 100% authentiques</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center border border-border">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Livraison rapide</h4>
              <p className="text-xs text-muted-foreground">Livraison gratuite à partir de 100€</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center border border-border">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Retours sous 30 jours</h4>
              <p className="text-xs text-muted-foreground">Retours gratuits en boutique ou à domicile</p>
            </div>
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