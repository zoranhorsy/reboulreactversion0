'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Truck, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from "@/components/ui/use-toast"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductReviews } from "@/components/ProductReviews"
import { ProductGallery } from "@/components/ProductGallery"
import { RecommendedProducts } from "@/components/RecommendedProducts"
import { SocialShare } from "@/components/SocialShare"
import { ProductQA } from "@/components/ProductQA"
import { SizeGuide } from "@/components/SizeGuide"
import { ProductFAQ } from "@/components/ProductFAQ"
import { WishlistButton } from "@/components/WishlistButton"
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'
import { notFound } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

type Product = {
    id: number
    name: string
    price: number
    images: string[]
    description: string
    variants: { size: string; color: string; stock: number }[]
    category: string
    brand: string
    reviews: { id: number; rating: number; comment: string; userName: string; date: string }[]
    questions: { id: number; question: string; answer?: string }[]
    faqs: { question: string; answer: string }[]
    sizeChart: { size: string; chest: number; waist: number; hips: number }[]
}

export default function Product({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [selectedVariant, setSelectedVariant] = useState<{ size: string; color: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addToCart, cartItems } = useCart()
    const { toast } = useToast()

    // Refs for GSAP animations
    const productRef = useRef(null)
    const imageRef = useRef(null)
    const detailsRef = useRef(null)
    const addToCartRef = useRef(null)
    const sizeGuideRef = useRef(null)
    const reviewsRef = useRef(null)
    const recommendedRef = useRef(null)
    const qaRef = useRef(null)
    const faqRef = useRef(null)

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true)
            setError(null)
            try {
                console.log(`Fetching product with ID ${params.id}...`)
                const response = await fetch(`/api/products/${params.id}`)
                if (!response.ok) {
                    if (response.status === 404) {
                        notFound()
                        return
                    }
                    const errorData = await response.json()
                    const errorMessage = errorData?.error || response.statusText
                    throw new Error(errorMessage)
                }
                const data = await response.json()
                console.log('Product fetched successfully:', data)
                setProduct(data)
            } catch (error) {
                console.error('Error fetching product:', error)
                setError('Unable to load product. Please try again later.')
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to fetch product",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [params.id, toast])

    useEffect(() => {
        if (product && productRef.current) {
            const ctx = gsap.context(() => {
                // Image and details animations
                gsap.from(imageRef.current, {
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: imageRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                })

                gsap.from(detailsRef.current, {
                    opacity: 0,
                    x: -50,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: detailsRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                })

                // Add to cart button animation
                gsap.from(addToCartRef.current, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.5,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: addToCartRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                })

                // Animate other sections
                const sections = [sizeGuideRef, reviewsRef, recommendedRef, qaRef, faqRef]
                sections.forEach((section, index) => {
                    gsap.from(section.current, {
                        opacity: 0,
                        y: 50,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: section.current,
                            start: 'top 80%',
                            end: 'bottom 20%',
                            toggleActions: 'play none none reverse'
                        }
                    })
                })
            }, productRef)

            return () => ctx.revert()
        }
    }, [product])

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast({
                title: "Attention",
                description: "Veuillez sélectionner une taille et une couleur.",
                variant: "destructive",
            })
            return
        }

        console.log('Adding to cart:', { product, selectedVariant })

        const variant = product.variants.find(v => v.size === selectedVariant.size && v.color === selectedVariant.color)

        if (!variant) {
            toast({
                title: "Attention",
                description: "Variante invalide. Veuillez réessayer.",
                variant: "destructive",
            })
            return
        }

        if (variant.stock === 0) {
            toast({
                title: "Rupture de stock",
                description: "Ce produit est actuellement en rupture de stock.",
                variant: "destructive",
            })
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: selectedVariant.size,
            color: selectedVariant.color,
            image: product.images[0],
            stock: variant.stock
        })
        toast({
            title: "Produit ajouté",
            description: `${product.name} a été ajouté à votre panier.`,
        })
    }

    const handleAddReview = (review: { rating: number; comment: string }) => {
        if (!product) return;
        const newReview = {
            id: product.reviews.length + 1,
            userName: 'Anonymous User',
            rating: review.rating,
            comment: review.comment,
            date: new Date().toISOString().split('T')[0],
        };
        setProduct(prevProduct => {
            if (!prevProduct) return null;
            return {
                ...prevProduct,
                reviews: [...prevProduct.reviews, newReview]
            };
        });
    }

    if (isLoading) {
        return <div className="text-center py-10 text-black">Chargement du produit...</div>
    }

    if (error || !product) {
        return <div className="text-center py-10 text-black">{error || 'Product not found'}</div>
    }

    const availableSizes = [...new Set(product.variants.map(v => v.size))]
    const availableColors = [...new Set(product.variants.map(v => v.color))]

    const handleVariantChange = (type: 'size' | 'color', value: string) => {
        setSelectedVariant(prev => {
            const newVariant = { ...prev, [type]: value }
            console.log("Selected variant updated:", newVariant)
            return newVariant
        })
    }

    const selectedVariantStock = selectedVariant && product ? product.variants.find(v => v.size === selectedVariant.size && v.color === selectedVariant.color)?.stock : 0;

    return (
        <div className="container mx-auto px-4 py-12" ref={productRef}>
            <Breadcrumb className="mb-4">
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/catalogue">Catalogue</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#" isCurrentPage>{product.name}</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2 product-image" ref={imageRef}>
                    <ProductGallery images={product.images} productName={product.name} />
                </div>
                <div className="lg:w-1/2 space-y-6 product-details" ref={detailsRef}>
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold text-black">{product.name}</h1>
                        <WishlistButton product={product} />
                    </div>
                    <p className="text-2xl font-bold text-black">{product.price.toFixed(2)} €</p>

                    <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Badge variant={selectedVariantStock > 0 ? "success" : "destructive"}>
                                {selectedVariantStock > 0 ? "En stock" : "Rupture de stock"}
                            </Badge>
                            {selectedVariantStock > 0 && (
                                <span className="text-sm text-gray-500">
                                    {selectedVariantStock} {selectedVariantStock === 1 ? "article disponible" : "articles disponibles"}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-700 mb-4">{product.description}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Taille</h3>
                                <Select
                                    onValueChange={(value) => handleVariantChange('size', value)}
                                    value={selectedVariant?.size}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionnez une taille" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSizes.map((size) => (
                                            <SelectItem key={size} value={size}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Couleur</h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableColors.map((color) => (
                                        <Button
                                            key={color}
                                            variant={selectedVariant?.color === color ? "default" : "outline"}
                                            onClick={() => handleVariantChange('color', color)}
                                            className={cn("rounded-md w-8 h-8 p-0", selectedVariant?.color === color && "bg-black text-white border-black")}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full py-4 text-lg bg-black text-white hover:bg-gray-800 rounded-md mt-4"
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || selectedVariantStock === 0}
                        ref={addToCartRef}
                    >
                        {selectedVariantStock > 0 ? "Ajouter au panier" : "Indisponible"}
                    </Button>

                    <div className="bg-gray-100 p-4 rounded-lg mt-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Truck className="mr-2" /> Informations de livraison
                        </h3>
                        <p className="text-sm text-gray-700">
                            Livraison gratuite pour les commandes de plus de 100€. Délai de livraison estimé : 3-5 jours ouvrables.
                        </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <SocialShare url={`https://reboul-store.com/produit/${product.id}`} title={product.name} />
                    </div>
                </div>
            </div>
            <Separator className="my-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div ref={sizeGuideRef}>
                    <SizeGuide sizes={product.variants.map(variant => variant.size)} sizeChart={product.sizeChart} />
                </div>
                <div ref={reviewsRef}>
                    <ProductReviews productId={product.id} initialReviews={product.reviews} onAddReview={handleAddReview} />
                </div>
            </div>
            <Separator className="my-8" />
            <div ref={recommendedRef}>
                <RecommendedProducts currentProductId={product.id} category={product.category} />
            </div>
            <Separator className="my-8" />
            <div ref={qaRef}>
                <ProductQA questions={product.questions} />
            </div>
            <Separator className="my-8" />
            <div ref={faqRef}>
                <ProductFAQ faqs={product.faqs} />
            </div>
        </div>
    )
}

