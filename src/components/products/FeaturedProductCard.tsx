'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Star, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImage } from "@/lib/types/product-image"
import type { Product } from "@/lib/api"
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { getColorInfo, isWhiteColor } from '@/config/productColors'

interface FeaturedProductCardProps {
    product: Product
    className?: string
}

export function FeaturedProductCard({ product, className }: FeaturedProductCardProps) {
    const [imageError, setImageError] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const { toast } = useToast()

    // Vérifier si le produit est dans les favoris au chargement
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const favorites = await api.getFavorites()
                const isProductFavorite = favorites.some(fav => fav.id === product.id)
                setIsFavorite(isProductFavorite)
            } catch (error) {
                console.error('Erreur lors de la vérification des favoris:', error)
            }
        }
        
        checkFavoriteStatus()
    }, [product.id])

    const getImageUrl = (product: Product) => {
        // Fonction pour vérifier si une URL est valide
        const isValidUrl = (url: string): boolean => {
            if (!url) return false;
            // Vérifier si c'est une URL absolue
            if (url.startsWith('http://') || url.startsWith('https://')) return true;
            // Vérifier si c'est une URL relative
            if (url.startsWith('/')) return true;
            return false;
        };
        
        // Essayer d'abord les images du tableau
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            
            // Vérifier si c'est un objet ProductImage
            if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage && 'publicId' in firstImage) {
                const url = (firstImage as ProductImage).url;
                if (isValidUrl(url)) return url;
            }
            // Vérifier si c'est une chaîne de caractères (ancien format)
            else if (typeof firstImage === 'string') {
                if (isValidUrl(firstImage)) return firstImage;
            }
        }
        
        // Essayer ensuite l'image principale
        if (product.image && isValidUrl(product.image)) {
            return product.image;
        }
        
        // Essayer enfin l'image_url
        if (product.image_url && isValidUrl(product.image_url)) {
            return product.image_url;
        }
        
        return "/placeholder.png";
    }

    const handleImageError = () => {
        setImageError(true);
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price)
    }

    const calculateStock = () => {
        // Le produit n'a pas de stock direct, seulement via ses variantes
        
        // Si le produit a des variantes, additionner leurs stocks
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            return product.variants.reduce((total, variant) => {
                // Vérifier si la variante a un stock défini et qu'il est un nombre
                const variantStock = typeof variant.stock === 'number' ? variant.stock : 0;
                return total + variantStock;
            }, 0);
        }
        
        // Si pas de variantes, considérer que le stock est 0
        return 0;
    }

    const getStockLabel = () => {
        const stockLevel = calculateStock();
        
        if (stockLevel === 0) {
            return { label: 'Rupture', color: 'bg-red-500/80' }
        } else if (stockLevel <= 5) {
            return { label: 'Stock limité', color: 'bg-amber-500/80' }
        } else if (stockLevel <= 10) {
            return { label: 'En stock', color: 'bg-emerald-500/80' }
        } else {
            return { label: 'Disponible', color: 'bg-emerald-500/80' }
        }
    }
    
    // Extraire les tailles uniques des variantes
    const getAvailableSizes = () => {
        if (!product.variants || !Array.isArray(product.variants)) return [];
        
        // Ne récupérer que les tailles des variantes qui ont du stock
        const sizes = product.variants
            .filter(variant => typeof variant.stock === 'number' && variant.stock > 0)
            .map(variant => variant.size)
            .filter(Boolean);
            
        // Supprimer les doublons
        return Array.from(new Set(sizes));
    }
    
    // Extraire les couleurs uniques des variantes
    const getAvailableColors = () => {
        if (!product.variants || !Array.isArray(product.variants)) return [];
        
        // Ne récupérer que les couleurs des variantes qui ont du stock
        const colors = product.variants
            .filter(variant => typeof variant.stock === 'number' && variant.stock > 0)
            .map(variant => variant.color)
            .filter(Boolean);
            
        // Supprimer les doublons
        return Array.from(new Set(colors));
    }

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault() // Empêche la navigation vers la page produit
        
        if (isProcessing) return // Évite les clics multiples pendant le traitement
        
        try {
            setIsProcessing(true)
            
            if (isFavorite) {
                // Supprimer des favoris
                await api.removeFromFavorites(product.id)
                toast({
                    title: "Supprimé des favoris",
                    description: `${product.name} a été retiré de vos favoris`,
                    variant: "default",
                })
            } else {
                // Ajouter aux favoris
                await api.addToFavorites(product.id, product.is_corner_product ? 'corner' : 'main')
                toast({
                    title: "Ajouté aux favoris",
                    description: `${product.name} a été ajouté à vos favoris`,
                    variant: "default",
                })
            }
            
            // Mettre à jour l'état local après succès
            setIsFavorite(!isFavorite)
        } catch (error) {
            let errorMessage = "Une erreur est survenue"
            
            if (error instanceof Error) {
                if (error.message.includes('connecté')) {
                    errorMessage = "Veuillez vous connecter pour ajouter des favoris"
                } else {
                    errorMessage = error.message
                }
            }
            
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const stockInfo = getStockLabel();
    const hasStock = calculateStock() > 0;
    const availableSizes = getAvailableSizes();
    const availableColors = getAvailableColors();

    return (
        <Link href={product.is_corner_product ? `/the-corner/${product.id}` : `/produit/${product.id}`}>
            <Card className={cn(
                "group relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
                "shadow-sm hover:shadow-md hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300",
                className
            )}>
                <div className="aspect-[4/5] relative overflow-hidden">
                    {imageError ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ImageOff className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                        </div>
                    ) : (
                        <Image
                            src={getImageUrl(product)}
                            alt={product.name}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-500 group-hover:scale-105",
                                !hasStock && "opacity-75 grayscale-[30%]"
                            )}
                            sizes="(max-width: 640px) 30vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 25vw"
                            priority
                            onError={handleImageError}
                        />
                    )}
                    
                    {/* Badge de stock et bouton favoris */}
                    <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start">
                        <div className={cn(
                            "px-1.5 py-0.5 sm:px-2 h-auto backdrop-blur-sm text-[8px] sm:text-[10px] md:text-xs font-medium text-white inline-flex items-center rounded-sm",
                            stockInfo.color
                        )}>
                            {stockInfo.label}
                        </div>
                        
                        <div 
                            onClick={toggleFavorite}
                            className={cn(
                                "h-6 w-6 rounded-full",
                                "flex items-center justify-center cursor-pointer",
                                "transition-all duration-300",
                                isFavorite 
                                    ? "bg-rose-500/90 text-white" 
                                    : "bg-white/70 dark:bg-zinc-950/70 text-zinc-500 dark:text-zinc-400",
                                "backdrop-blur-sm",
                                "hover:scale-110",
                                isProcessing ? "pointer-events-none opacity-50" : ""
                            )}
                        >
                            {isProcessing ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg 
                                    className="w-3 h-3" 
                                    viewBox="0 0 24 24"
                                    fill={isFavorite ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Nouvelle section d'informations produit en dehors de l'image */}
                <div className="p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-geist text-[10px] sm:text-xs md:text-sm font-medium truncate leading-tight text-zinc-900 dark:text-zinc-200">
                            {product.name}
                        </h3>
                        {product.rating && (
                            <div className="flex items-center gap-0.5 mt-0.5 ml-auto flex-shrink-0">
                                <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[8px] sm:text-[9px] md:text-[10px] text-zinc-500 dark:text-zinc-400">
                                    {product.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-geist text-[10px] sm:text-xs md:text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            {formatPrice(product.price)}
                        </span>
                        {product.brand && (
                            <span className="text-[8px] sm:text-[9px] tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                                {product.brand}
                            </span>
                        )}
                    </div>
                    
                    {/* Affichage des tailles et couleurs disponibles */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {availableSizes.length > 0 && (
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-sm px-1.5 py-0.5">
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400">
                                    Tailles:
                                </span>
                                <div className="flex items-center gap-1">
                                    {availableSizes.slice(0, 4).map((size, index) => (
                                        <span 
                                            key={index} 
                                            className="text-[8px] sm:text-[9px] font-medium text-zinc-900 dark:text-zinc-200"
                                        >
                                            {size}{index < Math.min(availableSizes.length, 4) - 1 ? ", " : ""}
                                        </span>
                                    ))}
                                    {availableSizes.length > 4 && (
                                        <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400">
                                            +{availableSizes.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {availableColors.length > 0 && (
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-sm px-1.5 py-0.5">
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400">
                                    Couleurs:
                                </span>
                                <div className="flex items-center gap-0.5">
                                    {availableColors.slice(0, 3).map((color, index) => {
                                        const colorInfo = getColorInfo(color || '');
                                        
                                        return (
                                            <span 
                                                key={index} 
                                                className="text-[8px] sm:text-[9px] font-medium text-zinc-900 dark:text-zinc-200"
                                                title={colorInfo.label}
                                            >
                                                {colorInfo.label}{index < Math.min(availableColors.length, 3) - 1 ? ", " : ""}
                                            </span>
                                        );
                                    })}
                                    {availableColors.length > 3 && (
                                        <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400">
                                            +{availableColors.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}

