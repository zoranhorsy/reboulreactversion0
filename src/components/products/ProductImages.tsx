import { useState } from 'react'
import { Package, ImageOff, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface ProductImagesProps {
  product: Product
  size?: "sm" | "md" | "lg"
}

const getValidImages = (product: Product): (string | File | Blob)[] => {
    // D'abord vérifier le tableau d'images
    if (Array.isArray(product.images) && product.images.length > 0) {
        const validImages = product.images.filter(img => {
            if (typeof img === 'string') {
                return img && img.trim() !== ""
            }
            return img instanceof File || img instanceof Blob
        })
        if (validImages.length > 0) return validImages
    }
    // Si pas d'images dans le tableau, on utilise image_url comme fallback
    if (product.image_url && product.image_url.trim() !== "") {
        return [product.image_url]
    }
    // Si pas d'image_url, on utilise image comme dernier recours
    if (product.image && product.image.trim() !== "") {
        return [product.image]
    }
    // Si aucune image valide n'est trouvée, retourner un tableau vide
    return []
}

const getImageUrl = (image: string | File | Blob): string => {
    if (typeof image === 'string') {
        // Log pour debugging
        console.log('Image URL originale:', image);
        
        // Si c'est déjà une URL complète
        if (image.startsWith('http')) {
            console.log('URL complète retournée:', image);
            return image;
        }
        
        // Construire l'URL complète
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reboul-store-api-production.up.railway.app';
        
        // Nettoyer le chemin d'image
        const cleanPath = image.startsWith('/') ? image.slice(1) : image;
        const fullUrl = `${baseUrl}/${cleanPath}`;
            
        console.log('URL complète construite:', fullUrl);
        return fullUrl;
    }
    
    // Pour les fichiers/blobs
    const objectUrl = URL.createObjectURL(image);
    console.log('URL d\'objet créée:', objectUrl);
    return objectUrl;
}

export function ProductImages({ product, size = "lg" }: ProductImagesProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const validImages = getValidImages(product)
    const hasMultipleImages = validImages.length > 1

    if (validImages.length === 0) {
        return (
            <div className={cn(
                "relative aspect-[3/4] bg-muted rounded-lg overflow-hidden",
                size === "sm" && "max-w-[200px]",
                size === "md" && "max-w-[300px]",
                size === "lg" && "max-w-[400px]"
            )}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "relative",
            size === "sm" && "max-w-[200px]",
            size === "md" && "max-w-[300px]",
            size === "lg" && "max-w-[400px]"
        )}>
            {/* Image principale */}
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
                <Image
                    src={getImageUrl(validImages[currentImage])}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes={cn(
                        size === "sm" && "(max-width: 768px) 100vw, 200px",
                        size === "md" && "(max-width: 768px) 100vw, 300px",
                        size === "lg" && "(max-width: 768px) 100vw, 400px"
                    )}
                    priority
                    quality={90}
                    onClick={() => setIsFullscreen(true)}
                />

                {/* Overlay avec boutons de navigation */}
                {hasMultipleImages && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white 
                                    dark:bg-black/50 dark:hover:bg-black/70
                                    shadow-lg transform hover:scale-105 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImage(prev => prev > 0 ? prev - 1 : validImages.length - 1)
                                }}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                                {currentImage + 1} / {validImages.length}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white 
                                    dark:bg-black/50 dark:hover:bg-black/70
                                    shadow-lg transform hover:scale-105 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImage(prev => prev < validImages.length - 1 ? prev + 1 : 0)
                                }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Miniatures */}
            {hasMultipleImages && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {validImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={cn(
                                "relative aspect-[3/4] rounded-md overflow-hidden",
                                currentImage === index ? "ring-2 ring-primary" : "hover:ring-1 ring-primary/50",
                                "transition-all duration-200"
                            )}
                        >
                            <Image
                                src={getImageUrl(image)}
                                alt={`${product.name} - Vue ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Modal plein écran */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
                    <div className="relative w-full h-[90vh]">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 z-50 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full h-full">
                            <Image
                                src={getImageUrl(validImages[currentImage])}
                                alt={product.name}
                                fill
                                className="object-contain"
                                quality={100}
                            />
                        </div>

                        {hasMultipleImages && (
                            <>
                                <button
                                    onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : validImages.length - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={() => setCurrentImage(prev => prev < validImages.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>

                                {/* Miniatures en bas */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <div className="flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                                        {validImages.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImage(index)}
                                                className={cn(
                                                    "relative w-16 aspect-[4/3] rounded-lg overflow-hidden",
                                                    currentImage === index 
                                                        ? 'ring-2 ring-white scale-95' 
                                                        : 'hover:ring-1 ring-white/50 hover:scale-105',
                                                    "transition-all duration-200"
                                                )}
                                            >
                                                <Image
                                                    src={getImageUrl(image)}
                                                    alt={`${product.name} - Miniature ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 