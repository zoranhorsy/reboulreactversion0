"use client"

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

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête du produit */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              {product.brand}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatPrice(product.price)}
            </div>
            {product.old_price && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.new && (
            <Badge variant="default">Nouveau</Badge>
          )}
          {product.featured && (
            <Badge variant="secondary">En vedette</Badge>
          )}
          <Badge 
            variant="outline" 
            className={cn(
              "font-medium",
              currentVariantStock === 0 && "text-destructive border-destructive",
              currentVariantStock && currentVariantStock <= 5 && "text-orange-500 border-orange-500",
              currentVariantStock && currentVariantStock > 5 && "text-green-500 border-green-500"
            )}
          >
            {currentVariantStock === 0 && "Rupture de stock"}
            {currentVariantStock && currentVariantStock <= 5 && "Plus que quelques exemplaires"}
            {currentVariantStock && currentVariantStock > 5 && "En stock"}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Sélection des variantes */}
      <div className="space-y-6">
        {/* Tailles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Taille
            </label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowSizeGuide(true)}
            >
              Guide des tailles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = variants.some(
                v => v.size === size && v.stock > 0
              )
              return (
                <TooltipProvider key={size}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 min-w-[2.5rem]",
                          !isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => isAvailable && onSizeChange(size)}
                        disabled={!isAvailable}
                      >
                        {size}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isAvailable ? "Disponible" : "Rupture de stock"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </div>

        {/* Couleurs */}
        {selectedSize && (
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Couleur
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isAvailable = variants.some(
                  v => v.size === selectedSize && v.color === color && v.stock > 0
                )
                return (
                  <TooltipProvider key={color}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedColor === color ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-9",
                            !isAvailable && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => isAvailable && onColorChange(color)}
                          disabled={!isAvailable}
                        >
                          {color}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isAvailable ? "Disponible" : "Rupture de stock"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantité */}
        {selectedSize && selectedColor && currentVariantStock && currentVariantStock > 0 && (
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Quantité
            </label>
            <Select
              value={quantity.toString()}
              onValueChange={(value) => onQuantityChange(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Qté" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(currentVariantStock, 10) }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full"
          onClick={onAddToCart}
          disabled={isInStock && (!selectedSize || !selectedColor || !currentVariantStock)}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Ajouter au panier
        </Button>

        <div className="flex gap-4">
          {onToggleWishlist && (
            <Button
              variant="outline"
              className="flex-1"
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
              className="flex-1"
              onClick={onShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Partager
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Description */}
      {product.description && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Description</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            {product.description}
          </div>
        </div>
      )}

      {/* Caractéristiques techniques */}
      {product.details && product.details.length > 0 && (
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
      )}

      {/* Informations de livraison */}
      <Card>
        <CardContent className="grid gap-4 p-6">
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