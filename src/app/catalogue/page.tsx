'use client'

import { useState, useEffect } from 'react'
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

type Variant = {
    size: string
    color: string
    stock: number
}

type Product = {
    id: number
    name: string
    price: number
    description: string
    category: string
    brand: string
    images: string[]
    variants: Variant[]
    tags: string[]
}

export default function Catalogue() {
    const [products, setProducts] = useState<Product[]>([])
    const [sortBy, setSortBy] = useState<'price' | 'name'>('name')
    const [filterBrand, setFilterBrand] = useState<string>('all')
    const [filterCategories, setFilterCategories] = useState<string[]>([])
    const [filterTags, setFilterTags] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [priceRange, setPriceRange] = useState([0, 600])
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterColor, setFilterColor] = useState<string>('all')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const productsPerPage = 12

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true)
                const response = await fetch('/api/products')
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const data = await response.json()
                setProducts(data)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const filteredProducts = products
        .filter(product => filterBrand === 'all' || product.brand === filterBrand)
        .filter(product => filterCategories.length === 0 || filterCategories.includes(product.category))
        .filter(product => filterTags.length === 0 || filterTags.some(tag => product.tags.includes(tag)))
        .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(product => filterColor === 'all' || product.variants.some(variant => variant.color.toLowerCase() === filterColor.toLowerCase()))

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price') {
            return a.price - b.price
        } else {
            return a.name.localeCompare(b.name)
        }
    })

    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    const allCategories = Array.from(new Set(products.map(product => product.category)))
    const allTags = Array.from(new Set(products.flatMap(product => product.tags)))
    const allColors = Array.from(new Set(products.flatMap(product => product.variants.map(variant => variant.color))))
    const allBrands = Array.from(new Set(products.map(product => product.brand)))

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
                            categories={allCategories}
                            allTags={allTags}
                            allColors={allColors}
                            allBrands={allBrands}
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
                                    categories={allCategories}
                                    allTags={allTags}
                                    allColors={allColors}
                                    allBrands={allBrands}
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
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">Filtres</Button>
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
                                    categories={allCategories}
                                    allTags={allTags}
                                    allColors={allColors}
                                    allBrands={allBrands}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader className="h-8 w-4 animate-spin" />
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
                                    <ProductGrid products={currentProducts} />
                                ) : (
                                    <ProductList products={currentProducts} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                    <Pagination className="mt-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.ceil(sortedProducts.length / productsPerPage) }).map((_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        onClick={() => paginate(index + 1)}
                                        isActive={currentPage === index + 1}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
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

