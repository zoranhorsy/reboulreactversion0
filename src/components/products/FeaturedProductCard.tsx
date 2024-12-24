'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/lib/api'
import { useCart, CartItem } from '@/app/contexts/CartContext'

interface FeaturedProductCardProps {
    product: Product
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
    const { addItem, items } = useCart()
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        console.log('FeaturedProductCard mounted for product:', product)
        console.log('Current cart items:', items)
    }, [product, items])

    const handleAddToCart = () => {
        console.log('handleAddToCart called for product:', product)
        setIsAdding(true)
        try {
            console.log('Creating CartItem from product:', product)
            const cartItem: CartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : '/placeholder.svg'
            }
            console.log('CartItem created:', cartItem)
            console.log('Calling addItem function')
            addItem(cartItem)
            console.log('addItem function called successfully')
        } catch (error) {
            console.error('Error in handleAddToCart:', error)
        } finally {
            setIsAdding(false)
            console.log('handleAddToCart completed, isAdding set to false')
        }
    }

    console.log('Rendering FeaturedProductCard for product:', product)

    if (!product || typeof product !== 'object') {
        console.error('Invalid product prop:', product)
        return null
    }

    return (
        <Card className="w-full h-full max-w-4xl mx-auto overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
                <div className="relative w-full md:w-1/2 pt-[75%] md:pt-0">
                    <Image
                        src={Array.isArray(product.images) && product.images.length > 0
                            ? product.images[0]
                            : '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                    {product.category && (
                        <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 text-xs font-medium"
                        >
                            {String(product.category)}
                        </Badge>
                    )}
                </div>
                <CardContent className="flex flex-col justify-between p-6 md:w-1/2">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold line-clamp-2">{product.name}</h3>
                        {product.description && (
                            <p className="text-muted-foreground line-clamp-3">{product.description}</p>
                        )}
                        <p className="text-3xl font-bold">{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'} €</p>
                        {Array.isArray(product.tags) && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {String(tag)}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button asChild className="flex-1">
                            <Link href={`/produit/${product.id}`} className="flex items-center justify-center w-full h-full">
                                Voir détails
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 flex items-center justify-center"
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}

