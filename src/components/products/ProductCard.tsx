import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingCart } from "lucide-react"
import { ProductVariantModal } from "@/components/ProductVariantModal"
import { useCart } from "@/app/contexts/CartContext"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  console.log("ProductCard rendu pour le produit:", product.id, product.name)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return null
  }

  const imageUrl = (() => {
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0] !== "") {
      return product.images[0]
    }
    if (typeof product.image_url === 'string' && product.image_url !== "") {
      return product.image_url
    }
    return "/placeholder.svg"
  })()

  const handleAddToCart = (size: string, color: string) => {
    try {
      // Find the corresponding variant
      const variant = product.variants.find((v) => v.size === size && v.color === color)
      if (!variant) {
        throw new Error("Variant not found")
      }

      // Add to cart
      addItem({
        id: `${product.id}-${size}-${color}`,
        name: `${product.name} (${size}, ${color})`,
        price: product.price,
        quantity: 1,
        image: typeof imageUrl === 'string' ? imageUrl : "/placeholder.svg",
      })

      toast({
        title: "Product added to cart",
        description: `${product.name} (Size: ${size}, ${color}) has been added to your cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Unable to add the product to the cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-lg ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        <div className={`relative ${viewMode === "list" ? "h-40 w-40" : "h-64"}`}>
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.name || "Product image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Link href={`/produit/${product.id}`} className="text-white mx-2">
              <Eye className="w-6 h-6" />
            </Link>
            <button className="text-white mx-2" onClick={() => setIsModalOpen(true)}>
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
        <CardContent className={`p-4 ${viewMode === "list" ? "flex-grow" : ""}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{product.name || "Unnamed Product"}</h3>
            <Badge variant="secondary" className="text-xs">
              {product.category || "Uncategorized"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description || "No description available"}</p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold">
              {typeof product.price === "number"
                ? `${product.price.toFixed(2)} €`
                : product.price
                  ? `${product.price} €`
                  : "Prix non disponible"}
            </p>
            {product.stock > 0 ? (
              <Badge variant="outline" className="text-xs">
                En stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Rupture de stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      <ProductVariantModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}

