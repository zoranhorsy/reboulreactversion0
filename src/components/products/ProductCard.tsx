import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Product } from '@/lib/api'

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const [imgSrc, setImgSrc] = useState<string>('/placeholder.svg')

    useEffect(() => {
        if (product.images && product.images.length > 0) {
            setImgSrc(product.images[0])
        }
    }, [product.images])

    const handleImageError = () => {
        console.error(`Failed to load image for product: ${product.name}`, product.images)
        setImgSrc('/placeholder.svg')
    }

    console.log('Rendering ProductCard for:', product.name, 'with image:', imgSrc)

    return (
        <motion.div
            className="flex flex-col h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={imgSrc}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={handleImageError}
                />
            </div>
            <CardContent className="flex-grow p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
                    <Badge variant="secondary" className="ml-2">
                        {product.category}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                <p className="text-lg font-bold mb-2">{product.price.toFixed(2)} €</p>
                <div className="flex flex-wrap gap-1 mb-2">
                    {product.variants && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {Array.from(new Set(product.variants.map(v => v.size))).map((size) => (
                                <Badge key={size} variant="outline" className="text-xs">
                                    {size}
                                </Badge>
                            ))}
                        </div>
                    )}
                    {product.variants && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {Array.from(new Set(product.variants.map(v => v.color))).map((color) => (
                                <div
                                    key={color}
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {product.tags && product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <div className="mt-2">
                    <Badge variant={product.variants.some(v => v.stock > 10) ? "success" : product.variants.some(v => v.stock > 0) ? "warning" : "destructive"}>
                        {product.variants.some(v => v.stock > 10) ? "En stock" : product.variants.some(v => v.stock > 0) ? "Stock limité" : "Rupture de stock"}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
                <div className="flex items-center justify-between w-full">
                    <AddToCartButton
                        productId={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.images[0]}
                    />
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/produit/${product.id}`} aria-label={`Voir les détails de ${product.name}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </motion.div>
    )
}

