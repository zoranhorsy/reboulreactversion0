import { useEffect, useMemo, useState } from "react"
import { Product } from "@/lib/types/product"
import { Variant } from "@/lib/types/variant"
import { TheCornerColorSelector } from "./TheCornerColorSelector"
import { TheCornerSizeSelector } from "./TheCornerSizeSelector"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/app/contexts/CartContext"

interface TheCornerProductDetailProps {
  product: Product
}

export function TheCornerProductDetail({ product }: TheCornerProductDetailProps) {
  const { toast } = useToast()
  const { addItem } = useCart()
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")

  const variants = useMemo(() => {
    return product.variants || []
  }, [product.variants])

  const availableColors = useMemo(() => {
    const colors = new Set<string>()
    variants.forEach((variant) => {
      if (variant.stock > 0) {
        colors.add(variant.color)
      }
    })
    return Array.from(colors)
  }, [variants])

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>()
    variants.forEach((variant) => {
      if (variant.stock > 0 && (!selectedColor || variant.color === selectedColor)) {
        sizes.add(variant.size)
      }
    })
    return Array.from(sizes)
  }, [variants, selectedColor])

  useEffect(() => {
    // Sélectionner automatiquement la première couleur disponible
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0])
    }
  }, [availableColors, selectedColor])

  useEffect(() => {
    // Sélectionner automatiquement la première taille disponible pour la couleur sélectionnée
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0])
    }
  }, [availableSizes, selectedSize, selectedColor])

  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const image = product.images[0]
      if (typeof image === 'string') return image
      if (typeof image === 'object' && 'url' in image) return image.url
    }
    if (product.image_url) return product.image_url
    if (product.image) return product.image
    return "/placeholder.svg"
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une couleur et une taille",
        variant: "destructive",
      })
      return
    }

    const selectedVariant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    )

    if (!selectedVariant) {
      toast({
        title: "Erreur",
        description: "Cette variante n'est pas disponible",
        variant: "destructive",
      })
      return
    }

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`
    addItem({
      id: cartItemId,
      name: `${product.name} - ${selectedColor} - ${selectedSize}`,
      price: product.price,
      quantity: 1,
      image: getImageUrl(product),
      variant: {
        size: selectedSize,
        color: selectedColor,
        colorLabel: selectedColor,
        stock: selectedVariant.stock
      }
    })

    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} - ${selectedColor} - ${selectedSize}`,
    })
  }

  const getColorStock = (color: string): number => {
    return variants.filter(v => v.color === color).reduce((total, v) => total + v.stock, 0)
  }

  const getSizeStock = (size: string): number => {
    return variants.filter(v => 
      v.size === size && 
      (!selectedColor || v.color === selectedColor)
    ).reduce((total, v) => total + v.stock, 0)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium">{product.name}</h1>
        <p className="text-xl font-medium">{product.price}€</p>
      </div>

      <TheCornerColorSelector
        colors={availableColors}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        getColorStock={getColorStock}
      />

      <TheCornerSizeSelector
        sizes={availableSizes}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        onSizeChange={setSelectedSize}
        variants={variants}
      />

      <Button 
        onClick={handleAddToCart}
        className="w-full"
        disabled={!selectedColor || !selectedSize}
      >
        Ajouter au panier
      </Button>
    </div>
  )
} 