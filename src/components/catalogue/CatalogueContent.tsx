"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SlidersHorizontal, ChevronUp, Search, Grid, List, ArrowUpDown } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ReboulPageHeader } from "@/components/reboul/components/ReboulPageHeader"

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  // Initialiser les filtres à partir des searchParams
  const defaultFilters: FilterState = {
    page: searchParams.get('page') || '1',
    limit: limitParam,
    category_id: searchParams.get('category_id') || '',
    brand: searchParams.get('brand') || '',
    brand_id: searchParams.get('brand_id') || '',
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
    console.log("handleFilterChange reçoit:", newFilters);
    
    setFilters(prev => {
      const updated = { ...prev, ...newFilters }
      if ('page' in newFilters === false && Object.keys(newFilters).length > 0) {
        updated.page = '1' // Réinitialiser la page lors d'un changement de filtre
      }
      
      const queryString = new URLSearchParams()
      Object.entries(updated).forEach(([key, value]) => {
        if (value) {
          if (key === 'brand_id' && value) {
            // Ne rien faire, brand_id sera ajouté séparément
          } else {
            queryString.set(key, value.toString())
          }
        }
      })
      
      if (updated.brand_id) {
        queryString.set('brand_id', updated.brand_id.toString())
      }
      
      const url = `${pathname}?${queryString.toString()}`
      router.push(url)
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

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handlePageChange = useCallback(
    (newPage: number) => {
      handleFilterChange({ page: newPage.toString() })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [handleFilterChange]
  )

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

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode)
  }, [])

  // Extraire les couleurs et tailles uniques à partir des produits
  useEffect(() => {
    const uniqueColors = new Set<string>()
    const uniqueSizes = new Set<string>()

    products.forEach((product) => {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant.color) uniqueColors.add(variant.color.toLowerCase())
          if (variant.size) uniqueSizes.add(variant.size)
        })
      }
    })

    setAvailableColors(Array.from(uniqueColors).sort())
    setAvailableSizes(Array.from(uniqueSizes).sort())
  }, [products])

  return (
    <div className="min-h-screen bg-background w-full">
      <ReboulPageHeader 
        title="REBOUL STORE"
        subtitle="Collection exclusive de vêtements premium"
        backLink="/"
        backText="Retour à l'accueil"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Catalogue", href: "/catalogue" }
        ]}
        actions={[]}
      />
      
      {/* Header principal */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container mx-auto px-2 sm:px-4 py-4">
          <div className="flex flex-col space-y-4">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleFilterChange({ search: e.target.value })
                  }}
                  className="pl-9 w-full"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select
                  value={filters.sort || "default"}
                  onValueChange={(value) => handleFilterChange({ sort: value })}
                >
                  <SelectTrigger className="h-9 sm:h-8 w-full sm:w-[140px] border-border/30 bg-background/80 backdrop-blur-md">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Pertinence</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                  </SelectContent>
                </Select>
                
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 sm:h-8 aspect-square rounded-full border-border/30 bg-background/80 backdrop-blur-md"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                    <div className="p-6">
                      <FilterComponent
                        filters={filters}
                        categories={categories}
                        brands={brands}
                        colors={colors}
                        sizes={sizes}
                        storeTypes={["reboul"]}
                        onFilterChange={(newFilters) => {
                          handleFilterChange(newFilters)
                          setIsFilterOpen(false)
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Filtres actifs */}
            <div className="overflow-x-auto pb-2">
              <ActiveFilters
                filters={filters}
                categories={categories}
                brands={brands}
                onRemoveFilter={(key) => {
                  handleFilterChange({ [key]: "" })
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-2 sm:px-4 py-6">
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
          viewMode="grid"
        />
      </div>

      {/* Bouton retour en haut */}
      {showScrollTop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-md shadow-lg"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

