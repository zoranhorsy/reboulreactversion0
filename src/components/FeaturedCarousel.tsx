'use client'

import { useProducts } from '@/hooks/useProducts'
import { FeaturedProductCard } from '@/components/products/FeaturedProductCard'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface FeaturedCarouselProps {
    storeType: 'adult' | 'kids' | 'sneakers'
}

export function FeaturedCarousel({ storeType }: FeaturedCarouselProps) {
    const { products, isLoading, error } = useProducts({ featured: 'true', limit: '8', storeType })
    const [currentIndex, setCurrentIndex] = useState(0)
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
    const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const nextProduct = () => {
        if (products) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
        }
    }

    const prevProduct = () => {
        if (products) {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length)
        }
    }

    useEffect(() => {
        if (autoScrollEnabled && products && products.length > 0) {
            autoScrollIntervalRef.current = setInterval(() => {
                nextProduct()
            }, 5000) // Change product every 5 seconds
        }

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current)
            }
        }
    }, [autoScrollEnabled, products])

    useEffect(() => {
        console.log('FeaturedCarousel products:', products)
        console.log('FeaturedCarousel currentIndex:', currentIndex)
    }, [products, currentIndex])

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Chargement des produits en vedette...</div>
    }

    if (error) {
        console.error('FeaturedCarousel error:', error)
        return <div className="flex items-center justify-center h-full text-red-500">Une erreur est survenue lors du chargement des produits en vedette.</div>
    }

    if (!products || products.length === 0) {
        console.warn('FeaturedCarousel: No products available')
        return <div className="flex items-center justify-center h-full">Aucun produit en vedette pour le moment.</div>
    }

    const currentProduct = products[currentIndex]
    if (!currentProduct) {
        console.error('FeaturedCarousel: Current product is undefined', { currentIndex, productsLength: products.length })
        return <div className="flex items-center justify-center h-full text-red-500">Erreur: Produit non trouvé</div>
    }

    return (
        <div
            className="relative h-full"
            onMouseEnter={() => setAutoScrollEnabled(false)}
            onMouseLeave={() => setAutoScrollEnabled(true)}
        >
            <div className="absolute top-0 bottom-0 left-0 flex items-center z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={prevProduct}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            </div>
            <div className="absolute top-0 bottom-0 right-0 flex items-center z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-800"
                    onClick={nextProduct}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
            <div className="overflow-hidden h-full">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex items-center justify-center"
                    >
                        <FeaturedProductCard product={currentProduct} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

