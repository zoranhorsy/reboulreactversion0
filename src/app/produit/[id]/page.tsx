'use client'

import React, { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product as APIProduct } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart, CartItem } from '@/app/contexts/CartContext'
import { ArrowLeft, Heart, Share2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SimilarProducts } from '@/components/SimilarProducts'
import { RecentlyViewedProducts } from '@/components/RecentlyViewedProducts'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Truck, RefreshCw, ShieldCheck, MessageSquare } from 'lucide-react'
import { ProductGallery } from '@/components/ProductGallery'

interface ProductWithCart extends APIProduct {
    quantity: number;
    variant?: {
        size: string;
        color: string;
    };
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
                    setProduct({
                        ...fetchedProduct,
                        quantity: 1,
                        images: Array.isArray(fetchedProduct.images) 
                            ? fetchedProduct.images.map(image => 
                            typeof image === 'string' ? image : URL.createObjectURL(image)
                              )
                            : []
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

            const cartItem: CartItem = {
                id: `${product.id}-${selectedSize}-${selectedColor}`,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: Array.isArray(product.images) && product.images.length > 0 
                    ? (typeof product.images[0] === 'string' ? product.images[0] : '/placeholder.svg')
                    : '/placeholder.svg',
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
        console.log('Prix reçu dans la page produit:', price, typeof price);
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
            {/* Navigation flottante avec effet de flou */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/5">
                <div className="w-full px-4 h-16 flex items-center justify-between">
                    <Link href="/catalogue" 
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Link>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
            </div>

            {/* Contenu principal */}
            <div className="w-full pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px]">
                    {/* Section des images avec animations améliorées */}
                    <div className="relative h-full">
                        <div className="sticky top-16 w-full h-[calc(100vh-4rem)]">
                            <ProductGallery 
                                images={product.images.map(image => 
                                    typeof image === 'string' ? image : '/placeholder.svg'
                                )} 
                                productName={product.name} 
                            />
                        </div>
                    </div>

                    {/* Section des informations produit */}
                    <div className="relative border-l border-border/5">
                        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                            <div className="p-8 space-y-8">
                                {/* En-tête du produit */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {product.category && (
                                                <Badge 
                                                    variant="secondary" 
                                                    className="px-3 py-1.5 text-xs tracking-wider"
                                                >
                                                    {product.category}
                                                </Badge>
                                            )}
                                            {(() => {
                                                const totalStock = calculateTotalStock(product.variants);
                                                if (totalStock > 0) {
                                                    return (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="px-3 py-1.5 text-xs tracking-wider bg-green-500/10 text-green-500 border-green-500/20"
                                                        >
                                                            {totalStock} en stock
                                                        </Badge>
                                                    );
                                                }
                                                return (
                                                    <Badge 
                                                        variant="destructive" 
                                                        className="px-3 py-1.5 text-xs tracking-wider"
                                                    >
                                                        Rupture de stock
                                                    </Badge>
                                                );
                                            })()}
                                            {product.featured && (
                                                <Badge 
                                                    variant="secondary" 
                                                    className="px-3 py-1.5 text-xs tracking-wider bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                >
                                                    Produit vedette
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-muted-foreground tracking-[0.2em] uppercase">
                                                    {product.brand || 'Marque non spécifiée'}
                                                </p>
                                                {product.brand_id && (
                                                    <Link href={`/marques/${product.brand_id}`} className="text-xs text-primary/60 hover:text-primary transition-colors">
                                                        Voir la marque <ChevronRight className="w-3 h-3 inline-block" />
                                                    </Link>
                                                )}
                                            </div>
                                            <h1 className="text-3xl font-light tracking-tight">{product.name}</h1>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-2xl font-light">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.price && product.price >= 100 && (
                                                <span className="text-sm text-green-500">
                                                    Livraison offerte
                                                </span>
                                            )}
                                        </div>
                                        {product.description && (
                                            <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                                {product.description}
                                            </p>
                                        )}
                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {product.tags.map((tag, index) => (
                                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/5 text-primary">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator className="bg-border/5" />

                                {/* Section des variantes */}
                                <div className="space-y-6">
                                    {/* Sélection de la taille */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Taille</label>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedSize ? `Taille sélectionnée : ${selectedSize}` : 'Sélectionnez une taille'}
                                                </p>
                                            </div>
                                            <button 
                                                className="text-xs text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                                                onClick={() => toast({
                                                    title: "Guide des tailles",
                                                    description: "Le guide des tailles sera bientôt disponible.",
                                                })}
                                            >
                                                Guide des tailles
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants
                                                .map(v => v.size)
                                                .filter((size, index, self) => self.indexOf(size) === index)
                                                .sort()
                                                .map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`min-w-[3rem] h-10 px-3 rounded-lg border-2 transition-all duration-200
                                                            ${selectedSize === size 
                                                                ? 'border-primary bg-primary text-primary-foreground scale-105' 
                                                                : 'border-border hover:border-primary/50 hover:bg-primary/5'}
                                                            text-sm font-medium`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    {/* Sélection de la couleur */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Couleur</label>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedColor || 'Sélectionnez une couleur'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {product.variants
                                                .map(v => v.color)
                                                .filter((color, index, self) => self.indexOf(color) === index)
                                                .sort()
                                                .map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setSelectedColor(color)}
                                                        className={`group relative w-12 h-12 rounded-xl transition-all duration-200
                                                            ${selectedColor === color 
                                                                ? 'ring-2 ring-primary scale-105' 
                                                                : 'hover:scale-105'}`}
                                                        title={color}
                                                    >
                                                        <div
                                                            className="absolute inset-2 rounded-lg"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                        <div className="absolute inset-0 rounded-xl ring-1 ring-border/10 
                                                            group-hover:ring-primary/50 transition-all duration-200" />
                                                        {selectedColor === color && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    {/* Sélection de la quantité */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium">Quantité</label>
                                                {selectedSize && selectedColor ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Maximum {Math.min(5, getVariantStock(product.variants, selectedSize, selectedColor))} articles
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        Sélectionnez une taille et une couleur
                                                    </p>
                                                )}
                                            </div>
                                            {selectedSize && selectedColor && (
                                                <span className="text-xs text-muted-foreground">
                                                    {getVariantStock(product.variants, selectedSize, selectedColor)} disponibles
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 w-32">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1 || !selectedSize || !selectedColor}
                                                className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary/50 
                                                    flex items-center justify-center transition-all duration-200
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center font-medium">{quantity}</div>
                                            <button
                                                onClick={() => {
                                                    const maxStock = Math.min(5, getVariantStock(product.variants, selectedSize, selectedColor));
                                                    setQuantity(Math.min(maxStock, quantity + 1));
                                                }}
                                                disabled={
                                                    !selectedSize || 
                                                    !selectedColor || 
                                                    quantity >= Math.min(5, getVariantStock(product.variants, selectedSize, selectedColor))
                                                }
                                                className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary/50 
                                                    flex items-center justify-center transition-all duration-200
                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border/5" />

                                {/* Actions */}
                                <div className="space-y-4">
                                    <Button 
                                        onClick={handleAddToCart}
                                        disabled={!selectedSize || !selectedColor || product.stock === 0}
                                        className="w-full h-14 text-base tracking-wide hover:scale-[1.02] transition-transform
                                            disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {!selectedSize || !selectedColor 
                                            ? 'Sélectionnez une taille et une couleur'
                                            : product.stock === 0
                                            ? 'Produit indisponible'
                                            : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Ajouter au panier
                                                    <span className="text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                                                        ({formatPrice(product.price * quantity)})
                                                    </span>
                                                </span>
                                            )}
                                    </Button>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 hover:bg-primary/5 group"
                                            onClick={toggleWishlist}
                                        >
                                            <Heart 
                                                className={`w-5 h-5 mr-2 transition-all duration-300
                                                    ${isWishlist 
                                                        ? 'fill-primary stroke-primary scale-110' 
                                                        : 'group-hover:scale-110'}`} 
                                            />
                                            {isWishlist ? 'Dans vos favoris' : 'Favoris'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 hover:bg-primary/5 group"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                            Partager
                                        </Button>
                                    </div>
                                </div>

                                {/* Informations supplémentaires */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-help">
                                        <span className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform" />
                                        <span className="group-hover:text-primary transition-colors">
                                            {product.price >= 100 
                                                ? 'Livraison gratuite disponible' 
                                                : `Livraison gratuite à partir de ${formatPrice(100 - product.price)}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-help">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-110 transition-transform" />
                                        <span className="group-hover:text-primary transition-colors">
                                            Retours gratuits sous 30 jours
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section des produits recommandés */}
                <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 relative">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                    <div className="max-w-[2000px] mx-auto px-8 py-32 relative space-y-32">
                        {/* Produits de la même marque */}
                        {product.brand && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-geist text-xs font-medium uppercase tracking-[0.2em]">
                                        Collection {product.brand}
                                    </h2>
                                    <div className="flex-grow h-px bg-border/5" />
                                    <Link 
                                        href={`/marques/${product.brand_id}`}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        Voir la collection
                                    </Link>
                                </div>
                                <SimilarProducts currentProductId={String(product.id)} brandId={String(product.brand_id)} />
                            </div>
                        )}

                        {/* Produits de la même catégorie */}
                        {product.category && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-geist text-xs font-medium uppercase tracking-[0.2em]">
                                        Dans la même catégorie
                                    </h2>
                                    <div className="flex-grow h-px bg-border/5" />
                                    <Link 
                                        href={`/catalogue?category=${product.category_id}`}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        Voir la catégorie
                                    </Link>
                                </div>
                                <SimilarProducts currentProductId={String(product.id)} categoryId={String(product.category_id)} />
                            </div>
                        )}

                        {/* Produits similaires */}
                        {(!product.brand && !product.category) && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-geist text-xs font-medium uppercase tracking-[0.2em]">
                                        Produits similaires
                                    </h2>
                                    <div className="flex-grow h-px bg-border/5" />
                                </div>
                                <SimilarProducts currentProductId={String(product.id)} />
                            </div>
                        )}

                        {/* Derniers produits consultés */}
                        <div className="space-y-12">
                            <div className="flex items-center gap-4">
                                <h2 className="font-geist text-xs font-medium uppercase tracking-[0.2em]">
                                    Historique de navigation
                                </h2>
                                <div className="flex-grow h-px bg-border/5" />
                            </div>
                            <RecentlyViewedProducts currentProductId={String(product.id)} />
                        </div>
                    </div>
                </div>

                {/* Section newsletter et réassurance */}
                <div className="w-full bg-white dark:bg-zinc-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.02] dark:opacity-[0.01]" />
                    <div className="max-w-[2000px] mx-auto px-8 py-32 relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
                            {/* Newsletter */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="font-geist text-xs font-medium uppercase tracking-[0.2em]">
                                        Newsletter
                                    </h2>
                                    <p className="font-geist text-2xl font-light text-zinc-900 dark:text-zinc-100">
                                        Restez informé des dernières collections et offres exclusives
                                    </p>
                                    <p className="text-muted-foreground">
                                        Inscrivez-vous à notre newsletter pour ne rien manquer de nos actualités.
                                    </p>
                                </div>
                                <form className="flex gap-4">
                                    <Input 
                                        type="email" 
                                        placeholder="Votre adresse email" 
                                        className="flex-1 h-12 bg-transparent"
                                    />
                                    <Button size="lg" className="h-12 px-8">
                                        S&apos;inscrire
                                    </Button>
                                </form>
                            </div>

                            {/* Réassurance */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="group space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center
                                        group-hover:bg-primary/10 transition-colors">
                                        <Truck className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-geist text-lg font-medium group-hover:text-primary transition-colors">
                                        Livraison rapide
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Livraison gratuite à partir de 100€ d&apos;achat. 
                                        Livraison en 2-4 jours ouvrés.
                                    </p>
                                </div>
                                <div className="group space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center
                                        group-hover:bg-primary/10 transition-colors">
                                        <RefreshCw className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-geist text-lg font-medium group-hover:text-primary transition-colors">
                                        Retours faciles
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        30 jours pour changer d&apos;avis. 
                                        Retours gratuits en boutique ou à domicile.
                                    </p>
                                </div>
                                <div className="group space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center
                                        group-hover:bg-primary/10 transition-colors">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-geist text-lg font-medium group-hover:text-primary transition-colors">
                                        Paiement sécurisé
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Vos paiements sont sécurisés. 
                                        Nous acceptons toutes les cartes bancaires.
                                    </p>
                                </div>
                                <div className="group space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center
                                        group-hover:bg-primary/10 transition-colors">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-geist text-lg font-medium group-hover:text-primary transition-colors">
                                        Service client
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Une question ? Notre équipe est à votre écoute 
                                        du lundi au samedi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

