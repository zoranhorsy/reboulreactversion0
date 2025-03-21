"use client"
import { memo, useState } from "react"
import { ProductCard } from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react"
import type { Product } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  viewMode: initialViewMode = "grid",
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode)
  const productsCount = Array.isArray(products) ? products.length : 0
  
  // On mobile, calcul du nombre d'articles à afficher par ligne
  const productsPerRow = viewMode === "grid" ? 2 : 1

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div
          className={cn(
            "grid gap-3 sm:gap-4 md:gap-6",
            viewMode === "grid" 
              ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}
          aria-live="polite"
          aria-busy="true"
        >
          <p className="sr-only">Chargement des produits...</p>
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className={cn(
                "w-full rounded-xl", 
                viewMode === "grid" ? "aspect-[3/4]" : "aspect-[2/1] sm:aspect-[3/1]"
              )} />
              <div className="space-y-1">
                <Skeleton className="h-3 w-[80%]" />
                <Skeleton className="h-3 w-[60%]" />
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
    <div className="space-y-6">
      {/* Controls header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 border rounded">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 px-2.5"
              onClick={() => handleViewModeChange("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Affichage en grille</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 px-2.5"
              onClick={() => handleViewModeChange("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Affichage en liste</span>
            </Button>
          </div>
          <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
            {totalProducts} article{totalProducts > 1 ? "s" : ""}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Select
            value={limit.toString()}
            onValueChange={(value) => _onFilterChange({ limit: value, page: "1" })}
          >
            <SelectTrigger className="w-[110px] h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Articles par page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 par page</SelectItem>
              <SelectItem value="24">24 par page</SelectItem>
              <SelectItem value="36">36 par page</SelectItem>
              <SelectItem value="48">48 par page</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={"default"}
            onValueChange={(value) => _onFilterChange({ sort: value })}
          >
            <SelectTrigger className="w-[110px] h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Pertinence</SelectItem>
              <SelectItem value="price_asc">Prix ↑</SelectItem>
              <SelectItem value="price_desc">Prix ↓</SelectItem>
              <SelectItem value="newest">Nouveautés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille de produits */}
      <div
        className={cn(
          "grid gap-3 sm:gap-4 md:gap-6",
          viewMode === "grid" 
            ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1 gap-y-4"
        )}
        aria-live="polite"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-3 pt-6 sm:flex-row sm:justify-between sm:space-y-0 border-t">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
            <span>
              Affichage <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span>
              {" "}-{" "}
              <span className="font-medium text-foreground">
                {Math.min(page * limit, totalProducts)}
              </span>
              {" "}sur{" "}
              <span className="font-medium text-foreground">{totalProducts}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Page précédente</span>
            </Button>
            <div className="flex items-center justify-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                
                // Logic to show relevant page numbers around current page
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 sm:h-9 sm:w-9",
                      "mx-0.5",
                      page === pageNum && "pointer-events-none"
                    )}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                    <span className="sr-only">Page {pageNum}</span>
                  </Button>
                )
              })}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <span className="mx-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 sm:h-9 sm:w-9 mx-0.5"
                    onClick={() => onPageChange(totalPages)}
                  >
                    {totalPages}
                    <span className="sr-only">Dernière page</span>
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Page suivante</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

export { ProductGrid }

