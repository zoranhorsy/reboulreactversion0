'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Product = {
    id: number
    name: string
    price: number
    image: string
    category: string
}

type ProductRecommendationsProps = {
    currentProductId?: number
    currentCategory?: string
}

export function RecommendedProducts({ currentProductId, currentCategory }: ProductRecommendationsProps) {
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                const response = await fetch('/api/products')
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const allProducts: Product[] = await response.json()
                const filtered = allProducts
                    .filter(product =>
                        product.id !== currentProductId &&
                        (!currentCategory || product.category === currentCategory)
                    )
                    .slice(0, 4)
                setRecommendedProducts(filtered)
            } catch (error) {
                console.error('Error fetching recommended products:', error)
            }
        }

        fetchRecommendedProducts()
    }, [currentProductId, currentCategory])

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Produits recommandés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                    <Card key={product.id}>
                        <CardContent className="p-4">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={200}
                                height={200}
                                className="w-full h-48 object-cover mb-4 rounded"
                            />
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-lg font-bold">{product.price} €</p>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/produit/${product.id}`} passHref>
                                <Button className="w-full">Voir le produit</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

