'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FeaturedProductCard } from './products/FeaturedProductCard'
import { Button } from './ui/button'
import { ChevronRight, Loader2, TrendingUp } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export function FeaturedProducts() {
    const [emblaRef] = useEmblaCarousel(
        { 
            loop: true,
            align: 'start',
            skipSnaps: false,
            dragFree: true,
            containScroll: "trimSnaps",
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
            <div className="flex justify-center items-center py-16 sm:py-20 md:py-24">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Chargement des produits en vedette...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p className="text-sm text-muted-foreground mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Réessayer
                </Button>
            </div>
        )
    }

    return (
        <section className="w-full py-6 sm:py-8 md:py-10 lg:py-12 overflow-hidden">
            {/* Titre de la section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                className="text-center mb-6 md:mb-8 lg:mb-10"
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 md:w-10 lg:w-12 h-[1px] bg-primary/40"></div>
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    <div className="w-8 md:w-10 lg:w-12 h-[1px] bg-primary/40"></div>
                </div>
                <h2 className="font-geist text-xl md:text-2xl lg:text-3xl text-foreground tracking-wide mb-2 font-medium">
                    Produits en vedette
                </h2>
                <p className="font-geist text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                    Découvrez notre sélection des pièces les plus tendance du moment
                </p>
            </motion.div>

            <div className="w-full px-1.5 sm:px-2 md:px-4 lg:px-6 xl:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full"
                >
                    <Carousel
                        ref={emblaRef}
                        className="w-full"
                        opts={{
                            loop: true,
                            align: 'start',
                            skipSnaps: false,
                            dragFree: true,
                            containScroll: "trimSnaps",
                        }}
                    >
                        <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-3 pl-1 sm:pl-2 md:pl-3">
                            {products.map((product, index) => (
                                <CarouselItem 
                                    key={product.id} 
                                    className="pl-1 sm:pl-2 md:pl-3
                                        basis-[49%]
                                        xs:basis-[45%] 
                                        sm:basis-[33.333%] 
                                        md:basis-[25%] 
                                        lg:basis-[20%] 
                                        xl:basis-[16.666%]"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                                    >
                                        <FeaturedProductCard product={product} />
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        
                        <div className="flex items-center justify-center gap-2 mt-4 sm:hidden">
                            <CarouselPrevious 
                                className="static transform-none flex h-8 w-8
                                    bg-white/80 dark:bg-zinc-950/80 
                                    border border-zinc-200 dark:border-zinc-800
                                    text-zinc-900 dark:text-white
                                    hover:bg-primary/10 hover:border-primary
                                    dark:hover:bg-primary/10 dark:hover:border-primary
                                    transition-all duration-200" 
                            />
                            <CarouselNext 
                                className="static transform-none flex h-8 w-8
                                    bg-white/80 dark:bg-zinc-950/80 
                                    border border-zinc-200 dark:border-zinc-800
                                    text-zinc-900 dark:text-white
                                    hover:bg-primary/10 hover:border-primary
                                    dark:hover:bg-primary/10 dark:hover:border-primary
                                    transition-all duration-200" 
                            />
                        </div>
                        
                        <CarouselPrevious 
                            className="hidden sm:flex left-0 sm:left-1 md:left-2 lg:left-4 xl:left-6
                                h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12
                                bg-white/90 dark:bg-zinc-950/90 
                                border border-zinc-200 dark:border-zinc-800
                                text-zinc-800 dark:text-white
                                hover:bg-primary/10 hover:border-primary hover:text-primary
                                dark:hover:bg-primary/10 dark:hover:border-primary dark:hover:text-primary
                                transition-all duration-200
                                shadow-sm z-10" 
                        />
                        <CarouselNext 
                            className="hidden sm:flex right-0 sm:right-1 md:right-2 lg:right-4 xl:right-6
                                h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12
                                bg-white/90 dark:bg-zinc-950/90 
                                border border-zinc-200 dark:border-zinc-800
                                text-zinc-800 dark:text-white
                                hover:bg-primary/10 hover:border-primary hover:text-primary
                                dark:hover:bg-primary/10 dark:hover:border-primary dark:hover:text-primary
                                transition-all duration-200
                                shadow-sm z-10" 
                        />
                    </Carousel>
                </motion.div>

                {/* Gradient borders */}
                <div className="absolute pointer-events-none inset-y-0 left-0 w-12 md:w-16 lg:w-20
                    bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-20"></div>
                <div className="absolute pointer-events-none inset-y-0 right-0 w-12 md:w-16 lg:w-20
                    bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-20"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center mt-6 sm:mt-7 md:mt-8 lg:mt-10"
            >
                <Button 
                    asChild
                    variant="outline" 
                    size="sm"
                    className="font-geist text-xs tracking-wide uppercase
                        bg-transparent
                        text-zinc-800 dark:text-white
                        border-zinc-300 dark:border-zinc-700
                        hover:bg-primary/5 hover:text-primary hover:border-primary
                        dark:hover:bg-primary/10 dark:hover:text-primary dark:hover:border-primary
                        transition-all duration-200
                        h-10 sm:h-11 md:h-12 px-6 sm:px-8"
                >
                    <Link href="/catalogue" className="flex items-center gap-1.5">
                        Voir tout le catalogue
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                </Button>
            </motion.div>
        </section>
    )
}

