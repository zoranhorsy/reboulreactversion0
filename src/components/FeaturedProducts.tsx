'use client'

import React from 'react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import styles from './FeaturedProducts.module.css'

export function FeaturedProducts() {
    const { products, isLoading } = useProducts(1, 6, { featured: true })

    // État de chargement
    if (isLoading) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                        03 EN VEDETTE
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-2xl h-[300px]" />
                                <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
                                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Si pas de produits
    if (!products?.length) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                        03 EN VEDETTE
                    </h2>
                    <div className="text-center text-gray-500">
                        Aucun produit en vedette disponible
                    </div>
                </div>
            </section>
        )
    }

    // Afficher les 3 premiers produits
    const featuredProducts = products.slice(0, 3)

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                    03 EN VEDETTE
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredProducts.map((product) => (
                        <Link 
                            key={product.id} 
                            href={`/produit/${product.id}`}
                            className="block group"
                        >
                            <div className="bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <div className="aspect-[4/3] relative bg-gray-100 rounded-t-2xl overflow-hidden">
                                    {/* Image avec fallback */}
                                    <img
                                        src={product.image_url || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.src = '/placeholder.jpg'
                                        }}
                                    />
                                </div>
                                
                                <div className="p-4">
                                    {/* Infos produit */}
                                    <div className="mb-2">
                                        <h3 className="font-medium text-sm uppercase text-gray-900">
                                            {product.brand}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {product.name}
                                        </p>
                                    </div>
                                    
                                    {/* Prix */}
                                    <p className="text-sm font-medium text-gray-900">
                                        {Number(product.price).toFixed(2)} €
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

