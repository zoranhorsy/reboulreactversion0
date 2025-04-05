'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ArrowUpDown, Eye, Package, Star, Calendar, ImageOff } from "lucide-react"
import { type Product, type Variant } from "@/lib/types/product"
import { type Category } from "@/lib/types/category"
import Link from "next/link"
import { formatPrice, convertToCloudinaryUrl } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { CloudinaryImage } from "@/components/ui/CloudinaryImage"
import { isCloudinaryUrl } from "@/config/cloudinary"
import { fixCloudinaryUrl } from "@/lib/cloudinary"
import { ProductImage } from "@/lib/types/product-image"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import Image from "next/image"

interface ProductTableProps {
    filteredProducts: Product[]
    categories: Category[]
    brands: { id: number; name: string }[]
    sortConfig: { key: keyof Product; direction: "ascending" | "descending" } | null
    handleSort: (key: keyof Product) => void
    handleEditProduct: (product: Product) => void
    handleDeleteProduct: (productId: number) => void
    handleToggleActive: (product: Product) => Promise<void>
}

export function ProductTable({
    filteredProducts,
    categories,
    brands,
    sortConfig,
    handleSort,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleActive,
}: ProductTableProps) {
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

    const getSortIcon = (key: keyof Product) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }
        return sortConfig.direction === "ascending" ? "↑" : "↓"
    }

    const renderSortableHeader = (key: keyof Product, label: string) => (
        <div
            className="flex items-center cursor-pointer hover:text-primary transition-colors"
            onClick={() => handleSort(key)}
        >
            {label}
            {getSortIcon(key)}
        </div>
    )

    const isSortableKey = (key: string): key is keyof Product => {
        return ['name', 'price', 'stock', 'category_id', 'brand_id', 'store_type', 'store_reference', 'created_at'].includes(key);
    }

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId)
        return category ? category.name : "Non catégorisé"
    }

    const getBrandName = (brandId: number) => {
        const brand = brands.find(b => b.id === brandId)
        return brand ? brand.name : "Non défini"
    }

    const getStockStatus = (product: Product) => {
        const totalStock = product.variants?.reduce((total, variant) => total + (variant.stock || 0), 0) || 0;

        if (totalStock === 0) {
            return (
                <Badge variant="destructive" className="w-full justify-center">
                    <Package className="w-3 h-3 mr-1" />
                    Rupture
                </Badge>
            )
        } else if (totalStock < 5) {
            return (
                <Badge variant="secondary" className="w-full justify-center bg-yellow-500/15 text-yellow-500">
                    <Package className="w-3 h-3 mr-1" />
                    Stock faible
                </Badge>
            )
        } else {
            return (
                <Badge variant="secondary" className="w-full justify-center bg-green-500/15 text-green-500">
                    <Package className="w-3 h-3 mr-1" />
                    En stock
                </Badge>
            )
        }
    }

    const getStoreTypeBadge = (type: string) => {
        switch (type) {
            case "adult":
                return <Badge variant="secondary" className="bg-blue-500/15 text-blue-500">Adulte</Badge>
            case "kids":
                return <Badge variant="secondary" className="bg-pink-500/15 text-pink-500">Enfant</Badge>
            case "sneakers":
                return <Badge variant="secondary" className="bg-purple-500/15 text-purple-500">Sneakers</Badge>
            case "cpcompany":
                return <Badge variant="secondary" className="bg-orange-500/15 text-orange-500">C.P COMPANY</Badge>
            default:
                return <Badge variant="secondary">Inconnu</Badge>
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    const getImageUrl = (product: Product): string => {
        if (product.images?.[0]) {
            if (typeof product.images[0] === 'string' && product.images[0].trim() !== '') {
                return product.images[0];
            } else if (typeof product.images[0] === 'object' && product.images[0] !== null) {
                if ('url' in product.images[0] && product.images[0].url && product.images[0].url.trim() !== '') {
                    return product.images[0].url;
                }
            }
        }
        // S'assurer de retourner une URL valide même si l'image est vide
        return (product.image_url && product.image_url.trim() !== '') || 
               (product.image && product.image.trim() !== '') 
               ? (product.image_url || product.image) 
               : "/placeholder.png";
    }

    const handleImageError = (productId: string) => {
        setImageErrors(prev => ({
            ...prev,
            [productId]: true
        }));
    }

    // Fonction pour calculer le stock total d'un produit
    const getTotalStock = (product: Product): number => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0);
        }
        return 0; // Si pas de variants, pas de stock
    }

    // Fonction pour afficher le tableau des stocks par variant
    const getStockDetailsTable = (variants: Variant[]): JSX.Element => {
        if (!variants || variants.length === 0) return <></>;

        // Trier les variants pour un affichage plus cohérent
        const sortedVariants = [...variants].sort((a, b) => {
            // Vérifier si les propriétés existent avant de les comparer
            const colorA = a.color || '';
            const colorB = b.color || '';
            const sizeA = a.size || '';
            const sizeB = b.size || '';
            
            return colorA.localeCompare(colorB) || sizeA.localeCompare(sizeB);
        });
        
        return (
            <div className="mt-1.5 bg-white/50 rounded-lg border border-border/40 overflow-hidden">
                <div className="text-[10px] font-medium bg-muted/30 p-1 grid grid-cols-3">
                    <div>Couleur</div>
                    <div>Taille</div>
                    <div className="text-right">Stock</div>
                </div>
                <div className="max-h-28 overflow-y-auto">
                    {sortedVariants.map((variant, idx) => (
                        <div 
                            key={`${variant.color}-${variant.size}-${idx}`} 
                            className="text-[9px] p-1 grid grid-cols-3 border-t border-border/20 first:border-0"
                        >
                            <div className="truncate">{variant.color}</div>
                            <div className="truncate">{variant.size}</div>
                            <div className="text-right font-medium">
                                {variant.stock > 0 ? (
                                    <span className={variant.stock < 3 ? "text-yellow-500" : "text-green-500"}>
                                        {variant.stock}
                                    </span>
                                ) : (
                                    <span className="text-red-500">0</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        {/* En-tête avec image et infos principales */}
                        <div className="flex gap-2 sm:gap-3">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                {imageErrors[product.id] ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageOff className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                                    </div>
                                ) : (
                                    <Link href={`/produit/${product.id}`} target="_blank">
                                        <Image
                                            src={getImageUrl(product) || "/placeholder.png"}
                                            alt={product.name}
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                            onError={() => handleImageError(product.id.toString())}
                                        />
                                    </Link>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1 sm:gap-2">
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <Link 
                                            href={`/produit/${product.id}`} 
                                            target="_blank"
                                            className="font-medium text-xs sm:text-sm hover:underline line-clamp-2"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
                                        {product.price.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">Catégorie</span>
                                <p className="truncate">{getCategoryName(product.category_id)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">Marque</span>
                                <p className="truncate">{getBrandName(product.brand_id)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">Magasin</span>
                                <div>{getStoreTypeBadge(product.store_type)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">Stock total</span>
                                <div className="flex items-center gap-1">
                                    {getStockStatus(product)}
                                    <span className="font-medium">
                                        {getTotalStock(product)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">SKU</span>
                                <p className="truncate">{product.sku || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[10px] sm:text-xs">Réf. Magasin</span>
                                <p className="truncate">{product.store_reference || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Caractéristiques et tags */}
                        <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm mt-2 border-t border-border/20 pt-2">
                            {/* Caractéristiques */}
                            {product.details && product.details.length > 0 && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">Caractéristiques</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {product.details.map((detail, idx) => (
                                            <Badge key={`detail-${idx}`} variant="outline" className="text-[9px] bg-white/60 px-1.5 py-0 h-4">
                                                {detail}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">Tags</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {product.tags.map((tag, idx) => (
                                            <Badge key={`tag-${idx}`} variant="secondary" className="text-[9px] bg-blue-100/50 text-blue-600 px-1.5 py-0 h-4">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Résumé des variantes avec stock détaillé */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-[10px] sm:text-xs">Détails des variantes et stocks</span>
                                    <span className="text-[10px] font-medium">
                                        {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                {/* Tableau des stocks par variant */}
                                {getStockDetailsTable(product.variants)}
                            </div>
                        )}

                        {/* Badges et statuts */}
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {product.featured && (
                                <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                    Mis en avant
                                </Badge>
                            )}
                            {product.new && (
                                <Badge variant="secondary" className="bg-green-500/15 text-green-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Nouveau
                                </Badge>
                            )}
                            {product.active ? (
                                <Badge variant="secondary" className="bg-blue-500/15 text-blue-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Actif
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-red-500/15 text-red-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Non publié
                                </Badge>
                            )}
                            {product.old_price && product.old_price > product.price && (
                                <Badge variant="secondary" className="bg-purple-500/15 text-purple-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Promo
                                </Badge>
                            )}
                            {product._actiontype === "delete" && (
                                <Badge variant="secondary" className="bg-red-500/15 text-red-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Supprimé
                                </Badge>
                            )}
                            {product._actiontype === "archive" && (
                                <Badge variant="secondary" className="bg-orange-500/15 text-orange-500 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5">
                                    Archivé
                                </Badge>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 sm:gap-2 pt-1 sm:pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                                onClick={() => handleEditProduct(product)}
                            >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                Éditer
                            </Button>

                            <Button
                                variant={product.active ? "secondary" : "outline"}
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                                onClick={() => handleToggleActive(product)}
                            >
                                {product.active ? "Désactiver" : "Activer"}
                            </Button>

                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs"
                                onClick={() => handleDeleteProduct(Number(product.id))}
                            >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                Supprimer
                            </Button>

                            <Link 
                                href={`/produit/${product.id}`}
                                target="_blank"
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                                >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {filteredProducts.length === 0 && (
                <div className="col-span-full p-8 text-center">
                    <p className="text-muted-foreground">Aucun produit trouvé</p>
                </div>
            )}
        </div>
    )
}

export default ProductTable

