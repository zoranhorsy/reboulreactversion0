'use client'

import React, { useState, useEffect, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { FeaturedProductCard } from './products/FeaturedProductCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchProducts, Product } from '@/lib/api'

interface RecentlyViewedProductsProps {
    currentProductId: string
}

// Composant interne avec mémorisation
const RecentlyViewedProductsComponent = ({ currentProductId }: RecentlyViewedProductsProps) => {
    const [recentProducts, setRecentProducts] = useState<Product[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const productsPerPage = 8
    const totalPages = Math.ceil(recentProducts.length / productsPerPage)

    // Utilisez useEffect avec un tableau de dépendances vide pour s'exécuter une seule fois
    useEffect(() => {
        // Variable pour suivre si le composant est monté
        let isMounted = true;
        let isDataFetched = false;
        
        // Récupérer les IDs des produits récemment consultés depuis le localStorage
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
        
        // Ajouter le produit actuel à la liste
        if (!recentlyViewed.includes(currentProductId)) {
            const updatedRecentlyViewed = [currentProductId, ...recentlyViewed].slice(0, 16) // Limiter à 16 produits
            localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecentlyViewed))
        }

        const fetchRecentProducts = async () => {
            // Si déjà chargé, ne pas recharger
            if (recentProducts.length > 0 || isDataFetched) {
                return;
            }
            
            isDataFetched = true;
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetchProducts()
                
                // Ne mettre à jour l'état que si le composant est toujours monté
                if (isMounted) {
                    if (!response || !response.products || response.products.length === 0) {
                        throw new Error("No products found")
                    }
                    
                    // Filtrer et trier les produits selon l'ordre dans recentlyViewed
                    const recentlyViewedProducts = response.products
                        .filter(product => recentlyViewed.includes(product.id))
                        .sort((a, b) => recentlyViewed.indexOf(a.id) - recentlyViewed.indexOf(b.id))
                        .filter(product => product.id !== currentProductId)
                        .slice(0, 16) // Limiter à 16 produits pour améliorer les performances

                    setRecentProducts(recentlyViewedProducts)
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Error fetching recent products:", error)
                    setError("Failed to load recent products")
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        // Charger les produits une seule fois
        fetchRecentProducts()
        
        // Nettoyer à la démontage
        return () => {
            isMounted = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handlePrevious = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
    }

    const handleNext = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
    }

    // Calculer les produits visibles de façon mémorisée
    const visibleProducts = useMemo(() => {
        const startIndex = currentPage * productsPerPage
        return recentProducts.slice(startIndex, startIndex + productsPerPage)
    }, [recentProducts, currentPage, productsPerPage])

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

    if (error || recentProducts.length === 0) {
        return null
    }

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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {visibleProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
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

// Exporte le composant mémorisé
export const RecentlyViewedProducts = memo(RecentlyViewedProductsComponent) 