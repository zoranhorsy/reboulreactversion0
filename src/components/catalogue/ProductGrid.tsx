"use client"
import { useEffect, memo } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
      <div className="space-y-8">
        <div
          className={`grid ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          } gap-6`}
          aria-live="polite"
          aria-busy="true"
        >
          <p className="sr-only">Chargement des produits...</p>
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-6 text-center" role="alert" aria-live="assertive">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    )
  }

  if (!Array.isArray(products) || productsCount === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">Aucun produit trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Grille de produits */}
      <div
        className={`grid ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        } gap-6`}
        aria-live="polite"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0 border-t pt-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span>{" "}
            à{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * limit, totalProducts)}
            </span>{" "}
            sur <span className="font-medium text-foreground">{totalProducts}</span> produits
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-8 w-8 p-0"
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1
              const isCurrentPage = pageNumber === page
              const isNearCurrentPage = Math.abs(pageNumber - page) <= 1
              const isFirstPage = pageNumber === 1
              const isLastPage = pageNumber === totalPages

              if (isNearCurrentPage || isFirstPage || isLastPage) {
                return (
                  <Button
                    key={pageNumber}
                    variant={isCurrentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                    className={`h-8 w-8 p-0 ${isCurrentPage ? "" : "hover:bg-muted"}`}
                    disabled={isCurrentPage}
                  >
                    {pageNumber}
                  </Button>
                )
              }

              if (pageNumber === 2 || pageNumber === totalPages - 1) {
                return <span key={pageNumber} className="px-2">...</span>
              }

              return null
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 p-0"
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

export { ProductGrid }

