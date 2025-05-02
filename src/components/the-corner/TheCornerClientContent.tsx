"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product } from "@/lib/types/product"
import { Category } from "@/lib/types/category"
import { TheCornerProductGrid } from "@/components/the-corner/TheCornerProductGrid"
import { TheCornerPagination } from "@/components/the-corner/TheCornerPagination"
import { TheCornerFilterSidebar } from "@/components/the-corner/TheCornerFilterSidebar"
import { api } from "@/lib/api"
import { FilterIcon, XIcon, SearchIcon, ChevronUpIcon } from "lucide-react"
import { TheCornerProductSort } from "@/components/the-corner/TheCornerProductSort"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import debounce from "lodash/debounce"
import { TheCornerPageHeader } from "./components/TheCornerPageHeader"
import { TheCornerActiveTags } from "./TheCornerActiveTags"

interface TheCornerClientContentProps {
  initialProducts: Product[]
  initialCategories: Category[]
  total: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export function TheCornerClientContent({
  initialProducts,
  initialCategories,
  total,
  searchParams,
}: TheCornerClientContentProps) {
  const router = useRouter()
  const searchParamsObj = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories] = useState<Category[]>(initialCategories)
  const [totalItems, setTotalItems] = useState(total)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParamsObj.get("search") || "")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  
  const currentPage = Number(searchParamsObj.get("page") || "1")
  const limit = Number(searchParamsObj.get("limit") || "12")
  
  useEffect(() => {
    setProducts(initialProducts)
    setTotalItems(total)
  }, [initialProducts, total])

  useEffect(() => {
    setSearchQuery(searchParamsObj.get("search") || "")
  }, [searchParamsObj])
  
  const createQueryString = useCallback((params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParamsObj.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, String(value))
      }
    })
    
    return newSearchParams.toString()
  }, [searchParamsObj])

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    const handler = debounce((q: string) => {
      const newParams = createQueryString({ 
        search: q || null,
        page: 1 
      })
      router.push(`/the-corner?${newParams}`)
    }, 500)
    
    handler(query)
    
    return () => {
      handler.cancel()
    }
  }, [router, createQueryString])

  const availableColors = useMemo(() => 
    Array.from(
      new Set(
        products
          .flatMap((product) => product.variants || [])
          .map((variant) => variant.color)
      )
    ).sort(),
    [products]
  )

  const availableSizes = useMemo(() => 
    Array.from(
      new Set(
        products
          .flatMap((product) => product.variants || [])
          .map((variant) => variant.size)
      )
    ).sort((a, b) => {
      const aType = a.startsWith("EU") ? 0 : a.startsWith("IT") ? 1 : 2
      const bType = b.startsWith("EU") ? 0 : b.startsWith("IT") ? 1 : 2
      if (aType !== bType) return aType - bType

      if (aType === 0 || aType === 1) {
        const aNum = parseFloat(a.split(" ")[1])
        const bNum = parseFloat(b.split(" ")[1])
        return aNum - bNum
      }

      const sizeOrder = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 }
      return (sizeOrder[a as keyof typeof sizeOrder] || 0) - (sizeOrder[b as keyof typeof sizeOrder] || 0)
    }),
    [products]
  )

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const newParams = createQueryString({ 
      search: searchQuery || null,
      page: 1 
    })
    router.push(`/the-corner?${newParams}`)
  }, [createQueryString, router, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }, [debouncedSearch])
  
  const handlePageChange = useCallback(async (page: number) => {
    if (page === currentPage) return
    
    const newParams = createQueryString({ page })
    router.push(`/the-corner?${newParams}`)
  }, [createQueryString, currentPage, router])
  
  const handleSortChange = useCallback((sort: string, order: string) => {
    const newParams = createQueryString({ sort, order, page: 1 })
    router.push(`/the-corner?${newParams}`)
  }, [createQueryString, router])
  
  const handleFilterChange = useCallback((filters: Record<string, string | number | null>) => {
    const allParams = { ...filters, page: 1 }
    const newParams = createQueryString(allParams)
    router.push(`/the-corner?${newParams}`)
  }, [createQueryString, router])
  
  const clearFilters = useCallback(() => {
    setSearchQuery("")
    router.push("/the-corner")
  }, [router])
  
  const hasActiveFilters = useCallback(() => {
    const filterParams = [
      "category_id",
      "minPrice",
      "maxPrice",
      "color",
      "size",
      "search"
    ]
    return filterParams.some((param) => searchParamsObj.has(param))
  }, [searchParamsObj])
  
  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Update active filters count
  useEffect(() => {
    const count = ["category_id", "minPrice", "maxPrice", "color", "size", "search"]
      .filter(param => searchParamsObj.has(param)).length
    setActiveFiltersCount(count)
  }, [searchParamsObj])

  const handleRemoveFilter = useCallback((key: string) => {
    const newParams = createQueryString({ [key]: null })
    router.push(`/the-corner?${newParams}`)
  }, [createQueryString, router])

  return (
    <div className="min-h-screen bg-background">
      <TheCornerPageHeader 
        title="THE CORNER"
        subtitle="Collection exclusive C.P. Company"
        backLink="/"
        backText="Retour à l'accueil"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "The Corner", href: "/the-corner" }
        ]}
        actions={[]}
      />

      {/* Section des produits */}
      <motion.div 
        id="products-section" 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lg:flex min-h-[calc(100vh-4rem)]">
          {/* Overlay sombre quand la sidebar est ouverte */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
              />
            )}
          </AnimatePresence>

          {/* Panneau de filtres en mobile */}
          <motion.div
            className={`fixed inset-y-0 left-0 w-[85%] max-w-[320px] z-50 bg-background border-r border-border lg:hidden`}
            initial={{ x: "-100%" }}
            animate={{ x: showFilters ? 0 : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full">
              {/* Header des filtres */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">Filtres</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-secondary/50 rounded-full text-foreground"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu des filtres */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                  <TheCornerFilterSidebar
                    categories={categories}
                    minPrice={searchParamsObj.get("minPrice") || ""}
                    maxPrice={searchParamsObj.get("maxPrice") || ""}
                    selectedCategory={searchParamsObj.get("category_id") || ""}
                    selectedColor={searchParamsObj.get("color") || ""}
                    selectedSize={searchParamsObj.get("size") || ""}
                    availableColors={availableColors}
                    availableSizes={availableSizes}
                    onFilterChange={(filters) => {
                      handleFilterChange(filters);
                      setShowFilters(false);
                    }}
                  />
                </div>
              </div>

              {/* Footer des filtres */}
              {hasActiveFilters() && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                    className="w-full px-4 py-3 text-sm bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Panneau de filtres en desktop */}
          <aside className="hidden lg:block lg:w-[280px] lg:shrink-0 lg:border-r lg:border-border/50">
            <div className="p-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
              <div className="space-y-6">
                <TheCornerFilterSidebar
                  categories={categories}
                  minPrice={searchParamsObj.get("minPrice") || ""}
                  maxPrice={searchParamsObj.get("maxPrice") || ""}
                  selectedCategory={searchParamsObj.get("category_id") || ""}
                  selectedColor={searchParamsObj.get("color") || ""}
                  selectedSize={searchParamsObj.get("size") || ""}
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                  onFilterChange={handleFilterChange}
                />
                
                {hasActiveFilters() && (
                  <motion.button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 text-sm bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Réinitialiser les filtres
                  </motion.button>
                )}
              </div>
            </div>
          </aside>

          {/* Liste des produits */}
          <main className="flex-1 min-w-0">
            {/* Header fixe */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3 space-y-3">
                {/* Barre de recherche */}
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-full bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background text-foreground placeholder:text-muted-foreground/70"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Contrôles */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors lg:hidden"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span className="text-sm">Filtres</span>
                    {activeFiltersCount > 0 && (
                      <span className="flex items-center justify-center h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <TheCornerProductSort 
                    onSortChange={handleSortChange} 
                    initialSort={searchParamsObj.get("sort") || "name"} 
                    initialOrder={searchParamsObj.get("order") || "asc"} 
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="px-4 py-4 lg:container lg:mx-auto lg:py-8">
              <div className="space-y-6">
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-muted-foreground">
                    {totalItems} produit{totalItems !== 1 ? "s" : ""} trouvé{totalItems !== 1 ? "s" : ""}
                  </p>
                </motion.div>

                {/* Tags des filtres actifs */}
                <TheCornerActiveTags
                  categories={categories}
                  activeFilters={{
                    category_id: searchParamsObj.get("category_id") || undefined,
                    minPrice: searchParamsObj.get("minPrice") || undefined,
                    maxPrice: searchParamsObj.get("maxPrice") || undefined,
                    color: searchParamsObj.get("color") || undefined,
                    size: searchParamsObj.get("size") || undefined,
                    search: searchParamsObj.get("search") || undefined,
                  }}
                  onRemoveFilter={handleRemoveFilter}
                />

                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      className="flex justify-center items-center min-h-[300px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </motion.div>
                  ) : products.length > 0 ? (
                    <motion.div 
                      key="products"
                      className="space-y-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <TheCornerProductGrid products={products} />
                      <div className="flex justify-center">
                        <TheCornerPagination
                          currentPage={currentPage}
                          totalItems={totalItems}
                          pageSize={limit}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      className="text-center py-16 bg-secondary/5 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Essayez de modifier vos filtres ou d&apos;effectuer une autre recherche.
                      </p>
                      <motion.button
                        onClick={clearFilters}
                        className="px-6 py-2.5 text-sm bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Réinitialiser les filtres
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </motion.div>

      {/* Bouton Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUpIcon className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
} 