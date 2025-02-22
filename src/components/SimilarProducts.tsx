"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FeaturedProductCard } from "./products/FeaturedProductCard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fetchProducts, Product } from "@/lib/api"

interface SimilarProductsProps {
    currentProductId: string
    brandId?: string
    categoryId?: string
}

export function SimilarProducts({ currentProductId, brandId, categoryId }: SimilarProductsProps) {
    const [similarProducts, setSimilarProducts] = useState<Product[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const productsPerPage = 32
    const totalPages = Math.ceil(similarProducts.length / productsPerPage)

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetchProducts({
                    ...(brandId && { brand_id: brandId }),
                    ...(categoryId && { category_id: categoryId }),
                    limit: "64"
                })
                if (!response || !response.products || response.products.length === 0) {
                    throw new Error("No products found")
                }
                const filteredProducts = response.products
                    .filter((product) => product.id !== currentProductId)
                setSimilarProducts(filteredProducts)
            } catch (error) {
                console.error("Error fetching similar products:", error)
                setError("Failed to load similar products")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSimilarProducts()
    }, [currentProductId, brandId, categoryId])

    const handlePrevious = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
    }

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                        <div className="relative aspect-[3/4] rounded-xl bg-accent/5" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-accent/5 rounded" />
                            <div className="h-4 w-32 bg-accent/5 rounded" />
                            <div className="h-4 w-20 bg-accent/5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error || similarProducts.length === 0) {
        return null
    }

    const startIndex = currentPage * productsPerPage
    const visibleProducts = similarProducts.slice(startIndex, startIndex + productsPerPage)

    return (
        <div className="relative">
            {/* Navigation Arrows */}
            {totalPages > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        className="absolute -left-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full 
                            bg-background/80 backdrop-blur-sm border border-border/5 
                            text-muted-foreground hover:text-primary hover:bg-accent/5 
                            transition-colors opacity-0 lg:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute -right-16 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full 
                            bg-background/80 backdrop-blur-sm border border-border/5 
                            text-muted-foreground hover:text-primary hover:bg-accent/5 
                            transition-colors opacity-0 lg:opacity-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
                {visibleProducts.slice(0, 8).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <FeaturedProductCard product={product} />
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
                {visibleProducts.slice(8, 16).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <FeaturedProductCard product={product} />
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
                {visibleProducts.slice(16, 24).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <FeaturedProductCard product={product} />
                    </motion.div>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {visibleProducts.slice(24, 32).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <FeaturedProductCard product={product} />
                    </motion.div>
                ))}
            </div>

            {/* Page Indicators */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i === currentPage 
                                    ? 'bg-primary scale-125' 
                                    : 'bg-border hover:bg-primary/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

