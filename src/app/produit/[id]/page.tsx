'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { getProductById, Product as APIProduct } from '@/lib/api'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useCart } from '@/app/contexts/CartContext'
import { type CartItem } from '@/lib/types/cart'
import { ArrowLeft, Heart, Share2, ChevronRight, Info, ShoppingBag, Truck, RefreshCw, ShieldCheck, Calendar, Award, Star, Tag } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { useFavorites } from '@/app/contexts/FavoritesContext'

interface ProductWithCart extends Omit<APIProduct, 'featured'> {
    quantity: number;
    variant?: {
        size: string;
        color: string;
    };
    new?: boolean;
    features?: string[];
    sku?: string | null;
    weight?: number | null;
    dimensions?: string | null;
    material?: string | null;
    old_price?: number;
    featured?: boolean;
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
    const { addItem, openCart } = useCart()
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

    useEffect(() => {
        // Variable pour suivre si le composant est monté
        let isMounted = true;
        
        const fetchProductData = async () => {
            // Si le produit est déjà chargé avec le bon ID, ne pas recharger
            if (product && product.id === id) {
                return;
            }
            
            setIsLoading(true)
            setError(null)
            try {
                if (!id) {
                    notFound()
                    return
                }
                const fetchedProduct = await getProductById(id)
                if (isMounted && fetchedProduct) {
                    console.log('Produit récupéré:', fetchedProduct);
                    
                    // Traitement des images
                    const processedImages = Array.isArray(fetchedProduct.images) 
                        ? fetchedProduct.images.map(image => {
                            if (typeof image === 'string') {
                                if (image.startsWith('http')) {
                                    return image;
                                }
                            }
                            return image;
                        }) 
                        : [];
                    
                    // Mise à jour du produit
                    const updatedProduct = {
                        ...fetchedProduct,
                        images: processedImages,
                        quantity: 1
                    };
                    
                    setProduct(updatedProduct);
                    
                    // Vérifier si le produit est dans les favoris
                    if (isFavorite(fetchedProduct.id)) {
                        setIsWishlist(true);
                    }
                } else if (isMounted) {
                    notFound()
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching product:', error)
                    notFound()
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchProductData()
        
        // Nettoyage explicite pour éviter tout effet de bord
        return () => {
            isMounted = false;
        };
    // Suppression de toute dépendance qui pourrait causer des rechargements, 
    // puisque ce useEffect ne devrait s'exécuter qu'une fois au chargement ou quand l'id change
    }, [id, isFavorite, product])

    const handleAddToCart = () => {
        if (!product) {
            console.error("ProductPage - Product is null");
            return;
        }

        try {
            // Si le produit n'a pas de variantes, ajouter directement
            if (!product.variants || product.variants.length === 0) {
                const cartItem: CartItem = {
                    id: product.id,
                    name: product.name,
                    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                    quantity: quantity,
                    image: Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                        ? product.images[0]
                        : "/placeholder.svg",
                    variant: {
                        size: 'Unique',
                        color: 'Standard',
                        colorLabel: 'Standard',
                        stock: 10 // Valeur par défaut
                    }
                };
                
                addItem(cartItem);
                
                toast({
                    title: "Produit ajouté au panier",
                    description: `${product.name} × ${quantity} a été ajouté à votre panier.`,
                });
                
                setQuantity(1);
                openCart();
                return;
            }
            
            // Si l'utilisateur n'a pas spécifié de taille/couleur mais il y a des variantes,
            // on ajoute la première variante disponible
            if ((!selectedSize || !selectedColor) && product.variants.length > 0) {
                // Trouver la première variante avec du stock
                const firstAvailableVariant = product.variants.find(v => v.stock > 0);
                
                if (firstAvailableVariant) {
                    // Mettre à jour la sélection
                    setSelectedSize(firstAvailableVariant.size);
                    setSelectedColor(firstAvailableVariant.color);
                    
                    const cartItem: CartItem = {
                        id: `${product.id}-${firstAvailableVariant.size}-${firstAvailableVariant.color}`,
                        name: `${product.name} (${firstAvailableVariant.size}, ${firstAvailableVariant.color})`,
                        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                        quantity: quantity,
                        image: Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                            ? product.images[0]
                            : "/placeholder.svg",
                        variant: {
                            size: firstAvailableVariant.size,
                            color: firstAvailableVariant.color,
                            colorLabel: firstAvailableVariant.color,
                            stock: firstAvailableVariant.stock
                        }
                    };
                    
                    addItem(cartItem);
                    
                    toast({
                        title: "Produit ajouté au panier",
                        description: `${product.name} (${firstAvailableVariant.size}, ${firstAvailableVariant.color}) × ${quantity} a été ajouté à votre panier.`,
                    });
                    
                    setQuantity(1);
                    openCart();
                    return;
                } else {
                    throw new Error("Aucune variante disponible en stock");
                }
            }

            // Si une taille et une couleur sont sélectionnées, vérifier que la variante existe
            const variant = product.variants?.find((v) => v.size === selectedSize && v.color === selectedColor);

            if (!variant) {
                throw new Error(`Cette combinaison de taille (${selectedSize}) et couleur (${selectedColor}) n'est pas disponible.`);
            }

            // Vérifier que la quantité demandée est valide
            if (quantity <= 0) {
                throw new Error("La quantité doit être supérieure à 0.");
            }

            // Vérifier que le stock est suffisant
            if (variant.stock < quantity) {
                throw new Error(`Stock insuffisant. Seulement ${variant.stock} unité(s) disponible(s).`);
            }

            const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

            const cartItem: CartItem = {
                id: cartItemId,
                name: `${product.name} (${selectedSize}, ${selectedColor})`,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                quantity: quantity,
                image: Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                    ? product.images[0]
                    : "/placeholder.svg",
                variant: {
                    size: selectedSize,
                    color: selectedColor,
                    colorLabel: selectedColor,
                    stock: variant.stock
                }
            };

            addItem(cartItem);

            toast({
                title: "Produit ajouté au panier",
                description: `${product.name} (${selectedSize}, ${selectedColor}) × ${quantity} a été ajouté à votre panier.`,
            });

            setQuantity(1);
            openCart();
        } catch (error) {
            console.error("ProductPage - Error adding to cart:", error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible d&apos;ajouter le produit au panier. Veuillez réessayer.",
                variant: "destructive",
            });
        }
    };

    // Fonction pour mettre à jour la quantité
    const handleQuantityChange = (newQuantity: number) => {
        if (!product) return;

        const variant = product.variants?.find((v) => v.size === selectedSize && v.color === selectedColor);
        if (!variant) return;

        // Vérifier que la nouvelle quantité ne dépasse pas le stock disponible
        if (newQuantity > variant.stock) {
            toast({
                title: "Stock insuffisant",
                description: `Seulement ${variant.stock} unité(s) disponible(s).`,
                variant: "destructive",
            });
            return;
        }

        setQuantity(newQuantity);
    };

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
        if (!product) return;
        
        if (isWishlist) {
            removeFromFavorites(product.id);
            toast({
                title: "Produit retiré des favoris",
                description: "Le produit a été retiré de votre liste de favoris",
            });
        } else {
            const productForFavorites: APIProduct = {
                ...product,
                featured: Boolean(product.featured)
            };
            addToFavorites(productForFavorites);
            toast({
                title: "Produit ajouté aux favoris",
                description: "Le produit a été ajouté à votre liste de favoris",
            });
        }
        
        setIsWishlist(!isWishlist);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Chargement du produit...</p>
                </div>
            </div>
        )
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

    const availabilityStatus = () => {
        if (!product.variants || product.variants.length === 0) return 'Indisponible';
        
        const totalStock = calculateTotalStock(product.variants);
        if (totalStock === 0) return 'Rupture de stock';
        if (totalStock < 5) return 'Stock limité';
        return 'En stock';
    }
    
    const getAvailabilityColor = () => {
        const status = availabilityStatus();
        if (status === 'En stock') return 'text-green-600';
        if (status === 'Stock limité') return 'text-amber-600';
        return 'text-red-600';
    }

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            {/* Navigation et fil d'Ariane */}
            <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/10">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/catalogue" 
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Retour</span>
                    </Link>
                    <div className="hidden sm:block">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-full ${isWishlist ? 'text-red-500' : ''}`}
                            onClick={toggleWishlist}
                        >
                            <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-4 py-4 lg:py-8">
                {/* Section principale du produit */}
                <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-12">
                    {/* Galerie d'images */}
                    <div className="w-full mb-6 lg:mb-0">
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

                    {/* Informations produit */}
                    <div className="w-full">
                        <ProductDetails
                            product={product as any}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            quantity={quantity}
                            onSizeChange={setSelectedSize}
                            onColorChange={(color) => {
                                // Réinitialiser la taille lorsqu'une nouvelle couleur est sélectionnée
                                setSelectedSize('');
                                setSelectedColor(color);
                            }}
                            onQuantityChange={handleQuantityChange}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={toggleWishlist}
                            onShare={handleShare}
                            isWishlist={isWishlist}
                        />
                    </div>
                </div>

                <Separator className="my-10" />

                {/* Produits similaires */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-medium">Produits similaires</h2>
                        <Link href="/catalogue" className="text-sm text-primary hover:underline flex items-center">
                            Voir plus <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    {product && (
                        <SimilarProducts 
                            currentProductId={product.id} 
                            key={`similar-${product.id}`} 
                        />
                    )}
                </div>

                {/* Produits récemment consultés */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-medium">Récemment consultés</h2>
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
                    {product && (
                        <RecentlyViewedProducts 
                            currentProductId={product.id} 
                            key={`recent-${product.id}`}
                        />
                    )}
                </div>

                {/* Appel à l'action mobile */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-base font-medium">{formatPrice(product.price)}</p>
                            {product.old_price && (
                                <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.old_price)}
                                </p>
                            )}
                        </div>
                        <Button 
                            className="flex-1 h-12"
                            onClick={handleAddToCart}
                            disabled={product.variants && product.variants.length > 0 && (!selectedColor || getVariantStock(product.variants, selectedSize, selectedColor) === 0)}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Ajouter au panier
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

