import React from "react"
import { useProducts } from "@/hooks/useProducts"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type Product } from "@/lib/api"
import { Pagination } from "@/components/ui/pagination"

export function ProductList() {
  const { products, isLoading, error, page, totalPages, goToPage, nextPage, prevPage } = useProducts()

    if (isLoading) {
      return (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="sr-only">Loading products...</p>
          {[...Array(8)].map((_, index) => (
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
        {totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>
    )
  }

