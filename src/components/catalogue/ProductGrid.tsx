'use client'

import React, { useState, useMemo } from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from '@/hooks/useProducts'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProductCard } from '@/components/products/ProductCard'

type ProductGridProps = {
    storeType: 'adult' | 'kids' | 'sneakers'
    category?: string
    viewMode?: 'grid' | 'list'
}

function ProductGridContent({ storeType, category, viewMode = 'grid' }: ProductGridProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState('name')
    const pageSize = 12

    const params = useMemo(() => ({
        storeType,
        categories: category || '',
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: sortBy,
    }), [storeType, category, currentPage, sortBy])

    const { products, isLoading, error, total } = useProducts(params)
    const totalPages = Math.ceil(total / pageSize)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20" aria-live="polite">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm font-medium">Chargement des produits...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500" role="alert">
                <p className="text-sm font-medium">Une erreur est survenue lors du chargement des produits.</p>
                <p className="mt-2 text-xs">Détails : {error.message}</p>
                <Button
                    className="mt-4 text-xs"
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </Button>
            </div>
        )
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10" role="status">
                <p className="text-sm font-medium">Aucun produit trouvé pour cette catégorie.</p>
                <p className="mt-2 text-xs text-muted-foreground">Essayez de modifier vos filtres ou revenez plus tard.</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                <p className="text-xs text-muted-foreground">
                    Affichage de {products.length} produits sur {total}
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name">Nom</SelectItem>
                        <SelectItem value="price-asc">Prix croissant</SelectItem>
                        <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className={`product-grid flex flex-wrap -mx-2 ${viewMode === 'list' ? 'flex-col' : ''}`}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`product-card ${viewMode === 'list' ? 'w-full' : 'w-full sm:w-1/2 md:w-1/3 lg:w-1/4'} px-2 mb-4`}
                    >
                        <ProductCard product={product} compact={viewMode === 'list'} />
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-6">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto text-xs px-4 py-2 rounded-full transition-colors duration-300 hover:bg-primary hover:text-white"
                            aria-label="Page précédente"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Précédent
                        </Button>
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-xs" aria-current="page">
                                Page {currentPage} sur {totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-full sm:w-auto text-xs px-4 py-2 rounded-full transition-colors duration-300 hover:bg-primary hover:text-white"
                            aria-label="Page suivante"
                        >
                            Suivant
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </nav>
            )}
        </div>
    )
}

export function ProductGrid(props: ProductGridProps) {
    return (
        <ErrorBoundary>
            <ProductGridContent {...props} />
        </ErrorBoundary>
    )
}

