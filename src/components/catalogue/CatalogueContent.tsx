'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader, Grid, List, SlidersHorizontal } from 'lucide-react'
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
import { fetchProducts, fetchCategories, fetchBrands, fetchTags, Product } from '@/lib/api'
import { FilterSummary } from './FilterSummary'
import { useToast } from "@/components/ui/use-toast"

export function CatalogueContent() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [sortBy, setSortBy] = useState<'price' | 'name'>('name')
    const [filterBrand, setFilterBrand] = useState<string>('all')
    const [filterCategories, setFilterCategories] = useState<string[]>([])
    const [filterTags, setFilterTags] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterColor, setFilterColor] = useState<string>('all')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [brands, setBrands] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const { toast } = useToast()
    const productsPerPage = 12

    const fetchProductData = useCallback(async () => {
        setIsLoading(true)
        try {
            const params: Record<string, string> = {
                page: currentPage.toString(),
                limit: productsPerPage.toString(),
                sortBy,
                ...(filterBrand !== 'all' && { brand: filterBrand }),
                ...(filterCategories.length > 0 && { categories: filterCategories.join(',') }),
                ...(filterTags.length > 0 && { tags: filterTags.join(',') }),
                ...(searchTerm && { search: searchTerm }),
                minPrice: priceRange[0].toString(),
                maxPrice: priceRange[1].toString(),
                ...(filterColor !== 'all' && { color: filterColor }),
            }

            const { products: fetchedProducts, total } = await fetchProducts(params)
            setProducts(fetchedProducts)
            setTotalProducts(total)

            const [categoriesData, brandsData, tagsData] = await Promise.all([
                fetchCategories(),
                fetchBrands(),
                fetchTags()
            ])
            setCategories(categoriesData)
            setBrands(brandsData)
            setTags(tagsData)
        } catch (error) {
            console.error('Error fetching data:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les produits. Veuillez réessayer plus tard.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, sortBy, filterBrand, filterCategories, filterTags, searchTerm, priceRange, filterColor, toast])

    useEffect(() => {
        fetchProductData()
    }, [fetchProductData])

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

    const allColors = Array.from(new Set(products.flatMap(product =>
        product.variants ? product.variants.map(variant => variant.color) : []
    )))

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
                            allTags={tags}
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
                                    allTags={tags}
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
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'price' | 'name')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Nom</SelectItem>
                                <SelectItem value="price">Prix</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <FilterSummary
                        totalProducts={totalProducts}
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
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
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
                    )}
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }).map((_, index) => (
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalProducts / productsPerPage)))}
                                    disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </motion.div>
            </div>
            <ScrollToTopButton />
        </ScrollTriggerAnimation>
    )
}

