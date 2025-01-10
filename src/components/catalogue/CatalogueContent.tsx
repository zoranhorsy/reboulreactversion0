'use client'

import { useState, useEffect } from 'react'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"
import { Filters } from '@/components/catalogue/Filters'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { ProductList } from '@/components/catalogue/ProductList'
import { ScrollTriggerAnimation } from '@/components/animations/ScrollTriggerAnimation'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FilterSummary } from './FilterSummary'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Product, Category, Brand } from '@/lib/api' // Updated import statement
import { useRouter, useSearchParams } from 'next/navigation'

interface CatalogueContentProps {
  initialProducts: Product[]
  total: number
  categories: Category[]
  brands: Brand[]
  currentPage: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export function CatalogueContent({
  initialProducts,
  total,
  categories,
  brands,
  currentPage: initialPage,
  searchParams: _searchParams
}: CatalogueContentProps) {
    const router = useRouter()
    const searchParamsHook = useSearchParams()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [sortBy, setSortBy] = useState<string>(searchParamsHook.get('sort') || 'name')
    const [filterBrand, setFilterBrand] = useState<string>(searchParamsHook.get('brand') || 'all')
    const [filterCategories, setFilterCategories] = useState<string[]>(
      searchParamsHook.get('categories')?.split(',') || []
    )
    const [filterTags, setFilterTags] = useState<string[]>(
      searchParamsHook.get('tags')?.split(',') || []
    )
    const [searchTerm, setSearchTerm] = useState(searchParamsHook.get('search') || '')
    const [priceRange, setPriceRange] = useState([
      Number(searchParamsHook.get('minPrice')) || 0,
      Number(searchParamsHook.get('maxPrice')) || 1000
    ])
    const [filterColor, setFilterColor] = useState<string>(searchParamsHook.get('color') || 'all')

    const [products] = useState<Product[]>(initialProducts)

    const productsPerPage = 12

    useEffect(() => {
      const params = new URLSearchParams(searchParamsHook)
      params.set('page', currentPage.toString())
      params.set('sort', sortBy)
      if (filterBrand !== 'all') params.set('brand', filterBrand)
      if (filterCategories.length > 0) params.set('categories', filterCategories.join(','))
      if (filterTags.length > 0) params.set('tags', filterTags.join(','))
      if (searchTerm) params.set('search', searchTerm)
      params.set('minPrice', priceRange[0].toString())
      params.set('maxPrice', priceRange[1].toString())
      if (filterColor !== 'all') params.set('color', filterColor)

      router.push(`/catalogue?${params.toString()}`, { scroll: false })
    }, [currentPage, sortBy, filterBrand, filterCategories, filterTags, searchTerm, priceRange, filterColor, router, searchParamsHook])

    const resetFilters = () => {
        setSortBy('name')
        setFilterBrand('all')
        setFilterCategories([])
        setFilterTags([])
        setSearchTerm('')
        setPriceRange([0, 1000])
        setFilterColor('all')
        setCurrentPage(1)
    }

    const allColors = Array.from(new Set(products?.flatMap(product =>
        product.variants ? product.variants.map(variant => variant.color) : []
    ) || []))

    const allTags = Array.from(new Set(products?.flatMap(product => product.tags || []) || []))

    return (
        <ScrollTriggerAnimation>
            <motion.h1
                className="text-3xl font-bold mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Catalogue Reboul
            </motion.h1>
            <div className="flex flex-col lg:flex-row gap-8">
                <motion.div
                    className="lg:w-1/4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="hidden lg:block sticky top-4">
                        <Filters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filterBrand={filterBrand}
                            setFilterBrand={setFilterBrand}
                            filterCategories={filterCategories}
                            setFilterCategories={setFilterCategories}
                            filterTags={filterTags}
                            setFilterTags={setFilterTags}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            filterColor={filterColor}
                            setFilterColor={setFilterColor}
                            categories={categories}
                            allTags={allTags}
                            allColors={allColors}
                            allBrands={brands}
                            isOpen={isFilterOpen}
                            setIsOpen={setIsFilterOpen}
                        />
                    </div>
                    <div className="lg:hidden">
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full mb-4">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Filtres
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <Filters
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    filterBrand={filterBrand}
                                    setFilterBrand={setFilterBrand}
                                    filterCategories={filterCategories}
                                    setFilterCategories={setFilterCategories}
                                    filterTags={filterTags}
                                    setFilterTags={setFilterTags}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    filterColor={filterColor}
                                    setFilterColor={setFilterColor}
                                    categories={categories}
                                    allTags={allTags}
                                    allColors={allColors}
                                    allBrands={brands}
                                    isOpen={isFilterOpen}
                                    setIsOpen={setIsFilterOpen}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </motion.div>
                <motion.div
                    className="lg:w-3/4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Nom</SelectItem>
                                <SelectItem value="price-asc">Prix croissant</SelectItem>
                                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <FilterSummary
                        totalProducts={total}
                        activeFiltersCount={
                            (filterBrand !== 'all' ? 1 : 0) +
                            filterCategories.length +
                            filterTags.length +
                            (filterColor !== 'all' ? 1 : 0) +
                            (searchTerm ? 1 : 0) +
                            ((priceRange[0] !== 0 || priceRange[1] !== 1000) ? 1 : 0)
                        }
                        resetFilters={resetFilters}
                    />
                    {products.length > 0 ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {viewMode === 'grid' ? (
                                    <ProductGrid products={products} />
                                ) : (
                                    <ProductList products={products} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <Alert>
                            <AlertTitle>Aucun produit trouvé</AlertTitle>
                            <AlertDescription>
                                Aucun produit ne correspond à vos critères de recherche. Essayez d&apos;ajuster vos filtres.
                            </AlertDescription>
                        </Alert>
                    )}
                    {products.length > 0 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(total / productsPerPage) }).map((_, index) => (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(index + 1)}
                                            isActive={currentPage === index + 1}
                                        >
                                            {index + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(total / productsPerPage)))}
                                        disabled={currentPage === Math.ceil(total / productsPerPage)}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </motion.div>
            </div>
            <ScrollToTopButton />
        </ScrollTriggerAnimation>
    )
}

