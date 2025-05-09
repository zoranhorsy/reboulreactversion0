"use client"

import React, { useState, useEffect, useMemo, memo } from "react"
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { FeaturedProductCard } from "./products/FeaturedProductCard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeftRight } from "lucide-react"
import { fetchProducts, Product } from "@/lib/api"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import useEmblaCarousel from 'embla-carousel-react'

interface SimilarProductsProps {
    currentProductId: string
    brandId?: string
    categoryId?: string
}

const SimilarProductsComponent = ({ currentProductId, brandId, categoryId }: SimilarProductsProps) => {
    const [similarProducts, setSimilarProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [emblaRef] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
        slidesToScroll: 2
    })

    const productsPerRow = 4 // Nombre de produits par ligne

    useEffect(() => {
        let isMounted = true;
        let isDataFetched = false;
        
        const fetchSimilarProducts = async () => {
            if (similarProducts.length > 0 || isDataFetched) {
                return;
            }
            
            isDataFetched = true;
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetchProducts({
                    ...(brandId && { brand_id: brandId }),
                    ...(categoryId && { category_id: categoryId }),
                    limit: "24"
                })
                if (isMounted) {
                    if (!response || !response.products || response.products.length === 0) {
                        throw new Error("No products found")
                    }
                    const filteredProducts = response.products
                        .filter((product) => product.id !== currentProductId)
                        .slice(0, 24)
                    setSimilarProducts(filteredProducts)
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching similar products:", error)
                    setError("Failed to load similar products")
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchSimilarProducts()
        
        return () => {
            isMounted = false;
        }
    }, [brandId, categoryId, currentProductId, similarProducts.length])

    // Diviser les produits en deux rangées
    const rows = useMemo(() => {
        const row1 = similarProducts.slice(0, Math.ceil(similarProducts.length / 2));
        const row2 = similarProducts.slice(Math.ceil(similarProducts.length / 2));
        return [row1, row2];
    }, [similarProducts]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

    return (
        <div className="space-y-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-sm">Faites glisser pour voir plus</span>
            </div>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="relative group">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                            skipSnaps: false,
                            dragFree: true
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {row.map((product, index) => (
                                <CarouselItem 
                                    key={product.id} 
                                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                                    >
                                        <FeaturedProductCard product={product} />
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex -left-12 h-12 w-12" />
                        <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex -right-12 h-12 w-12" />
                    </Carousel>
                </div>
            ))}
        </div>
    )
}

export const SimilarProducts = memo(SimilarProductsComponent)

