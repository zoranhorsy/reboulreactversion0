import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Package, 
  ShoppingCart, 
  Check,
  AlertCircle,
  Ruler,
  CircleDot,
  Minus,
  Plus
} from "lucide-react"
import type { Product } from "@/lib/api"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ProductImages } from "@/components/products/ProductImages"

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

interface ProductVariantModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (size: string, color: string, quantity: number) => void
}

export function ProductVariantModal({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart 
}: ProductVariantModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Extraire les tailles et couleurs uniques des variantes
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size)))
  const availableColors = Array.from(new Set(product.variants.map(v => v.color)))

  // Vérifier si une combinaison taille/couleur est disponible
  const isVariantAvailable = (size: string, color: string) => {
    return product.variants.some(
      v => v.size === size && v.color === color && v.stock > 0
    )
  }

  // Vérifier si une taille est disponible avec la couleur sélectionnée
  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return true
    return isVariantAvailable(size, selectedColor)
  }

  // Vérifier si une couleur est disponible avec la taille sélectionnée
  const isColorAvailable = (color: string) => {
    if (!selectedSize) return true
    return isVariantAvailable(selectedSize, color)
  }

  // Obtenir le stock pour une combinaison donnée
  const getVariantStock = (size: string, color: string) => {
    const variant = product.variants.find(
      v => v.size === size && v.color === color
    )
    return variant?.stock || 0
  }

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      onAddToCart(selectedSize, selectedColor, quantity)
      onClose()
      // Réinitialiser les sélections
      setSelectedSize("")
      setSelectedColor("")
      setQuantity(1)
    }
  }

  const maxStock = selectedSize && selectedColor 
    ? getVariantStock(selectedSize, selectedColor)
    : 0

  const canAddToCart = selectedSize && selectedColor && 
    isVariantAvailable(selectedSize, selectedColor) &&
    quantity > 0 && quantity <= maxStock

  const images = [
    product.image_url,
    ...(Array.isArray(product.images) ? product.images : [])
  ].filter(Boolean)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-6">
            <ProductImages product={product} size="md" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-1">{product.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-4">
                <span className="text-primary font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(product.price)}
                </span>
                {product.stock > 0 ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    En stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                    Rupture de stock
                  </Badge>
                )}
              </DialogDescription>
              {product.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Sélection de la taille */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Taille</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Ruler className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Guide des tailles</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup 
                value={selectedSize} 
                onValueChange={setSelectedSize}
                className="grid grid-cols-4 gap-2"
              >
                {availableSizes.map((size) => {
                  const available = isSizeAvailable(size)
                  return (
                    <div key={size}>
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="peer sr-only"
                        disabled={!available}
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center h-10 rounded-md border-2 peer-data-[state=checked]:border-primary
                          peer-data-[state=checked]:text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50
                          hover:bg-accent/5 transition-colors cursor-pointer"
                      >
                        {size}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Sélection de la couleur */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Couleur</Label>
              <RadioGroup 
                value={selectedColor} 
                onValueChange={setSelectedColor}
                className="grid grid-cols-6 gap-2"
              >
                {availableColors.map((color) => {
                  const available = isColorAvailable(color)
                  const colorInfo = colorMap[color.toLowerCase()] || { 
                    hex: color, 
                    label: color.charAt(0).toUpperCase() + color.slice(1)
                  }
                  
                  return (
                    <div key={color}>
                      <RadioGroupItem
                        value={color}
                        id={`color-${color}`}
                        className="peer sr-only"
                        disabled={!available}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor={`color-${color}`}
                              className="block w-10 h-10 rounded-full border-2 relative cursor-pointer
                                peer-data-[state=checked]:border-primary peer-disabled:cursor-not-allowed 
                                peer-disabled:opacity-50 hover:scale-110 transition-transform"
                              style={{
                                background: colorInfo.hex.startsWith('linear-gradient') 
                                  ? colorInfo.hex 
                                  : colorInfo.hex,
                                borderColor: colorInfo.hex === "#FFFFFF" ? "#e2e8f0" : "transparent"
                              }}
                            >
                              <div className="peer-data-[state=checked]:block hidden absolute inset-0 flex items-center justify-center">
                                <Check className={`w-4 h-4 ${
                                  colorInfo.hex === "#FFFFFF" || colorInfo.hex === "#F5F5DC" 
                                    ? "text-black" 
                                    : "text-white"
                                }`} />
                              </div>
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{colorInfo.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Sélection de la quantité */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Quantité</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="h-8 px-4 flex items-center justify-center border-y">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {maxStock > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {maxStock} unité{maxStock > 1 ? 's' : ''} disponible{maxStock > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Stock disponible et message d'erreur */}
            {selectedSize && selectedColor && (
              <>
                {isVariantAvailable(selectedSize, selectedColor) ? (
                  <div className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-center gap-2">
                      <CircleDot className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Récapitulatif</span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Taille sélectionnée : <span className="font-medium text-foreground">{selectedSize}</span></p>
                      <p>Couleur sélectionnée : <span className="font-medium text-foreground">{colorMap[selectedColor.toLowerCase()]?.label || selectedColor}</span></p>
                      <p>Quantité : <span className="font-medium text-foreground">{quantity}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Combinaison non disponible</span>
                    </div>
                    <p className="text-sm">
                      Cette combinaison de taille et de couleur n&apos;est pas disponible actuellement.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t">
          <div className="w-full space-y-3">
            {canAddToCart && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(product.price * quantity)}
                </span>
              </div>
            )}
            <Button
              className="w-full gap-2"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

