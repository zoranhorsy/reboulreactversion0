'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById } from '@/lib/api'
import { ProductDetails } from '@/components/ProductDetails'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart } from '@/app/contexts/CartContext'
import { Breadcrumb } from '@/components/Breadcrumb'

export default function ProductPage() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const { toast } = useToast()
    const { addItem } = useCart()

    useEffect(() => {
        const fetchProductData = async () => {
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
            fetchProductData()
        }
    }, [id, toast])

    const handleAddToCart = (selectedColor, selectedSize, quantity) => {
        if (product) {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images[0] || '/placeholder.svg',
                color: selectedColor,
                size: selectedSize,
            })
            toast({
                title: "Ajouté au panier",
                description: `${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) a été ajouté à votre panier.`,
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
            <Breadcrumb
                items={[
                    { label: 'Accueil', href: '/' },
                    { label: product.category, href: `/categorie/${product.category}` },
                    { label: product.name, href: '#' },
                ]}
            />
            <ProductDetails
                product={product}
                onAddToCart={handleAddToCart}
            />
        </div>
    )
}

