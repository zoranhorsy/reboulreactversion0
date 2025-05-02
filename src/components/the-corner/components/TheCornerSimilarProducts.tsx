import { Product } from "@/lib/types/product"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorInfo } from "@/config/productColors"

interface TheCornerSimilarProductsProps {
  products: Product[]
  currentProductId: string
}

export function TheCornerSimilarProducts({
  products,
  currentProductId
}: TheCornerSimilarProductsProps) {
  // Filtrer le produit actuel
  const similarProducts = products?.filter(p => p.id !== currentProductId)?.slice(0, 8) || []

  if (similarProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 border-t">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Produits similaires</h2>
          <Link 
            href="/the-corner" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {similarProducts.map((product) => (
            <Link
              key={product.id}
              href={`/the-corner/${product.id}`}
              className="group relative"
            >
              {/* Badge stock */}
              {product.variants && product.variants.length > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    product.variants.some(v => v.stock > 0)
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                  )}>
                    {product.variants.some(v => v.stock > 0) ? "En stock" : "Stock limité"}
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-4">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">Aucune image</span>
                  </div>
                )}
                <button 
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Ajouter aux favoris
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Informations */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {formatPrice(product.price)}
                  </p>
                  {/* Couleurs disponibles */}
                  {product.variants && (
                    <div className="flex -space-x-1">
                      {Array.from(new Set(product.variants.map(v => v.color)))
                        .slice(0, 3)
                        .map((color, index) => {
                          const colorInfo = getColorInfo(color)
                          return (
                            <div
                              key={color}
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: colorInfo.hex }}
                              title={colorInfo.label}
                            />
                          )
                        })}
                      {product.variants.length > 3 && (
                        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-medium border border-white">
                          +{product.variants.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Tailles disponibles */}
                {product.variants && (
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(product.variants.map(v => v.size)))
                      .slice(0, 4)
                      .map((size) => (
                        <span 
                          key={size}
                          className="text-xs px-1.5 py-0.5 bg-gray-100 rounded"
                        >
                          {size}
                        </span>
                      ))}
                    {product.variants.length > 4 && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                        +{product.variants.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 