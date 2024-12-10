'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

type Product = {
    id: number
    name: string
    price: number
    image: string
}

export function FeaturedProducts() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await fetch('/api/products')
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const products: Product[] = await response.json()
                setFeaturedProducts(products.slice(0.5))
            } catch (error) {
                console.error('Error fetching featured products:', error)
            }
        }

        fetchFeaturedProducts()
    }, [])

    return (
        <section className="featured-products container mx-auto px-4 py-24">
            <h2 className="animate-on-scroll text-3xl font-bold mb-12 text-center text-black">Produits en vedette</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                    <div key={product.id} className="animate-on-scroll featured-product bg-neutral-100 p-6 rounded-lg shadow-md">
                        <Image src={product.image} alt={product.name} width={300} height={300} className="w-full h-64 object-cover mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-black">{product.name}</h3>
                        <p className="text-lg font-bold mb-4 text-black">{product.price} €</p>
                        <Link href={`/produit/${product.id}`}>
                            <Button className="w-full bg-black text-white hover:bg-gray-800 hover:text-neutral-100 transition-colors">
                                Voir le produit
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    )
}

