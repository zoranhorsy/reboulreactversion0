'use client'

import React, { useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'

export function RandomCpcompanyProducts() {
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
        const fetchRandomCpcompanyProducts = async () => {
            try {
                setIsLoading(true)
                const response = await api.fetchProducts({ store_type: "cpcompany", limit: "8" })
                
                // Shuffle the products array to get random products
                const shuffled = [...response.products].sort(() => 0.5 - Math.random())
                // Take the first 8 (or fewer if there aren't 8 available)
                const randomProducts = shuffled.slice(0, 8)
                
                setProducts(randomProducts)
            } catch (err) {
                console.error('Erreur lors de la récupération des produits CP Company aléatoires:', err)
                setError(err instanceof Error ? err.message : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        fetchRandomCpcompanyProducts()
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10 sm:py-12 md:py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-muted-foreground p-4">
                {error}
            </div>
        )
    }

    return (
        <section className="w-full py-6 sm:py-8 md:py-10 lg:py-12 overflow-hidden">
            

            <div className="w-full px-1.5 sm:px-2 md:px-4 lg:px-6 xl:px-8">
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
                            h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10
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
                            h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10
                            bg-white/90 dark:bg-zinc-950/90 
                            border border-zinc-200 dark:border-zinc-800
                            text-zinc-800 dark:text-white
                            hover:bg-primary/10 hover:border-primary hover:text-primary
                            dark:hover:bg-primary/10 dark:hover:border-primary dark:hover:text-primary
                            transition-all duration-200
                            shadow-sm z-10" 
                    />
                </Carousel>
            </div>

            <div className="flex justify-center mt-5 sm:mt-6 md:mt-8 lg:mt-10">
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
                        h-8 sm:h-9 md:h-10"
                >
                    <Link href="/catalogue?store_type=cpcompany" className="flex items-center gap-1.5">
                        Voir tous les produits CP Company
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                </Button>
            </div>
        </section>
    )
} 