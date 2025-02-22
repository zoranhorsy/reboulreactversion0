'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Heart, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeaturedProductCardProps {
    product: {
        id: string
        name: string
        price: number
        images: (string | File | Blob)[]
        description?: string
        category?: string
        tags?: string[]
        brand?: string
        rating?: number
        reviews_count?: number
        stock?: number
        variants?: Array<{
            size: string
            color: string
            stock: number
        }>
    }
}

const getImageUrl = (image: string | File | Blob): string => {
    if (typeof image === 'string') {
        if (image.startsWith('http')) return image
        if (image.startsWith('/')) return image
        return `/uploads/${image}`
    }
    return URL.createObjectURL(image)
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price)
    }

    const calculateStock = () => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((total, variant) => total + variant.stock, 0)
        }
        return product.stock || 0
    }

    const totalStock = calculateStock()

    return (
        <Link href={`/produit/${product.id}`}>
            <Card className="group relative overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800
                hover:border-primary/50 dark:hover:border-primary/50 transition-colors duration-300">
                <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                        src={Array.isArray(product.images) && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority
                    />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-2">
                            {product.category && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-medium 
                                        bg-white dark:bg-zinc-900
                                        text-zinc-900 dark:text-white
                                        border border-zinc-200 dark:border-zinc-800"
                                >
                                    {product.category}
                                </Badge>
                            )}
                            {totalStock === 0 && (
                                <Badge
                                    variant="destructive"
                                    className="text-xs font-medium"
                                >
                                    Rupture de stock
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
                                border border-zinc-200 dark:border-zinc-800
                                text-zinc-900 dark:text-white
                                opacity-0 group-hover:opacity-100 transition-opacity
                                hover:scale-110 hover:bg-white dark:hover:bg-zinc-900"
                            onClick={(e) => {
                                e.preventDefault() // Empêche la navigation vers la page produit
                                // Ajouter ici la logique pour les favoris
                            }}
                        >
                            <Heart className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <div className="space-y-4">
                                {product.brand && (
                                    <span className="block font-geist text-xs tracking-wider text-white/80 uppercase">
                                        {product.brand}
                                    </span>
                                )}
                                <h3 className="font-geist text-xl text-white font-medium 
                                    transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                                    transition-all duration-300">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="font-geist text-sm text-white/80 line-clamp-2
                                        transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                                        transition-all duration-300 delay-100">
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4
                                    transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                                    transition-all duration-300 delay-200">
                                    <div className="space-y-1">
                                        <span className="font-geist text-lg text-white font-medium">
                                            {formatPrice(product.price)}
                                        </span>
                                        {product.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm text-white/80">
                                                    {product.rating.toFixed(1)}
                                                    {product.reviews_count && (
                                                        <span className="text-white/60 text-xs ml-1">
                                                            ({product.reviews_count})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2
                                        transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                                        transition-all duration-300 delay-300">
                                        {product.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-[10px] text-white/60 border-white/20"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

