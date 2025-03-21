'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ArrowUpDown, Eye, Package, Star, Calendar, ImageOff } from "lucide-react"
import { type Product } from "@/lib/types/product"
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
}

export function ProductTable({
    filteredProducts,
    categories,
    brands,
    sortConfig,
    handleSort,
    handleEditProduct,
    handleDeleteProduct,
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
            return typeof product.images[0] === 'string' 
                ? product.images[0] 
                : product.images[0].url;
        }
        return product.image_url || product.image || "/placeholder.png";
    }

    const handleImageError = (productId: string) => {
        setImageErrors(prev => ({
            ...prev,
            [productId]: true
        }));
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                        {/* En-tête avec image et infos principales */}
                        <div className="flex gap-3">
                            <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                {imageErrors[product.id] ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageOff className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                ) : (
                                    <Link href={`/produit/${product.id}`} target="_blank">
                                        <Image
                                            src={getImageUrl(product)}
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
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1">
                                        <Link 
                                            href={`/produit/${product.id}`} 
                                            target="_blank"
                                            className="font-medium text-sm hover:underline line-clamp-2"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium whitespace-nowrap">
                                        {product.price.toLocaleString('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground text-xs">Catégorie</span>
                                <p>{getCategoryName(product.category_id)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Marque</span>
                                <p>{getBrandName(product.brand_id)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Magasin</span>
                                <div>{getStoreTypeBadge(product.store_type)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Stock</span>
                                <div>{getStockStatus(product)}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">SKU</span>
                                <p className="truncate">{product.sku || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Variantes</span>
                                <p>{product.variants?.length || 0} variante{product.variants?.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Résumé des variantes */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-muted-foreground text-xs">Détails des variantes</span>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Couleurs:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Array.from(new Set(product.variants.map(v => v.color))).map(color => (
                                                <Badge key={color} variant="outline" className="text-[10px]">
                                                    {color}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tailles:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Array.from(new Set(product.variants.map(v => v.size))).map(size => (
                                                <Badge key={size} variant="outline" className="text-[10px]">
                                                    {size}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Stock par variante:</span>
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                            {product.variants.map(variant => (
                                                <div key={`${variant.color}-${variant.size}`} className="flex items-center gap-1 text-[10px]">
                                                    <span className="truncate">{variant.color} - {variant.size}:</span>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={variant.stock === 0 ? "bg-red-500/15 text-red-500" : variant.stock < 5 ? "bg-yellow-500/15 text-yellow-500" : "bg-green-500/15 text-green-500"}
                                                    >
                                                        {variant.stock}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Badges et statuts */}
                        <div className="flex flex-wrap gap-2">
                            {product.featured && (
                                <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-500">
                                    <Star className="w-3 h-3 mr-1" />
                                    Mis en avant
                                </Badge>
                            )}
                            {product.new && (
                                <Badge variant="secondary" className="bg-green-500/15 text-green-500">
                                    Nouveau
                                </Badge>
                            )}
                            {!product.active && (
                                <Badge variant="secondary" className="bg-red-500/15 text-red-500">
                                    Non publié
                                </Badge>
                            )}
                            {product.old_price && product.old_price > product.price && (
                                <Badge variant="secondary" className="bg-purple-500/15 text-purple-500">
                                    Promo
                                </Badge>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditProduct(product)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Éditer
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Modifier le produit</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Supprimer
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Supprimer le produit</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link 
                                            href={`/produit/${product.id}`}
                                            target="_blank"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Voir le produit</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default ProductTable

