'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchBrands, fetchProducts } from '@/lib/api'
import { type Brand } from '@/lib/api'
import { toast } from './ui/use-toast'
import { useTheme } from 'next-themes'

// Typage pour les marques avec information sur les nouveautés
interface BrandWithNewProducts extends Brand {
    hasNewProducts: boolean;
}

export function LatestCollections() {
    const [brands, setBrands] = useState<BrandWithNewProducts[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { resolvedTheme } = useTheme()
    
    // Nombre d'éléments par page selon la taille d'écran
    const itemsPerPage = {
        mobile: 4,  // 4 cartes par page sur mobile (grille 2x2)
        tablet: 6,  // 6 cartes sur tablette (grille 3x2)
        desktop: 8  // 8 cartes sur desktop (grille 4x2)
    }
    
    // Fonction pour vérifier les nouveaux produits pour chaque marque
    const checkNewProductsForBrands = async (brandsData: Brand[]) => {
        try {
            // Récupérer tous les produits marqués comme "new"
            const { products } = await fetchProducts({ new: "true" })
            
            // Créer un ensemble des IDs de marques qui ont des nouveaux produits
            const brandsWithNewProducts = new Set(
                products.map(product => product.brand_id)
            )
            
            // Ajouter l'information aux marques
            return brandsData.map(brand => ({
                ...brand,
                hasNewProducts: brandsWithNewProducts.has(brand.id)
            }))
        } catch (error) {
            console.error("Erreur lors de la vérification des nouveaux produits:", error)
            // En cas d'erreur, on considère qu'aucune marque n'a de nouveaux produits
            return brandsData.map(brand => ({
                ...brand,
                hasNewProducts: false
            }))
        }
    }
    
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands()
                if (data && data.length > 0) {
                    // Vérifier les nouveaux produits pour chaque marque
                    const brandsWithNewInfo = await checkNewProductsForBrands(data)
                    setBrands(brandsWithNewInfo)
                } else {
                    console.warn("Aucune marque n'a été trouvée")
                }
            } catch (error) {
                console.error("Erreur lors du chargement des marques:", error)
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les marques, veuillez réessayer plus tard.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        
        loadBrands()
    }, [])

    const getBrandLogo = (brand: Brand) => {
        if (!brand) return '/placeholder.png'
        
        let logoUrl = resolvedTheme === 'dark' 
            ? brand.logo_light 
            : brand.logo_dark;
            
        if (!logoUrl) return '/placeholder.png'
        
        // Construction de l'URL complète pour l'API
        const apiUrl = 'https://reboul-store-api-production.up.railway.app'
        
        // Nettoyer le chemin
        let cleanPath = logoUrl
        cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
        cleanPath = cleanPath.startsWith('api/') ? cleanPath.slice(4) : cleanPath
        
        return `${apiUrl}/${cleanPath}`
    }
    
    // Navigation entre les pages
    const goToPrevious = useCallback(() => {
        setCurrentPage(prev => {
            if (prev <= 0) return Math.ceil(brands.length / itemsPerPage.mobile) - 1;
            return prev - 1;
        });
    }, [brands.length, itemsPerPage.mobile]);

    const goToNext = useCallback(() => {
        setCurrentPage(prev => {
            if ((prev + 1) * itemsPerPage.mobile >= brands.length) return 0;
            return prev + 1;
        });
    }, [brands.length, itemsPerPage.mobile]);
    
    // Détection de swipe sur mobile
    const handleSwipe = useCallback((direction: 'left' | 'right') => {
        if (direction === 'left') {
            goToNext();
        } else {
            goToPrevious();
        }
    }, [goToNext, goToPrevious]);
    
    // Obtenir les marques visibles pour la page actuelle
    const getVisibleBrands = () => {
        const startIndex = currentPage * itemsPerPage.mobile;
        const endIndex = Math.min(startIndex + itemsPerPage.mobile, brands.length);
        return brands.slice(startIndex, endIndex);
    };
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(brands.length / itemsPerPage.mobile);
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
                {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-zinc-100 dark:bg-zinc-900 rounded-lg h-32" />
                ))}
            </div>
        )
    }
    
    if (!brands.length) {
        return (
            <div className="text-center py-10">
                <p>Aucune marque disponible pour le moment.</p>
            </div>
        )
    }
    
    const visibleBrands = getVisibleBrands();
    
    return (
        <div className="w-full relative">
            {/* Titre et navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
                <div className="flex flex-col mb-4 sm:mb-0 text-left w-full">
                    <h3 className="text-base font-geist text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
                        Nos marques
                    </h3>
                    <p className="text-[11px] font-light text-zinc-500 dark:text-zinc-400 mt-1 mb-0">
                        Découvrez notre sélection de marques exclusives
                    </p>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex gap-4 self-end sm:self-auto">
                    <button
                        onClick={goToPrevious}
                        className="text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        aria-label="Page précédente"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                        aria-label="Page suivante"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
            
            {/* Grid Layout with touch support */}
            <div 
                className="w-full"
                onTouchStart={event => {
                    const touch = event.touches[0];
                    const startX = touch.clientX;
                    
                    const handleTouchEnd = (endEvent: TouchEvent) => {
                        const endX = endEvent.changedTouches[0].clientX;
                        const diff = startX - endX;
                        
                        if (Math.abs(diff) > 50) { // Seuil minimum pour considérer un swipe
                            handleSwipe(diff > 0 ? 'left' : 'right');
                        }
                        
                        document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchend', handleTouchEnd);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`page-${currentPage}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8"
                    >
                        {visibleBrands.map((brand, index) => (
                            <div
                                key={`brand-${brand.id}-${index}`}
                                className="group"
                            >
                                <Link href={`/catalogue?brand=${brand.id}`} className="block h-full">
                                    <div className="flex flex-col items-center h-full bg-transparent">
                                        <div className="relative aspect-square w-full">
                                            <Image
                                                src={getBrandLogo(brand)}
                                                alt={brand.name}
                                                fill
                                                className="object-contain p-3 transition-opacity duration-300 group-hover:opacity-80"
                                                sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 25vw"
                                                quality={85}
                                                priority={index < 4}
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement
                                                    img.src = '/placeholder.png'
                                                }}
                                            />
                                            
                                            {brand.hasNewProducts && (
                                                <div className="absolute top-0 right-1 z-10">
                                                    <span className="text-[9px] text-red-500 dark:text-red-400 uppercase tracking-wide">
                                                        New
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                                            {brand.name}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* Bottom Control Bar */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between">
                {/* Page Indicators */}
                <div className="flex justify-center gap-2 order-2 sm:order-1 mt-4 sm:mt-0">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={`page-indicator-${index}`}
                            onClick={() => setCurrentPage(index)}
                            className={`transition-all duration-300 ${
                                index === currentPage
                                    ? 'text-zinc-900 dark:text-zinc-100' 
                                    : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400'
                            }`}
                            aria-label={`Page ${index + 1}`}
                        >
                            •
                        </button>
                    ))}
                </div>
                
                {/* Swipe Indicator & Link */}
                <div className="flex items-center gap-4 order-1 sm:order-2">
                    <div className="text-center text-xs text-zinc-400 dark:text-zinc-400 sm:hidden">
                        <span>Glissez</span>
                    </div>
                    
                    <Link 
                        href="/catalogue" 
                        className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 uppercase tracking-wide transition-colors duration-300 flex items-center gap-1"
                    >
                        Toutes nos marques
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    )
} 