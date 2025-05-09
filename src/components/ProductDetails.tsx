"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
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
  Tag,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp
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
import type { Product } from '@/lib/api'
import type { Variant } from '@/lib/types/product'
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
import { Calendar } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductTechnicalSpecs } from '@/components/ProductTechnicalSpecs'
import { SizeGuideManager } from '@/components/SizeGuideManager'
import { ColorSelector } from '@/components/ColorSelector'
import { SizeSelector } from '@/components/SizeSelector'
import { StockIndicator } from '@/components/StockIndicator'
import { ProductVariantPreview } from '@/components/ProductVariantPreview'

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
    (variant, index, array) => variant.size === size && variant.color === color
  )
  return selectedVariant ? selectedVariant.stock > 0 : false
}

// Fonction pour obtenir le stock disponible pour une variante
export function getVariantStock(product: Product, size: string, color: string): number {
  if (!product.variants || product.variants.length === 0) return 0;
  
  // Si aucune taille ou couleur n'est sélectionnée, retourner 0
  if (!size || !color) return 0;
  
  const selectedVariant = product.variants.find(
    (variant, index, array) => variant.size === size && variant.color === color
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
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<string[]>([])
  
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

  // Détermine si c'est un produit ASICS
  const isAsicsProduct = 
    product.tags?.some(tag => tag.toLowerCase() === 'asics') ||
    product.name?.toLowerCase().includes('asics') ||
    product.brand.toLowerCase() === 'asics';

  const toggleDetail = (detailId: string) => {
    setExpandedDetails(prev => 
      prev.includes(detailId) 
        ? prev.filter(id => id !== detailId)
        : [...prev, detailId]
    )
  }
  
  // Récupération des images par couleur pour la prévisualisation
  const getVariantImages = () => {
    const colorImages: Record<string, string> = {};
    
    // Utiliser l'image principale si pas de couleur spécifique
    if (product.image_url) {
      colorImages["default"] = product.image_url;
    }
    
    // Essayer de récupérer les images spécifiques par couleur
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any, index: number) => {
        const imgUrl = typeof img === 'string' ? img : img?.url;
        if (imgUrl) {
          if (colors[index]) {
            colorImages[colors[index]] = imgUrl;
          } else if (colors.length > 0 && !colorImages[colors[0]]) {
            // Si pas d'index correspondant mais qu'on a des couleurs, associer à la première couleur sans image
            colorImages[colors[0]] = imgUrl;
          }
        }
      });
    }
    
    // S'assurer que chaque couleur a au moins une image par défaut
    colors.forEach(color => {
      if (!colorImages[color] && product.image_url) {
        colorImages[color] = product.image_url;
      }
    });
    
    return colorImages;
  };
  
  const variantImages = getVariantImages();

  // Fonction pour déterminer le niveau de stock d'une variante
  const getStockLevel = (color: string, size: string) => {
    if (!color || !size) return 'unavailable';
    
    const variant = variants.find(v => v.color === color && v.size === size);
    if (!variant || variant.stock <= 0) return 'unavailable';
    if (variant.stock <= 3) return 'low';
    if (variant.stock <= 10) return 'medium';
    return 'high';
  };

  return (
    <div className="w-full mx-auto px-0 sm:px-4">
      {/* En-tête principal du produit avec informations essentielles */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-3 sm:p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche : image principale et prévisualisation */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative mb-4">
              {product.new && (
                <Badge variant="default" className="absolute top-2 left-2 z-10">
                  Nouveau
                </Badge>
              )}
              {discount && (
                <Badge variant="destructive" className="absolute top-2 right-2 z-10">
                  -{discount}%
                </Badge>
              )}
              <ProductVariantPreview 
                productId={product.id}
                colorImages={variantImages}
                availableColors={colors}
                selectedColor={selectedColor}
                onColorChange={onColorChange}
                variants={variants}
                selectedSize={selectedSize}
              />
            </div>
          </div>
          
          {/* Colonne droite : infos produit et sélecteurs */}
          <div className="flex flex-col">
            {/* En-tête produit */}
            <div className="mb-6">
              {product.brand && (
                <div className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  {product.brand}
                </div>
              )}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-2xl font-bold">
                  {formatPrice(product.price)}
                </div>
                {oldPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(oldPrice)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {currentVariantStock > 0 ? (
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Plus que {currentVariantStock} en stock !</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-destructive">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Rupture de stock</span>
                    </div>
                  )}
                </div>
                
                {product.sku && (
                  <span className="text-xs text-muted-foreground">
                    Réf: {product.sku}
                  </span>
                )}
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            {/* Sélecteurs de variantes */}
            <div className="space-y-6">
              {/* Légende unifiée des niveaux de stock */}
              <div className="flex items-center text-xs py-2 px-3 bg-zinc-50 dark:bg-zinc-800 rounded-md mb-2 text-zinc-700 dark:text-zinc-300">
                <div className="flex flex-col space-y-1">
                  <div className="font-medium">Information sur la disponibilité</div>
                  <div>Les produits indisponibles apparaissent grisés</div>
                </div>
              </div>

              {/* Sélection de taille */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium dark:text-zinc-200">
                    Taille: {selectedSize || "Sélectionnez"}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
                    onClick={() => setShowSizeGuide(true)}
                  >
                    Guide des tailles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <SizeSelector
                  sizes={sizes}
                  variants={variants}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  onSizeChange={onSizeChange}
                />
              </div>
              
              {/* Sélection de couleur */}
              <div className="space-y-4">
                <ColorSelector
                  colors={colors}
                  variants={variants}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  onColorChange={onColorChange}
                  productImages={variantImages}
                />
              </div>
              
              {/* Quantité */}
              {selectedSize && selectedColor && currentVariantStock > 0 && (
                <div className="space-y-2">
                  <label className="font-medium dark:text-zinc-200">
                    Quantité
                  </label>
                  <div className="flex items-center w-full max-w-[200px]">
                    <Button
                      variant="outline"
                      className="h-10 px-3 rounded-r-none dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="h-10 flex-1 border-y border-input dark:border-zinc-700 flex items-center justify-center font-medium dark:bg-zinc-800 dark:text-zinc-200">
                      {quantity}
                    </div>
                    <Button
                      variant="outline"
                      className="h-10 px-3 rounded-l-none dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      onClick={() => onQuantityChange(Math.min(currentVariantStock, quantity + 1))}
                      disabled={quantity >= currentVariantStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400">
                    {currentVariantStock} disponible{currentVariantStock > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  size="lg"
                  className={cn(
                    "w-full",
                    "bg-black hover:bg-zinc-800 text-white",
                    "dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
                  )}
                  onClick={onAddToCart}
                  disabled={!isInStock || !selectedSize || !selectedColor || currentVariantStock <= 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>

                <div className="flex gap-3">
                  {onToggleWishlist && (
                    <Button
                      variant="outline"
                      className="flex-1 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      onClick={onToggleWishlist}
                    >
                      <Heart className={cn(
                        "h-5 w-5 mr-2",
                        isWishlist && "fill-current text-red-500"
                      )} />
                      {isWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
                    </Button>
                  )}
                  
                  {onShare && (
                    <Button
                      variant="outline"
                      className="flex-1 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      onClick={onShare}
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Partager
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Description et informations produit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Description */}
        {product.description && (
          <div className="lg:col-span-2 space-y-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              {product.description}
            </div>
          </div>
        )}
        
        {/* Caractéristiques techniques */}
        {product.details && product.details.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Caractéristiques</h2>
            <ProductTechnicalSpecs 
              specs={product.details.map(detail => {
                const [name, ...descriptionParts] = detail.split(':')
                const value = descriptionParts.join(':').trim()
                return {
                  code: name.slice(0, 2).toUpperCase(),
                  title: name.trim(),
                  value: value,
                  description: value
                }
              })}
            />
          </div>
        )}
      </div>

      {/* Informations de livraison */}
      <Card className="mt-8">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Livraison gratuite</h3>
              <p className="text-sm text-muted-foreground">
                Pour toute commande supérieure à 100€
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Retours gratuits</h3>
              <p className="text-sm text-muted-foreground">
                Sous 30 jours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Paiement sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Vos données sont protégées
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide des tailles (Drawer) */}
      <Drawer open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="px-4 py-3">
            <DrawerTitle>Guide des tailles</DrawerTitle>
            <DrawerDescription>
              Trouvez votre taille parfaite avec notre guide détaillé
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-2 overflow-y-auto">
            <SizeGuideManager 
              productSizeChart={product.size_chart} 
              storeType={product.store_type}
              availableSizes={Array.from(new Set(variants.map(v => v.size)))}
            />
          </div>
          <DrawerFooter className="px-4 py-3 border-t">
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
} 