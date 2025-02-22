'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FeaturedProductCard } from './products/FeaturedProductCard'
import { Button } from './ui/button'
import { ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api, type Product } from '@/lib/api'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

export function FeaturedProducts() {
    const [emblaRef] = useEmblaCarousel(
        { 
            loop: true,
            align: 'start',
            skipSnaps: false,
            dragFree: false,
        }, 
        [
            Autoplay({
                delay: 4000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
                playOnInit: true
            })
        ]
    )

    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setIsLoading(true)
                const response = await api.fetchProducts({ featured: "true", limit: "8" })
                setProducts(response.products)
            } catch (err) {
                console.error('Erreur lors de la récupération des produits mis en avant:', err)
                setError(err instanceof Error ? err.message : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        fetchFeaturedProducts()
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-muted-foreground">
                {error}
            </div>
        )
    }

    return (
        <section className="w-full relative">
            <div className="container mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-geist text-4xl md:text-5xl font-light tracking-wide text-zinc-900 dark:text-white mb-4">
                        PRODUITS PHARES
                    </h2>
                    <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Découvrez notre sélection de produits exclusifs
                    </p>
                </motion.div>

                <div className="relative px-12">
                    <Carousel
                        ref={emblaRef}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {products.map((product, index) => (
                                <CarouselItem 
                                    key={product.id} 
                                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <FeaturedProductCard product={product} />
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious 
                            className="hidden md:flex -left-6 
                                bg-white dark:bg-zinc-900/80 
                                border border-zinc-200 dark:border-zinc-800
                                text-zinc-900 dark:text-white
                                hover:bg-zinc-100 hover:text-zinc-900
                                dark:hover:bg-zinc-800 dark:hover:text-white" 
                        />
                        <CarouselNext 
                            className="hidden md:flex -right-6 
                                bg-white dark:bg-zinc-900/80 
                                border border-zinc-200 dark:border-zinc-800
                                text-zinc-900 dark:text-white
                                hover:bg-zinc-100 hover:text-zinc-900
                                dark:hover:bg-zinc-800 dark:hover:text-white" 
                        />
                    </Carousel>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-center mt-16"
                >
                    <Button 
                        asChild
                        variant="outline" 
                        size="lg"
                        className="font-geist text-xs tracking-[0.2em] uppercase font-light
                            bg-transparent
                            text-white
                            border-white/20
                            hover:bg-white/5 hover:text-white
                            transition-all duration-300"
                    >
                        <Link href="/catalogue" className="flex items-center gap-2">
                            Voir tout le catalogue
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}

