'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchBrands } from '@/lib/api'
import { useTheme } from 'next-themes'
import type { Brand } from '@/lib/api'
import { toast } from '@/components/ui/use-toast'

const VISIBLE_BRANDS = 6
const AUTO_SCROLL_INTERVAL = 8000
const TRANSITION_DURATION = 800

export function BrandsCarousel() {
    const [brands, setBrands] = useState<Brand[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [direction, setDirection] = useState<'left' | 'right'>('right')
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands()
                if (data && data.length > 0) {
                    setBrands(data)
                } else {
                    toast({
                        title: "Aucune marque trouvée",
                        description: "Impossible de charger les marques pour le moment.",
                        variant: "destructive"
                    })
                }
            } catch (err) {
                console.error('Erreur lors du chargement des marques:', err)
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors du chargement des marques.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        loadBrands()
    }, [])

    const getBrandLogo = useCallback((brand: Brand) => {
        const defaultLogo = '/placeholder.png'
        if (!brand) return defaultLogo
        
        console.log('Brand:', brand.name)
        console.log('Logo Light:', brand.logo_light)
        console.log('Logo Dark:', brand.logo_dark)
        console.log('Theme:', resolvedTheme)
        
        let selectedLogo = resolvedTheme === 'dark' 
            ? brand.logo_light 
            : brand.logo_dark;
            
        console.log('Selected Logo:', selectedLogo)
        
        if (!selectedLogo) {
            console.log('Using default logo for brand:', brand.name)
            return defaultLogo
        }
        
        // Ensure the path starts with /brands/
        if (!selectedLogo.startsWith('/brands/')) {
            selectedLogo = `/brands${selectedLogo}`
        }
        
        // Add API URL prefix
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reboul-store-api-production.up.railway.app'
        selectedLogo = `${apiUrl}${selectedLogo}`
        
        console.log('Final Logo Path:', selectedLogo)
        return selectedLogo
    }, [resolvedTheme])

    const handlePrevious = useCallback(() => {
        if (isTransitioning) return
        setDirection('left')
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
            const newIndex = prev - VISIBLE_BRANDS
            return newIndex < 0 ? Math.max(0, brands.length - VISIBLE_BRANDS) : newIndex
        })
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION)
    }, [brands.length, isTransitioning])

    const handleNext = useCallback(() => {
        if (isTransitioning) return
        setDirection('right')
        setIsTransitioning(true)
        setCurrentIndex((prev) => {
            const newIndex = prev + VISIBLE_BRANDS
            return newIndex >= brands.length ? 0 : newIndex
        })
        setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION)
    }, [brands.length, isTransitioning])

    useEffect(() => {
        if (isPaused) return
        const interval = setInterval(handleNext, AUTO_SCROLL_INTERVAL)
        return () => clearInterval(interval)
    }, [handleNext, isPaused])

    if (isLoading) {
        return (
            <section className="w-full min-h-[800px] flex flex-col py-24">
                <div className="flex items-center justify-between gap-4 mb-24">
                    <div className="flex items-center gap-12">
                        <h2 className="text-3xl font-light uppercase tracking-[0.4em]">Nos marques</h2>
                        <div className="h-px w-48 bg-border/5" />
                        <p className="text-base text-muted-foreground tracking-wider">Découvrez notre sélection</p>
                    </div>
                    <Link 
                        href="/catalogue"
                        className="text-base text-muted-foreground hover:text-primary transition-colors flex items-center gap-3"
                    >
                        Voir tout
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                    {[...Array(VISIBLE_BRANDS)].map((_, index) => (
                        <Card key={index} className="aspect-square animate-pulse bg-primary/5" />
                    ))}
                </div>
            </section>
        )
    }

    if (!brands.length) return null

    const visibleBrands = [...brands, ...brands].slice(currentIndex, currentIndex + VISIBLE_BRANDS)

    return (
        <section className="w-full min-h-[800px] flex flex-col py-24 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 md:px-8 flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-24">
                    <div className="flex items-center gap-12">
                        <h2 className="text-3xl font-light uppercase tracking-[0.4em] text-foreground dark:text-white">Nos marques</h2>
                        <div className="h-px w-48 bg-foreground/10 dark:bg-white/10" />
                        <p className="text-base text-foreground/70 dark:text-white/70 tracking-wider">Découvrez notre sélection</p>
                    </div>
                    <div className="flex items-center gap-12">
                        <div className="flex gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevious}
                                className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 
                                    hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-300
                                    hover:scale-110 active:scale-95"
                                disabled={isTransitioning}
                            >
                                <ChevronLeft className="h-6 w-6 text-foreground dark:text-white" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 
                                    hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-300
                                    hover:scale-110 active:scale-95"
                                disabled={isTransitioning}
                            >
                                <ChevronRight className="h-6 w-6 text-foreground dark:text-white" />
                            </Button>
                        </div>
                        <Link 
                            href="/catalogue"
                            className="text-base text-foreground/70 dark:text-white/70 hover:text-primary dark:hover:text-primary 
                                transition-colors flex items-center gap-3 hover:gap-4 transition-all duration-300"
                        >
                            Voir tout
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 flex-1 transition-all duration-${TRANSITION_DURATION}
                    ${isTransitioning ? (direction === 'right' ? 'translate-x-[-2%] opacity-80' : 'translate-x-[2%] opacity-80') : 'translate-x-0 opacity-100'}`}>
                    {visibleBrands.map((brand, index) => (
                        <Link 
                            key={`${brand.id}-${index}`}
                            href={`/catalogue?brand=${brand.id}`}
                            className="block group"
                            style={{
                                transitionDelay: `${index * 50}ms`
                            }}
                        >
                            <Card className="relative aspect-square overflow-hidden transition-all duration-700 
                                bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800
                                hover:border-primary/20 hover:shadow-2xl hover:scale-[1.02] hover:-rotate-1">
                                <div className="absolute inset-0 p-12 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={getBrandLogo(brand)}
                                            alt={brand.name}
                                            fill
                                            className="object-contain transition-all duration-700 
                                                group-hover:scale-110 group-hover:rotate-2"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            priority
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                console.error('Image error for brand:', brand.name, 'URL:', img.src);
                                                img.src = '/no-image.png';
                                                img.onerror = null; // Empêche la boucle infinie
                                            }}
                                        />
                                    </div>
                                </div>
                                    
                                {/* Overlay avec effet de glassmorphism */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                
                                {/* Conteneur du texte */}
                                <div className="absolute inset-x-0 bottom-0 p-12 flex flex-col items-center justify-end
                                    translate-y-[60%] group-hover:translate-y-0 transition-all duration-700 ease-out">
                                    <div className="text-center">
                                        <h3 className="text-white text-xl font-medium uppercase tracking-[0.4em] mb-4
                                            transform -translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                            transition-all duration-700 delay-100">
                                            {brand.name}
                                        </h3>
                                        {brand.description && (
                                            <p className="text-white/90 text-base line-clamp-2 px-6
                                                transform -translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                                transition-all duration-700 delay-200">
                                                {brand.description}
                                            </p>
                                        )}
                                        <span className="inline-block mt-6 text-sm text-white/90 uppercase tracking-[0.4em]
                                            transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                                            transition-all duration-700 delay-300 border-b border-white/20 pb-1
                                            hover:border-white/40">
                                            Découvrir la collection
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
                
                {/* Indicateurs de navigation */}
                <div className="flex justify-center gap-3 mt-24">
                    {Array.from({ length: Math.ceil(brands.length / VISIBLE_BRANDS) }).map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-700 ${
                                Math.floor(currentIndex / VISIBLE_BRANDS) === index
                                    ? "w-12 bg-foreground dark:bg-white scale-100" 
                                    : "w-3 bg-foreground/20 dark:bg-white/20 scale-90"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
} 