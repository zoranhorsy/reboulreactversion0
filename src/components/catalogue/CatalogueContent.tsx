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
import { MobileFilterModal } from './MobileFilterModal'
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { SearchAutocomplete } from './SearchAutocomplete'
import { useFilterWorker } from '@/hooks/useFilterWorker'
import { rafThrottle } from '@/lib/utils'

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
  const [searchQuery, setSearchQuery] = useState("")
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  // État pour contrôler le modal des filtres sur mobile
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Clé pour stocker/récupérer les filtres dans localStorage
  const FILTERS_STORAGE_KEY = 'reboul-catalogue-filters'

  // Initialiser les filtres à partir des searchParams ou localStorage
  const initializeFilters = () => {
    // Obtenir les filtres des paramètres d'URL
    const urlFilters: FilterState = {
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

    // Vérifier si les paramètres d'URL contiennent des filtres actifs
    const hasActiveUrlFilters = Object.entries(urlFilters).some(
      ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
    )

    // Si les paramètres d'URL sont vides (pas de filtres actifs), essayer de récupérer les filtres du localStorage
    if (!hasActiveUrlFilters) {
      try {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters) as FilterState
          
          // Flag pour indiquer que les filtres ont été restaurés (utilisé pour afficher une notification)
          setTimeout(() => {
            setFiltersRestored(true)
          }, 1000)
          
          // Restaurer les filtres sauvegardés, mais garder page et limit des paramètres d'URL
          return {
            ...parsedFilters,
            page: urlFilters.page,
            limit: urlFilters.limit
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des filtres sauvegardés:", error)
      }
    }

    return urlFilters
  }

  const [filters, setFilters] = useState<FilterState>(initializeFilters())
  const [filtersRestored, setFiltersRestored] = useState(false)

  // Sauvegarder les filtres dans localStorage à chaque changement
  useEffect(() => {
    try {
      // Ne pas sauvegarder page et limit pour éviter de restaurer à une page spécifique
      const { page, limit, ...filtersToSave } = filters
      
      // Vérifier s'il y a des filtres actifs à sauvegarder
      const hasActiveFilters = Object.entries(filtersToSave).some(
        ([key, value]) => value && value !== ""
      )
      
      if (hasActiveFilters) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave))
      } else {
        // Si tous les filtres sont vides, supprimer la sauvegarde
        localStorage.removeItem(FILTERS_STORAGE_KEY)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des filtres:", error)
    }
  }, [filters, FILTERS_STORAGE_KEY])

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

  const { filterProducts, sortProducts, isLoading: isWorkerLoading, error: workerError } = useFilterWorker()
  const [localProducts, setLocalProducts] = useState<Product[]>(initialProducts)

  // Charger les produits
  const loadProducts = useCallback(async (newFilters?: FilterState) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams: Record<string, string> = {}
      if (newFilters) {
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value && value.toString().trim() !== '') {
            queryParams[key] = value
          }
        })
      } else {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.toString().trim() !== '') {
            queryParams[key] = value
          }
        })
      }

      if (!queryParams.page) queryParams.page = '1'
      if (!queryParams.limit) queryParams.limit = '12'

      const result = await api.fetchProducts(queryParams)
      console.log('Produits API:', result.products);
      
      // Appliquer le filtrage côté client avec le worker
      const filterOptions = {
        categories: newFilters?.category_id && newFilters.category_id !== "" ? [newFilters.category_id] : undefined,
        brands: newFilters?.brand_id && newFilters.brand_id !== "" ? [newFilters.brand_id] : undefined,
        priceRange: (newFilters?.minPrice && newFilters.minPrice !== "") || (newFilters?.maxPrice && newFilters.maxPrice !== "") ? {
          min: newFilters.minPrice && newFilters.minPrice !== "" ? Number(newFilters.minPrice) : 0,
          max: newFilters.maxPrice && newFilters.maxPrice !== "" ? Number(newFilters.maxPrice) : Infinity
        } : undefined,
        colors: newFilters?.color && newFilters.color !== "" ? [newFilters.color] : undefined,
        sizes: newFilters?.size && newFilters.size !== "" ? [newFilters.size] : undefined,
        searchTerm: newFilters?.search && newFilters.search !== "" ? newFilters.search : undefined,
        inStock: newFilters?.featured === 'true' ? true : undefined
      }
      console.log('Options de filtre:', filterOptions);

      const filteredProducts = await filterProducts(result.products, filterOptions)
      console.log('Produits filtrés:', filteredProducts);

      // Appliquer le tri si nécessaire
      let sortedProducts = filteredProducts
      if (newFilters?.sort) {
        const [sortBy, sortOrder] = newFilters.sort.split('_')
        sortedProducts = await sortProducts(filteredProducts, sortBy, sortOrder as 'asc' | 'desc')
      }

      setProducts(sortedProducts)
      setLocalProducts(result.products) // Garder une copie des produits non filtrés
      setTotalItems(result.total)
      setTotalPages(Math.ceil(result.total / Number(newFilters?.limit || filters.limit)))

      const { colors: newColors, sizes: newSizes } = extractVariants(result.products)
      setColors(newColors)
      setSizes(newSizes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }, [filters, extractVariants, filterProducts, sortProducts])

  // Charger les produits uniquement quand les filtres changent
  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line
  }, [filters])

  useEffect(() => {
    // Version optimisée avec rafThrottle
    const handleScroll = rafThrottle(() => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
      setShowScrollTop(scrollTop > 500)
    })

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Optimisé avec rafThrottle pour assurer une animation fluide
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const { toast } = useToast()

  useEffect(() => {
    toast({
      title: "Filtres réinitialisés",
      description: "Tous les filtres ont été réinitialisés",
      action: <ToastAction altText="Fermer">Fermer</ToastAction>
    })
  }, [limitParam, pathname, router, toast])

  const handleResetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      page: '1',
      limit: limitParam,
      category_id: '',
      brand: '',
      brand_id: '',
      search: '',
      sort: '',
      color: '',
      size: '',
      minPrice: '',
      maxPrice: '',
      store_type: '',
      featured: ''
    }

    setFilters(defaultFilters)
    setSearchQuery('')
    
    // Mettre à jour l'URL
    const queryString = new URLSearchParams()
    queryString.set('page', '1')
    queryString.set('limit', limitParam)
    router.push(`${pathname}?${queryString.toString()}`)
    
    // Supprimer les filtres sauvegardés
    localStorage.removeItem(FILTERS_STORAGE_KEY)
  }, [limitParam, pathname, router])

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
  ).length

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    // Cette fonction peut être complètement supprimée
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

  // Fonction pour gérer les changements de filtres depuis le modal mobile
  const handleMobileFilterChange = (newFilters: FilterState) => {
    // Mettre à jour les filtres
    setFilters(newFilters);
    // Fermer le modal
    setIsFilterModalOpen(false);
    // Recharger les produits avec les nouveaux filtres
    loadProducts(newFilters);
  };

  // Afficher une notification si les filtres ont été restaurés
  useEffect(() => {
    if (filtersRestored) {
      // Réinitialiser le drapeau pour éviter de montrer la notification à nouveau
      setFiltersRestored(false)
      
      // Compter le nombre de filtres actifs
      const activeFiltersCount = Object.entries(filters).filter(
        ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
      ).length
      
      toast({
        title: "Filtres restaurés",
        description: `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} de votre session précédente ${activeFiltersCount > 1 ? 'ont été restaurés' : 'a été restauré'}.`,
        action: (
          <ToastAction altText="Réinitialiser" onClick={handleResetFilters}>
            Réinitialiser
          </ToastAction>
        ),
        duration: 5000
      })
    }
  }, [filtersRestored, filters, handleResetFilters, toast])

  // Handler pagination adapté
  const handlePageChange = useCallback((newPage: number) => {
    handleFilterChange({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [handleFilterChange]);

  // Log debug juste avant le render
  console.log('Produits à afficher dans le render:', products);

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
      
      {/* Header principal - Mobile first */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1 md:max-w-xs lg:max-w-md">
                <SearchAutocomplete
                  value={searchQuery}
                  onSearch={(value) => {
                    setSearchQuery(value)
                    handleFilterChange({ search: value })
                  }}
                  categories={categories}
                  brands={brands}
                  onCategorySelect={(categoryId) => {
                    handleFilterChange({ category_id: categoryId })
                  }}
                  onBrandSelect={(brandId) => {
                    handleFilterChange({ brand_id: brandId })
                  }}
                  placeholder="Rechercher un produit..."
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                {/* Bouton des filtres - Visible uniquement sur xs et sm */}
                <div ref={filterButtonRef} className="block md:hidden">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 sm:h-10 aspect-square rounded-full border-border/30 bg-background/80 backdrop-blur-md relative"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Tri (Select) */}
                <Select
                  value={filters.sort || "default"}
                  onValueChange={(value) => handleFilterChange({ sort: value })}
                >
                  <SelectTrigger className="w-full sm:w-[180px] md:w-[140px] lg:w-[180px] h-8 sm:h-10 text-xs sm:text-sm bg-background/80 backdrop-blur-md">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-xs sm:text-sm">Par défaut</SelectItem>
                    <SelectItem value="price_asc" className="text-xs sm:text-sm">Prix croissant</SelectItem>
                    <SelectItem value="price_desc" className="text-xs sm:text-sm">Prix décroissant</SelectItem>
                    <SelectItem value="newest" className="text-xs sm:text-sm">Nouveautés</SelectItem>
                    <SelectItem value="popular" className="text-xs sm:text-sm">Populaires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtres actifs avec scroll horizontal sur mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1 sm:pb-2 sm:mx-0 sm:px-0">
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

      {/* Contenu principal avec layout desktop amélioré */}
      <div className="flex">
        {/* Sidebar desktop à gauche - Visible uniquement sur md et plus */}
        <aside className="hidden md:block w-80 lg:w-96 border-r bg-background/95 shadow-sm sticky top-[130px] self-start h-[calc(100vh-130px)] overflow-auto">
          <FilterComponent
            filters={filters}
            categories={categories}
            brands={brands}
            colors={colors}
            sizes={sizes}
            storeTypes={["reboul"]}
            availableColors={availableColors}
            availableSizes={availableSizes}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Contenu principal - décalé pour laisser la place à la sidebar */}
        <main className="w-full md:w-[calc(100%-320px)] lg:w-[calc(100%-384px)] px-2 sm:px-4 py-4 sm:py-6">
          {/* Afficher le nombre de résultats et indicateurs supplémentaires */}
          <div className="flex justify-between items-center mb-4 text-xs sm:text-sm max-w-[1200px] mx-auto">
            <div>
              <p className="text-muted-foreground">
                {loading ? (
                  <span>Chargement des produits...</span>
                ) : (
                  <span>{totalItems} produits trouvés{filters.search ? ` pour "${filters.search}"` : ""}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filters.featured && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Produits vedettes
                </Badge>
              )}
              {filters.store_type && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  {filters.store_type === "adult" 
                    ? "Adultes" 
                    : filters.store_type === "kids" 
                      ? "Enfants" 
                      : filters.store_type === "sneakers" 
                        ? "Sneakers" 
                        : filters.store_type}
                </Badge>
              )}
            </div>
          </div>

          {/* États conditionnels d'affichage */}
          {loading && products.length === 0 ? (
            // Afficher un message de chargement lorsqu'il n'y a pas encore de produits
            <div className="flex justify-center items-center py-20 bg-card/20 rounded-xl border border-border/40 max-w-[1200px] mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">Chargement des produits...</p>
              </div>
            </div>
          ) : error ? (
            // Afficher un message d'erreur
            <div className="flex justify-center items-center py-20 bg-destructive/5 rounded-xl border border-destructive/30 max-w-[1200px] mx-auto">
              <div className="px-6 py-4 max-w-lg mx-auto text-center">
                <p className="font-medium text-destructive mb-3">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => loadProducts()}
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : products.length === 0 ? (
            // Aucun produit trouvé
            <div className="flex justify-center items-center py-20 bg-card/20 rounded-xl border border-border/40 max-w-[1200px] mx-auto">
              <div className="max-w-lg mx-auto text-center">
                <p className="text-muted-foreground mb-4">Aucun produit trouvé avec les filtres actuels.</p>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  size="sm"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          ) : (
            // Afficher la grille de produits
            <div className="max-w-[1200px] mx-auto">
              <ProductGrid 
                products={products}
                isLoading={loading}
                error={error}
                page={Number(filters.page) || 1}
                limit={Number(filters.limit) || 12}
                totalProducts={totalItems}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                _onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modal de filtres mobile optimisé */}
      <MobileFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        categories={categories}
        brands={brands}
        colors={colors}
        sizes={sizes}
        storeTypes={["adult"]}
        onApplyFilters={handleMobileFilterChange}
      />

      {/* Bouton de retour en haut de page */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-md z-40"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}

