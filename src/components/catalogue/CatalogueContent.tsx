"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FilterComponent } from "@/components/catalogue/Filters"
import { ProductGrid } from "@/components/catalogue/ProductGrid"
import { api } from "@/lib/api"
import type { Product } from "@/lib/types/product"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"
import { type FilterState, type FilterChangeHandler } from '@/lib/types/filters'
import { ActiveFilters } from "@/components/catalogue/ActiveFilters"

interface CatalogueContentProps {
  initialProducts: Product[] 
  total: number
  initialCategories: Category[]
  initialBrands: Brand[]
}

export function CatalogueContent({
  initialProducts,
  total,
  initialCategories,
  initialBrands,
}: CatalogueContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories] = useState<Category[]>(initialCategories)
  const [brands] = useState<Brand[]>(initialBrands)
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [totalItems, setTotalItems] = useState(total)
  const limitParam = searchParams.get('limit') || '12'
  const [totalPages, setTotalPages] = useState(Math.ceil(total / Number(limitParam)))

  // Initialiser les filtres à partir des searchParams
  const defaultFilters: FilterState = {
    page: searchParams.get('page') || '1',
    limit: limitParam,
    category_id: searchParams.get('category_id') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    store_type: searchParams.get('store_type') || '',
    featured: searchParams.get('featured') || ''
  }

  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  // Fonction unique pour mettre à jour les filtres et l'URL
  const handleFilterChange: FilterChangeHandler = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      if ('page' in newFilters === false && Object.keys(newFilters).length > 0) {
        updated.page = '1' // Réinitialiser la page lors d'un changement de filtre
      }
      
      const queryString = new URLSearchParams()
      Object.entries(updated).forEach(([key, value]) => {
        if (value) queryString.set(key, value)
      })
      
      router.push(`${pathname}?${queryString.toString()}`)
      return updated
    })
  }, [router, pathname])

  // Fonction pour extraire les variantes uniques
  const extractVariants = useCallback((productList: Product[]) => {
    const uniqueColors = new Set<string>()
    const uniqueSizes = new Set<string>()
    
    productList.forEach((product) => {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant.color) uniqueColors.add(variant.color.toLowerCase())
          if (variant.size) uniqueSizes.add(variant.size)
        })
      }
    })

    return {
      colors: Array.from(uniqueColors).sort(),
      sizes: Array.from(uniqueSizes).sort()
    }
  }, [])

  // Charger les produits
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams: Record<string, string> = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams[key] = value
        }
      })

      // S'assurer que page et limit sont toujours présents
      if (!queryParams.page) queryParams.page = '1'
      if (!queryParams.limit) queryParams.limit = '12'

      const result = await api.fetchProducts(queryParams)
      setProducts(result.products)
      setTotalItems(result.total)
      setTotalPages(Math.ceil(result.total / Number(filters.limit)))

      const { colors: newColors, sizes: newSizes } = extractVariants(result.products)
      setColors(newColors)
      setSizes(newSizes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }, [filters, extractVariants])

  // Effet pour charger les produits lors des changements de filtres
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Gérer le changement de page
  const handlePageChange = useCallback(
    (newPage: number) => {
      handleFilterChange({ page: newPage.toString() })
    },
    [handleFilterChange]
  )

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Contenu principal */}
      <div className="w-full">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar des filtres */}
          <aside className="lg:w-[280px] shrink-0 border-r border-border">
            <div className="hidden lg:block sticky top-0 p-4">
              <FilterComponent
                filters={filters}
                categories={categories}
                brands={brands}
                colors={colors}
                sizes={sizes}
                storeTypes={["adult", "kids", "sneakers"]}
                onFilterChange={handleFilterChange}
              />
            </div>
            <div className="lg:hidden p-4">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[380px]">
                  <div>
                    <FilterComponent
                      filters={filters}
                      categories={categories}
                      brands={brands}
                      colors={colors}
                      sizes={sizes}
                      storeTypes={["adult", "kids", "sneakers"]}
                      onFilterChange={(newFilters) => {
                        handleFilterChange(newFilters)
                        setIsFilterOpen(false)
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </aside>

          {/* Grille de produits */}
          <main className="flex-1 min-w-0 p-4">
            <div className="mb-4">
              <ActiveFilters
                filters={filters}
                categories={categories}
                brands={brands}
                onRemoveFilter={(key) => {
                  handleFilterChange({ [key]: "" })
                }}
              />
            </div>
            <ProductGrid
              products={products}
              isLoading={loading}
              error={error}
              page={Number.parseInt(filters.page)}
              limit={Number.parseInt(filters.limit)}
              totalProducts={totalItems}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              _onFilterChange={handleFilterChange}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

