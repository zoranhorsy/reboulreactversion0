'use client'

import React, { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product as APIProduct } from '@/lib/api'
import { ProductDetails, checkProductStock } from '@/components/ProductDetails'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart, CartItem } from '@/app/contexts/CartContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'

interface Product extends Omit<APIProduct, 'description' | 'images'>, CartItem {
  description: string;
  images: string[];
}

export default function ProductPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [selectedColor, setSelectedColor] = useState<string>('')
    const [quantity, setQuantity] = useState(1)
    const [isWishlist, setIsWishlist] = useState(false)
    const { toast } = useToast()
    const { addItem } = useCart()

    // Calculer si le produit est en stock
    const isInStock = product ? checkProductStock(product, selectedSize, selectedColor) : false

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                if (!id) {
                    notFound()
                    return
                }
                const fetchedProduct = await getProductById(id)
                if (fetchedProduct) {
                    setProduct({
                        ...fetchedProduct,
                        quantity: 1,
                        images: fetchedProduct.images?.map(image =>
                            typeof image === 'string' ? image : URL.createObjectURL(image)
                        ) || []
                    })
                    // Définir les valeurs par défaut pour la taille et la couleur
                    if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                        setSelectedSize(fetchedProduct.variants[0].size)
                        setSelectedColor(fetchedProduct.variants[0].color)
                    }
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

        void fetchProductData()
    }, [id, toast])

    const handleAddToCart = () => {
        if (product) {
            if (!selectedSize || !selectedColor) {
                toast({
                    title: "Attention",
                    description: "Veuillez sélectionner une taille et une couleur",
                    variant: "destructive",
                })
                return
            }

            if (!isInStock) {
                toast({
                    title: "Attention",
                    description: "Ce produit n'est plus en stock",
                    variant: "destructive",
                })
                return
            }

            const cartItem: CartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images[0] || '/placeholder.png',
                variant: {
                    size: selectedSize,
                    color: selectedColor,
                },
            }
            addItem(cartItem)
            toast({
                title: "Ajouté au panier",
                description: `${quantity}x ${product.name} (${selectedSize}, ${selectedColor}) a été ajouté à votre panier.`,
            })
        }
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: product?.name,
                text: product?.description,
                url: window.location.href,
            })
        } catch (error) {
            console.error('Error sharing:', error)
        }
    }

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist)
        toast({
            title: isWishlist ? "Retiré des favoris" : "Ajouté aux favoris",
            description: `${product?.name} a été ${isWishlist ? 'retiré de' : 'ajouté à'} votre liste de favoris.`,
        })
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

    const breadcrumbItems = [
        { label: 'Accueil', href: '/' },
        { label: product.store_type === 'adult' ? 'Adulte' : 
                 product.store_type === 'kids' ? 'Minots' : 'Sneakers', 
          href: `/${product.store_type === 'adult' ? 'adulte' : 
                 product.store_type === 'kids' ? 'minots' : 'sneakers'}` },
        { label: product.name, href: '#' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href={breadcrumbItems[breadcrumbItems.length - 2].href} 
                          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Link>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Galerie d'images et informations produit */}
                    <div className="lg:col-span-2">
                        <ProductDetails
                            product={product}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            quantity={quantity}
                            onSizeChange={setSelectedSize}
                            onColorChange={setSelectedColor}
                            onQuantityChange={setQuantity}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={toggleWishlist}
                            onShare={handleShare}
                            isWishlist={isWishlist}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

