'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/products/ProductCard'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FeaturedProducts() {
    const params = useMemo(() => ({ featured: 'true', limit: '4' }), [])
    const { products, isLoading, error } = useProducts(params)

    const logRender = useCallback(() => {
        console.log('FeaturedProducts render:', { products, isLoading, error })
    }, [products, isLoading, error])

    useEffect(() => {
        logRender()
    }, [logRender])

    useEffect(() => {
        if (products && products.length > 0) {
            console.log('Sample product data:', products[0])
        }
    }, [products])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-light mb-8 text-center">Produits en vedette</h2>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-light mb-8 text-center">Produits en vedette</h2>
                <div className="text-center py-10 text-red-500">
                    <p className="text-lg font-medium">Une erreur est survenue lors du chargement des produits en vedette.</p>
                    <p>{error.message}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    if (!products || products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-light mb-8 text-center">Produits en vedette</h2>
                <div className="text-center py-10">
                    <p className="text-lg font-medium">Aucun produit en vedette pour le moment.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-light mb-8 text-center">Produits en vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

