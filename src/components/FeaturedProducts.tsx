'use client'

import { useState, useEffect } from 'react'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Product, fetchFeaturedProducts } from '@/lib/api'
import { AlertCircle } from 'lucide-react'

export function FeaturedProducts() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const { products } = await fetchFeaturedProducts()
                console.log('Loaded featured products:', JSON.stringify(products, null, 2))
                setFeaturedProducts(products)
            } catch (err) {
                console.error('Error in loadFeaturedProducts:', err)
                setError('Impossible de charger les produits en vedette. Veuillez réessayer plus tard.')
            } finally {
                setIsLoading(false)
            }
        }

        loadFeaturedProducts()
    }, [])

    if (isLoading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="h-10 w-64 mb-8 mx-auto bg-gray-200 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="h-64 w-full bg-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Erreur!</strong>
                        <span className="block sm:inline"> {error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </span>
                    </div>
                </div>
            </section>
        )
    }

    console.log('Rendering FeaturedProducts with:', featuredProducts)

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Produits en vedette</h2>
                {featuredProducts.length > 0 ? (
                    <ProductGrid products={featuredProducts} />
                ) : (
                    <p className="text-center text-gray-500">Aucun produit en vedette pour le moment.</p>
                )}
            </div>
        </section>
    )
}

