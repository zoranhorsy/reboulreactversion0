'use client'

import React, { useState, useEffect } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/products/ProductCard'

export function FeaturedProducts() {
    const [isClient, setIsClient] = useState(false)
    const { products, isLoading, error } = useProducts(1, 4)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <div>Loading featured products...</div>
    }

    if (isLoading) return <div>Chargement des produits...</div>
    if (error) return <div>Erreur lors du chargement des produits</div>

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Produits en vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

