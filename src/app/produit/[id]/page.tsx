'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product } from '@/lib/api'
import { ProductDetails } from '@/components/ProductDetails'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ProductGallery } from '@/components/ProductGallery'
import { ColorSelector } from '@/components/ColorSelector'

export default function ProductPage() {
    const { id } = useParams() as { id: string }
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true)
            setError(null)
            try {
                console.log(`Client: Fetching product with ID ${id}...`)
                const fetchedProduct = await getProductById(id)
                if (fetchedProduct) {
                    console.log('Client: Product fetched successfully:', fetchedProduct)
                    setProduct(fetchedProduct)
                    if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                        setSelectedColor(fetchedProduct.variants[0].color)
                    }
                } else {
                    console.log('Client: Product not found, redirecting to 404 page')
                    notFound()
                }
            } catch (error) {
                console.error('Client: Error fetching product:', error)
                setError('Failed to load product. Please try again later.')
                toast({
                    title: "Error",
                    description: "Failed to load product. Please try again later.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchProduct()
        }
    }, [id, toast])

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!product) {
        return notFound()
    }

    return (
        <ProductDetails product={product}>
            <ProductGallery
                images={product.images}
                productName={product.name}
                onImageChange={setActiveImageIndex}
                activeIndex={activeImageIndex}
            />
            {product.variants && (
                <ColorSelector
                    availableColors={[...new Set(product.variants.map(v => v.color))]}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                />
            )}
        </ProductDetails>
    )
}

