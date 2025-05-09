'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
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

export function RandomAdultProducts() {
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
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRandomAdultProducts = async () => {
            try {
                setIsLoading(true)
                const response = await api.fetchProducts({ store_type: "adult", limit: "50" })
                
                // Shuffle the products array to get random products
                const shuffled = [...response.products].sort(() => 0.5 - Math.random())
                // Take the first 8 for carousel and 3 for featured
                const randomProducts = shuffled.slice(0, 8)
                const featured = shuffled.slice(8, 11)
                
                setProducts(randomProducts)
                setFeaturedProducts(featured)
            } catch (err) {
                console.error('Erreur lors de la récupération des produits adultes aléatoires:', err)
                setError(err instanceof Error ? err.message : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        fetchRandomAdultProducts()
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
        <div className="relative w-full overflow-hidden">
            {/* Section d'en-tête avec image de fond et cartes produits */}
            <div className="relative overflow-hidden bg-zinc-900">
                {/* Image de fond avec effet flou */}
                <div className="absolute inset-0 z-0">
                    <div className="relative w-full h-full">
                        <motion.div 
                            className="absolute inset-0 bg-[url('/images/header/reboul/1.png')] 
                            bg-cover bg-center bg-no-repeat
                            transition-opacity duration-500 ease-in-out"
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/70 to-transparent backdrop-blur-sm" />
                    </div>
                </div>

                {/* Contenu de l'en-tête */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20">
                    {/* Logo */}
                    <motion.div 
                        className="absolute top-6 right-6 sm:top-8 sm:right-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="relative h-12 w-12 sm:h-16 sm:w-16">
                            <motion.img
                                src="/images/logotype_w.png"
                                alt="Adults Only Logo"
                                className="w-full h-full object-contain"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </motion.div>

                    {/* Contenu principal */}
                    <div className="flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl mb-12"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
                                Produits Adultes
                            </h1>
                            <p className="text-lg sm:text-xl text-zinc-300">
                                Explorez notre sélection exclusive de produits réservés aux adultes
                            </p>
                        </motion.div>

                        {/* Carousel intégré dans le hero */}
                        <Carousel
                            ref={emblaRef}
                            className="w-full relative"
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
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="h-full"
                                            whileHover={{ 
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <FeaturedProductCard 
                                                product={product} 
                                                className="bg-white/10 backdrop-blur-md border border-white/20 
                                                    hover:border-white/30 shadow-2xl hover:shadow-3xl
                                                    transition-all duration-300
                                                    [&_h3]:text-white [&_span.font-geist]:text-white"
                                            />
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            
                            <div className="flex items-center justify-center gap-2 mt-8 sm:hidden">
                                <CarouselPrevious 
                                    className="static transform-none flex h-10 w-10
                                        bg-white/10 backdrop-blur-md
                                        border border-white/20
                                        text-white
                                        hover:bg-white/20
                                        transition-all duration-200
                                        hover:scale-105" 
                                />
                                <CarouselNext 
                                    className="static transform-none flex h-10 w-10
                                        bg-white/10 backdrop-blur-md
                                        border border-white/20
                                        text-white
                                        hover:bg-white/20
                                        transition-all duration-200
                                        hover:scale-105" 
                                />
                            </div>
                            
                            <CarouselPrevious 
                                className="hidden sm:flex absolute 
                                    left-0 sm:-left-4 md:-left-6 lg:-left-8 xl:-left-10
                                    h-10 w-10 sm:h-12 sm:w-12
                                    bg-white/10 backdrop-blur-md
                                    border border-white/20
                                    text-white
                                    hover:bg-white/20
                                    transition-all duration-200
                                    shadow-lg z-10
                                    hover:scale-105" 
                            />
                            <CarouselNext 
                                className="hidden sm:flex absolute
                                    right-0 sm:-right-4 md:-right-6 lg:-right-8 xl:-right-10
                                    h-10 w-10 sm:h-12 sm:w-12
                                    bg-white/10 backdrop-blur-md
                                    border border-white/20
                                    text-white
                                    hover:bg-white/20
                                    transition-all duration-200
                                    shadow-lg z-10
                                    hover:scale-105" 
                            />
                        </Carousel>
                    </div>
                </div>
            </div>
        </div>
    )
} 