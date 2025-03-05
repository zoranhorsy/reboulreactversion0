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
    const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

    useEffect(() => {
        const newDebugInfo: Record<string, any> = {};
        
        filteredProducts.forEach(product => {
            if (product.images && product.images.length > 0) {
                const firstImage = product.images[0];
                newDebugInfo[`product_${product.id}`] = {
                    id: product.id,
                    name: product.name,
                    imageType: typeof firstImage,
                    isProductImage: typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage,
                    imageUrl: typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage 
                        ? (firstImage as ProductImage).url 
                        : (typeof firstImage === 'string' ? firstImage : 'non-string'),
                    hasError: imageErrors[product.id] || false
                };
            } else {
                newDebugInfo[`product_${product.id}`] = {
                    id: product.id,
                    name: product.name,
                    imageType: 'none',
                    hasImage: !!product.image || !!product.image_url,
                    imageUrl: product.image || product.image_url || 'none',
                    hasError: imageErrors[product.id] || false
                };
            }
        });
        
        setDebugInfo(newDebugInfo);
    }, [filteredProducts, imageErrors]);

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
        try {
            // 1. Vérifier d'abord les images[] car elles sont toujours en Cloudinary
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                const firstImage = product.images[0];
                
                // Si c'est une string et que c'est une URL Cloudinary
                if (typeof firstImage === 'string' && firstImage.includes('cloudinary.com')) {
                    console.log('URL Cloudinary trouvée dans images[]:', firstImage);
                    return firstImage;
                }
                
                // Si c'est un objet ProductImage avec une URL Cloudinary
                if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
                    const imageUrl = (firstImage as ProductImage).url;
                    if (imageUrl.includes('cloudinary.com')) {
                        console.log('URL Cloudinary trouvée dans ProductImage:', imageUrl);
                        return imageUrl;
                    }
                }
            }

            // 2. Si pas d'URL Cloudinary dans images[], vérifier image_url
            if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim() !== '') {
                if (product.image_url.includes('cloudinary.com')) {
                    console.log('URL Cloudinary trouvée dans image_url:', product.image_url);
                    return product.image_url;
                }
                console.log('URL non-Cloudinary trouvée dans image_url:', product.image_url);
            }

            console.log('Aucune URL Cloudinary trouvée pour le produit:', product.id);
            return "/placeholder.png";
        } catch (error) {
            console.error("Erreur lors de la récupération de l'URL de l'image:", error);
            return "/placeholder.png";
        }
    }

    const handleImageError = (productId: string) => {
        try {
            console.error(`Erreur de chargement de l'image pour le produit ${productId}`);
            
            // Mettre à jour l'état pour afficher un placeholder
            setImageErrors(prev => ({
                ...prev,
                [productId]: true
            }));
        } catch (error) {
            console.error("Erreur lors de la gestion de l'erreur d'image:", error);
        }
    }

    return (
        <div className="rounded-md border">
            {process.env.NODE_ENV === 'development' && Object.keys(debugInfo).length > 0 && (
                <div className="p-2 bg-yellow-50 text-xs border-b">
                    <details>
                        <summary className="cursor-pointer font-medium">Informations de débogage des images</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
            
            <ScrollArea className="h-[calc(100vh-300px)]">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead className="min-w-[200px]">{renderSortableHeader("name", "Nom")}</TableHead>
                            <TableHead>{renderSortableHeader("price", "Prix")}</TableHead>
                            <TableHead>{renderSortableHeader("stock", "Stock")}</TableHead>
                            <TableHead className="min-w-[120px]">Catégorie</TableHead>
                            <TableHead className="min-w-[120px]">Marque</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center min-w-[150px]">Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    Aucun produit trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} className="group hover:bg-muted/50">
                                    <TableCell>
                                        <Link href={`/produit/${product.id}`} target="_blank">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="relative w-16 h-16 rounded-md overflow-hidden group-hover:ring-2 ring-primary transition-all bg-muted">
                                                            {imageErrors[product.id] ? (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                    <ImageOff className="w-6 h-6 text-muted-foreground" />
                                                                </div>
                                                            ) : (
                                                                <CloudinaryImage
                                                                    src={getImageUrl(product)}
                                                                    alt={product.name}
                                                                    fill={true}
                                                                    className="w-full h-full"
                                                                    onError={() => handleImageError(product.id.toString())}
                                                                    fallbackSrc="/placeholder.png"
                                                                />
                                                            )}
                                                            {process.env.NODE_ENV === 'development' && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[6px] p-0.5 overflow-hidden">
                                                                    ID: {product.id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Voir le produit</p>
                                                        {process.env.NODE_ENV === 'development' && (
                                                            <div className="mt-1 pt-1 border-t text-xs max-w-[300px] break-all">
                                                                <p className="text-[10px] text-muted-foreground">URL: {getImageUrl(product)}</p>
                                                            </div>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium line-clamp-1">{product.name}</span>
                                            <span className="text-sm text-muted-foreground line-clamp-2">
                                                {product.description}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(product.created_at || new Date().toISOString())}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.old_price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {formatPrice(product.old_price)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 min-w-[100px]">
                                            <span className="font-medium text-center">
                                                {product.variants?.reduce((total, variant) => total + (variant.stock || 0), 0) || 0}
                                            </span>
                                            {getStockStatus(product)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="justify-center w-full">
                                            {getCategoryName(product.category_id)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="justify-center w-full">
                                            {getBrandName(product.brand_id)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStoreTypeBadge(product.store_type)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-center gap-1.5">
                                            {product.featured && (
                                                <Badge variant="default" className="bg-amber-500/15 text-amber-500 w-full justify-center">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    En vedette
                                                </Badge>
                                            )}
                                            {product.variants && product.variants.length > 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge variant="outline" className="w-full justify-center">
                                                                {product.variants.length} variante(s)
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className="space-y-2">
                                                                {product.variants.map((variant, idx) => (
                                                                    <div key={idx} className="text-sm">
                                                                        {variant.color} - {variant.size} ({variant.stock} en stock)
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link href={`/produit/${product.id}`} target="_blank">
                                                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Voir le produit</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEditProduct(product)}
                                                            className="hover:text-primary"
                                                        >
                                                            <Edit className="h-4 w-4" />
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
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteProduct(Number(product.id))}
                                                            className="hover:text-destructive text-destructive/70"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Supprimer le produit</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}

export default ProductTable

