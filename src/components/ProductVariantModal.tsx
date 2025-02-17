import React, { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/api"
import { ColorSelector } from "@/components/ColorSelector"

interface ProductVariantModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (size: string, color: string) => void
}

export function ProductVariantModal({ product, isOpen, onClose, onAddToCart }: ProductVariantModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      onAddToCart(selectedSize, selectedColor)
      onClose()
    }
  }

  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)))

  const imageUrl = (() => {
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
      return product.images[0]
    }
    return "/placeholder.svg"
  })()

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-4">
            <Image
              src={imageUrl}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
            <div>
              <p className="text-lg font-semibold">
                {typeof product.price === "number"
                  ? `${product.price.toFixed(2)} €`
                  : product.price
                    ? `${product.price} €`
                    : "Prix non disponible"}
              </p>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Taille</label>
            <Select onValueChange={setSelectedSize} value={selectedSize}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Sélectionnez une taille" />
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
          <div>
            <ColorSelector selectedColor={selectedColor} onColorChange={setSelectedColor} variants={product.variants} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} disabled={!selectedSize || !selectedColor} className="w-full">
            Ajouter au panier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

