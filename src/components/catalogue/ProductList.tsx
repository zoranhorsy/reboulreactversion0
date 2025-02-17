import React from "react"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type Product } from "@/lib/api"

export function ProductList() {
  const { products, isLoading, error, page, limit, totalProducts, nextPage, prevPage } = useProducts()

    const totalPages = Math.ceil(totalProducts / limit)

    if (isLoading) {
      return (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="sr-only">Loading products...</p>
          {[...Array(limit)].map((_, index) => (
            <Skeleton key={index} className="h-[300px] w-full" />
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

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-live="polite">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <nav className="mt-8 flex flex-col sm:flex-row justify-between items-center" aria-label="Pagination">
          <Button
            onClick={prevPage}
            disabled={page === 1}
            aria-label={`Go to previous page${page > 1 ? ` (Page ${page - 1})` : ""}`}
            className="mb-4 sm:mb-0"
          >
            Previous Page
          </Button>
          <p className="text-sm text-gray-700 mb-4 sm:mb-0">
            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
          </p>
          <Button
            onClick={nextPage}
            disabled={page >= totalPages}
            aria-label={`Go to next page${page < totalPages ? ` (Page ${page + 1})` : ""}`}
          >
            Next Page
          </Button>
        </nav>
      </div>
    )
  }

