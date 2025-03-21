"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SlidersHorizontal, ChevronUp } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [isScrolled, setIsScrolled] = useState(false)
  const filterButtonRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [handleFilterChange]
  )

  // Détecter le scroll pour afficher/masquer le bouton retour en haut
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
      setShowScrollTop(scrollTop > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
  ).length

  return (
    <div className="min-h-screen bg-background w-full pb-20 sm:pb-0">
      {/* Barre de navigation en haut de l'écran - mobile */}
      <div 
        className={cn(
          "sticky top-0 left-0 right-0 z-50 p-2 lg:hidden",
          "bg-background/80 backdrop-blur-md",
          "border-b border-border/30"
        )}
      >
        <div className={cn(
          "flex items-center justify-between gap-3 px-3 py-1.5 max-w-[1600px] mx-auto",
        )}>
          <span className="text-xs font-medium text-muted-foreground">
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon" 
              className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-xl pt-2 sm:max-w-none">
                <div className="mb-2 flex justify-center">
                  <div className="h-1 w-12 rounded-full bg-muted-foreground/20"></div>
                </div>
                <div className="max-h-[calc(85vh-2rem)] overflow-y-auto pb-8">
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
            
            <Select
              value={filters.sort || "default"}
              onValueChange={(value) => handleFilterChange({ sort: value })}
            >
              <SelectTrigger className="h-8 border-none text-xs text-muted-foreground hover:text-foreground px-2 min-w-0 w-auto">
                <SelectValue placeholder="Tri" />
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
      </div>

      {/* Contenu principal */}
      <div className="w-full mx-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar des filtres - desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0 border-r border-border">
            <div className="sticky top-0 p-4 overflow-auto h-[calc(100vh-1rem)]">
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
          </aside>

          {/* Grille de produits */}
          <main className="flex-1 min-w-0 p-4 max-w-[1600px] mx-auto">
            {/* Filtres actifs */}
            <div className="mb-4 overflow-x-auto pb-2 scrollbar-hide">
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

