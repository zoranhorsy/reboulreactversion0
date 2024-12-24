'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product } from '@/lib/api'
import { ProductDetails } from '@/components/ProductDetails'
import { LoadingSpinner } from '@/components/LoadingSpinner'
///import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart } from '@/app/contexts/CartContext'

export default function ProductPage() {
    const { id } = useParams() as { id: string }
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const { addItem } = useCart()

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const fetchedProduct = await getProductById(id)
                if (fetchedProduct) {
                    setProduct(fetchedProduct)
                } else {
                    notFound()
                }
            } catch (error) {
                console.error('Error fetching product:', error)
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

    const handleAddToCart = (selectedColor: string, selectedSize: string) => {
        if (product) {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.images[0] || '/placeholder.svg',
                color: selectedColor,
                size: selectedSize,
            })
            toast({
                title: "Added to cart",
                description: `${product.name} (${selectedColor}, ${selectedSize}) has been added to your cart.`,
            })
        }
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <ErrorDisplay message={error} />
    }

    if (!product) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ProductDetails
                product={product}
                onAddToCart={handleAddToCart}
            />
        </div>
    )
}

