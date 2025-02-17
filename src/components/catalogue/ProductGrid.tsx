"use client"
import { useEffect, memo } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/api"

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  page: number
  limit: number
  totalProducts: number
  totalPages: number
  onPageChange: (newPage: number) => void
  _onFilterChange: (newFilters: Partial<Record<string, string>>) => void
  viewMode?: "grid" | "list"
}

const ProductGrid = memo(function ProductGrid({
  products = [],
  isLoading,
  error,
  page,
  limit,
  totalProducts,
  totalPages,
  onPageChange,
  _onFilterChange,
  viewMode = "grid",
}: ProductGridProps) {
  useEffect(() => {
    console.log("ProductGrid received new props:", { products, isLoading, error, page, limit, totalProducts, viewMode })
  }, [products, isLoading, error, page, limit, totalProducts, viewMode])

  const productsCount = Array.isArray(products) ? products.length : 0
  console.log("ProductGrid rendering with", productsCount, "products")

  if (isLoading) {
    return (
      <div
        className={`grid ${
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        } gap-4`}
        aria-live="polite"
        aria-busy="true"
      >
        <p className="sr-only">Loading products...</p>
        {[...Array(limit)].map((_, index) => (
          <Skeleton key={index} className={viewMode === "grid" ? "h-[300px]" : "h-[150px]"} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded" role="alert" aria-live="assertive">
        {error}
      </div>
    )
  }

  if (!Array.isArray(products) || productsCount === 0) {
    return (
      <div className="text-center py-8">
        <p>Aucun produit trouvé</p>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`grid ${
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        } gap-4`}
        aria-live="polite"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>
      <nav className="mt-8 flex flex-col sm:flex-row justify-between items-center" aria-label="Pagination">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label={`Page précédente${page > 1 ? ` (Page ${page - 1})` : ""}`}
          className="mb-4 sm:mb-0"
        >
          Page précédente
        </Button>
        <p className="text-sm text-gray-700 mb-4 sm:mb-0">
          Page <span className="font-medium">{page}</span> sur <span className="font-medium">{totalPages}</span>
        </p>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={`Page suivante${page < totalPages ? ` (Page ${page + 1})` : ""}`}
        >
          Page suivante
        </Button>
      </nav>
    </div>
  )
})

export { ProductGrid }

