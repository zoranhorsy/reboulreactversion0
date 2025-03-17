'use client'

import React, { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product as APIProduct } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart } from '@/app/contexts/CartContext'
import { ArrowLeft, Heart, Share2, ChevronRight, Info, ShoppingBag, Truck, RefreshCw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SimilarProducts } from '@/components/SimilarProducts'
import { RecentlyViewedProducts } from '@/components/RecentlyViewedProducts'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductDetails } from '@/components/ProductDetails'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ProductWithCart extends APIProduct {
    quantity: number;
    variant?: {
        size: string;
        color: string;
    };
    new?: boolean;
    features?: string[];
    sku?: string;
    weight?: number;
    dimensions?: string;
    material?: string;
}

const calculateTotalStock = (variants: { size: string; color: string; stock: number }[]): number => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
};

const getVariantStock = (variants: { size: string; color: string; stock: number }[], selectedSize: string, selectedColor: string): number => {
    const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
    return variant?.stock || 0;
};

export default function ProductPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<ProductWithCart | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [selectedColor, setSelectedColor] = useState<string>('')
    const [quantity, setQuantity] = useState(1)
    const [isWishlist, setIsWishlist] = useState(false)
    const { toast } = useToast()
    const { addItem } = useCart()

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
                    console.log('Produit récupéré:', fetchedProduct);
                    console.log('Images brutes du produit:', fetchedProduct.images);
                    
                    // Traitement des images
                    const processedImages = Array.isArray(fetchedProduct.images) 
                        ? fetchedProduct.images.map(image => {
                            if (typeof image === 'string') {
                                if (image.startsWith('http')) {
                                    console.log('Image URL absolue:', image);
                                    return image;
                                }
                                // Assurez-vous que l'URL est correctement construite pour les images
                                const processedUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image.split('/').pop()}`;
                                console.log('Image URL relative transformée:', processedUrl);
                                return processedUrl;
                            }
                            console.log('Image non-string:', image);
                            // Handle ProductImage objects
                            if ('url' in image) {
                                return image.url;
                            }
                            // Handle File and Blob objects
                            return URL.createObjectURL(image as Blob);
                        })
                        : [];
                    
                    console.log('Images traitées:', processedImages);
                    console.log('Nombre d\'images après traitement:', processedImages.length);
                    
                    setProduct({
                        ...fetchedProduct,
                        quantity: 1,
                        images: processedImages
                    })
                    
                    if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                        setSelectedSize(fetchedProduct.variants[0].size)
                        setSelectedColor(fetchedProduct.variants[0].color)
                    }
                } else {
                    notFound()
                }
            } catch (error) {
                console.error('Error fetching product:', error)
                setError('Impossible de charger le produit. Veuillez réessayer plus tard.')
                toast({
                    title: "Erreur",
                    description: "Impossible de charger le produit. Veuillez réessayer plus tard.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProductData()
    }, [id, toast])

    const handleAddToCart = () => {
        if (!product) return

        const variantStock = getVariantStock(product.variants, selectedSize, selectedColor)
        if (variantStock < quantity) {
            toast({
                title: "Stock insuffisant",
                description: `Il ne reste que ${variantStock} exemplaires de ce produit dans la taille et couleur sélectionnées.`,
                variant: "destructive",
            })
            return
        }

        const imageUrl = product.images && product.images.length > 0 
            ? (typeof product.images[0] === 'object' && 'url' in product.images[0] 
                ? product.images[0].url as string
                : typeof product.images[0] === 'string' 
                    ? product.images[0] 
                    : '/placeholder.png')
            : '/placeholder.png';

        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity,
            variant: {
                size: selectedSize,
                color: selectedColor
            }
        }

        addItem(cartItem)
        toast({
            title: "Produit ajouté au panier",
            description: `${product.name} a été ajouté à votre panier.`,
        })
    }

    const handleShare = async () => {
        if (!product) return

        try {
            await navigator.share({
                title: product.name,
                text: product.description,
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
        { label: 'Catalogue', href: '/catalogue' },
        { label: product.name, href: '#' },
    ]

    const formatPrice = (price: number | undefined) => {
        if (price === undefined || price === null) return 'Prix sur demande';
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numericPrice)) return 'Prix sur demande';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericPrice);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation et fil d'Ariane */}
            <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/catalogue" 
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Link>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-4 py-8">
                {/* En-tête du produit (mobile uniquement) */}
                <div className="lg:hidden mb-6 space-y-3">
                    <h1 className="text-2xl font-medium">{product.name}</h1>
                    <div className="flex items-center gap-2">
                        {product.brand && (
                            <Badge variant="outline" className="px-2 py-1 text-xs">
                                {product.brand}
                            </Badge>
                        )}
                        {product.category && (
                            <Badge variant="outline" className="px-2 py-1 text-xs">
                                {product.category}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Section principale du produit */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Galerie d'images */}
                    <div className="w-full">
                        <ProductGallery 
                            images={product.images} 
                            productName={product.name}
                            brand={product.brand}
                            isNew={Boolean(product.new)}
                            isFeatured={product.featured}
                            discount={product.old_price && product.price 
                                ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
                                : undefined}
                        />
                    </div>

                    {/* Détails du produit */}
                    <div className="w-full">
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

                        {/* Informations techniques du produit */}
                        {(product.description || product.sku || product.weight || product.dimensions || product.material) && (
                            <div className="mt-8 p-6 bg-muted/20 rounded-lg border border-border/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">Informations produit</h3>
                                </div>
                                
                                {product.description && (
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    {product.sku && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Référence</p>
                                            <p className="text-sm font-medium">{product.sku}</p>
                                        </div>
                                    )}
                                    {product.brand && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Marque</p>
                                            <p className="text-sm font-medium">{product.brand}</p>
                                        </div>
                                    )}
                                    {product.category && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Catégorie</p>
                                            <p className="text-sm font-medium">{product.category}</p>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Poids</p>
                                            <p className="text-sm font-medium">{product.weight} g</p>
                                        </div>
                                    )}
                                    {product.dimensions && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Dimensions</p>
                                            <p className="text-sm font-medium">{product.dimensions}</p>
                                        </div>
                                    )}
                                    {product.material && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Matière</p>
                                            <p className="text-sm font-medium">{product.material}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Avantages d'achat */}
                <div className="mb-16 bg-muted/10 rounded-xl p-8">
                    <h2 className="text-xl font-medium mb-6 text-center">Pourquoi acheter chez nous ?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-medium">Livraison rapide</h3>
                            <p className="text-sm text-muted-foreground">Livraison gratuite à partir de 100€ d&apos;achat. Livraison en 2-4 jours ouvrés.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-medium">Retours faciles</h3>
                            <p className="text-sm text-muted-foreground">30 jours pour changer d&apos;avis. Retours gratuits en boutique ou à domicile.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-medium">Garantie authentique</h3>
                            <p className="text-sm text-muted-foreground">Tous nos produits sont 100% authentiques et garantis.</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-16" />

                {/* Produits similaires */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-medium">Produits similaires</h2>
                        <Link href="/catalogue" className="text-sm text-primary hover:underline flex items-center">
                            Voir plus <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <SimilarProducts currentProductId={product.id} />
                </div>

                {/* Produits récemment consultés */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-medium">Récemment consultés</h2>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Basé sur votre historique de navigation</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <RecentlyViewedProducts currentProductId={product.id} />
                </div>

                {/* Appel à l'action mobile */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-lg font-medium">{formatPrice(product.price)}</p>
                            {product.old_price && (
                                <p className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.old_price)}
                                </p>
                            )}
                        </div>
                        <Button 
                            className="flex-1 h-12"
                            onClick={handleAddToCart}
                            disabled={!selectedSize || !selectedColor}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Ajouter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

