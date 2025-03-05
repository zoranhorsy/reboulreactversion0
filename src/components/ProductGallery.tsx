'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ImageOff, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/lib/types/product-image"
import { Badge } from "@/components/ui/badge"

interface ProductGalleryProps {
    images: (string | File | Blob | ProductImage)[]
    productName: string
    brand?: string
    isNew?: boolean
    isFeatured?: boolean
    discount?: number
}

export function ProductGallery({ 
    images, 
    productName, 
    brand, 
    isNew = false, 
    isFeatured = false,
    discount
}: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [showControls, setShowControls] = useState(true)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    
    const mainImageRef = useRef<HTMLDivElement>(null)
    const thumbnailsContainerRef = useRef<HTMLDivElement>(null)
    
    // Filtrer les images valides (non en erreur)
    const validImages = images.filter((_, index) => !imageErrors[index])
    
    // Log pour déboguer les images
    useEffect(() => {
        console.log('ProductGallery - Images reçues:', images);
        console.log('ProductGallery - Nombre d\'images:', images.length);
        
        // Vérifier chaque image
        images.forEach((image, index) => {
            console.log(`Image ${index}:`, typeof image, image);
            
            // Tester l'URL de l'image
            const url = getImageUrl(image);
            console.log(`URL de l'image ${index}:`, url);
        });
    }, [images]);
    
    // Masquer les contrôles après un délai d'inactivité
    useEffect(() => {
        if (isFullscreen) {
            const timer = setTimeout(() => {
                setShowControls(false)
            }, 3000)
            
            return () => clearTimeout(timer)
        }
    }, [isFullscreen, zoomPosition])
    
    // Réactiver les contrôles lors du mouvement de la souris
    const handleMouseMove = () => {
        setShowControls(true)
    }
    
    // Gestion du swipe sur mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX)
    }
    
    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }
    
    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 100) {
            // Swipe gauche -> image suivante
            handleNext()
        }
        
        if (touchStart - touchEnd < -100) {
            // Swipe droite -> image précédente
            handlePrevious()
        }
    }
    
    // Faire défiler les miniatures pour que la miniature active soit visible
    useEffect(() => {
        if (thumbnailsContainerRef.current) {
            const container = thumbnailsContainerRef.current
            const activeThumb = container.querySelector(`[data-index="${currentIndex}"]`) as HTMLElement
            
            if (activeThumb) {
                const containerWidth = container.offsetWidth
                const thumbLeft = activeThumb.offsetLeft
                const thumbWidth = activeThumb.offsetWidth
                
                // Calculer la position de défilement idéale
                const scrollPosition = thumbLeft - (containerWidth / 2) + (thumbWidth / 2)
                
                container.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                })
            }
        }
    }, [currentIndex])

    // Si aucune image n'est disponible, afficher un placeholder
    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full bg-muted/20 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Aucune image disponible</span>
            </div>
        )
    }

    const getImageUrl = (image: string | File | Blob | ProductImage): string => {
        // Fonction pour vérifier si une URL est valide
        const isValidUrl = (url: string): boolean => {
            if (!url) return false;
            // Vérifier si c'est une URL absolue
            if (url.startsWith('http://') || url.startsWith('https://')) return true;
            // Vérifier si c'est une URL relative
            if (url.startsWith('/')) return true;
            return false;
        };
        
        // Log pour déboguer
        console.log('getImageUrl - Type d\'image:', typeof image);
        
        try {
            // Vérifier si c'est un objet ProductImage
            if (typeof image === 'object' && image !== null && 'url' in image && 'publicId' in image) {
                const url = image.url;
                console.log('ProductImage détecté, URL:', url);
                if (isValidUrl(url)) return url;
            }
            // Vérifier si c'est une chaîne de caractères
            else if (typeof image === 'string') {
                console.log('String détecté:', image);
                if (isValidUrl(image)) return image;
            }
            // Vérifier si c'est un File ou Blob
            else if (image instanceof File || image instanceof Blob) {
                console.log('File/Blob détecté');
                return URL.createObjectURL(image);
            }
            // Cas où l'image est un objet mais pas un ProductImage standard
            else if (typeof image === 'object' && image !== null) {
                console.log('Objet non standard détecté:', image);
                // Essayer de trouver une propriété URL
                if ('url' in image) {
                    const url = (image as any).url;
                    console.log('URL trouvée dans l\'objet:', url);
                    if (typeof url === 'string' && isValidUrl(url)) return url;
                }
                // Essayer de trouver d'autres propriétés qui pourraient contenir une URL
                const possibleUrlProps = ['src', 'source', 'path', 'href'];
                for (const prop of possibleUrlProps) {
                    if (prop in image) {
                        const url = (image as any)[prop];
                        console.log(`Propriété ${prop} trouvée:`, url);
                        if (typeof url === 'string' && isValidUrl(url)) return url;
                    }
                }
            }
        } catch (error) {
            console.error('Erreur dans getImageUrl:', error);
        }
        
        console.log('Aucune URL valide trouvée, utilisation du placeholder');
        return "/placeholder.png";
    }

    const handleImageError = (index: number) => {
        setImageErrors(prev => ({
            ...prev,
            [index]: true
        }));
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const toggleZoom = () => {
        setIsZoomed((prev) => !prev)
    }
    
    const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !mainImageRef.current) return;
        
        const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        
        setZoomPosition({ x, y });
    }
    
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (isZoomed) setIsZoomed(false);
    }

    return (
        <>
            <div className="space-y-6">
                {/* Carousel principal */}
                <div className="relative overflow-hidden rounded-xl bg-background">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {brand && (
                            <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium tracking-wider bg-white/90 text-black">
                                {brand}
                            </Badge>
                        )}
                        {isNew && (
                            <Badge variant="default" className="px-3 py-1.5 text-xs font-medium tracking-wider bg-blue-500 text-white">
                                Nouveau
                            </Badge>
                        )}
                        {isFeatured && (
                            <Badge variant="default" className="px-3 py-1.5 text-xs font-medium tracking-wider bg-amber-500 text-white">
                                Vedette
                            </Badge>
                        )}
                        {discount && discount > 0 && (
                            <Badge variant="destructive" className="px-3 py-1.5 text-xs font-medium tracking-wider">
                                -{discount}%
                            </Badge>
                        )}
                    </div>
                    
                    {/* Bouton plein écran */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white/90 text-black"
                        onClick={toggleFullscreen}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    
                    {/* Carousel d'images */}
                    <div 
                        className="relative aspect-square overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div 
                            ref={mainImageRef}
                            className={cn(
                                "relative w-full h-full",
                                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                            )}
                            onClick={toggleZoom}
                            onMouseMove={handleZoomMove}
                        >
                            <AnimatePresence initial={false} mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0"
                                >
                                    {imageErrors[currentIndex] ? (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <ImageOff className="w-12 h-12 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <Image
                                            src={getImageUrl(images[currentIndex])}
                                            alt={`${productName} - Image ${currentIndex + 1}`}
                                            fill={true}
                                            priority={true}
                                            className={cn(
                                                "object-cover transition-all duration-300",
                                                isZoomed ? "scale-[2.5]" : "scale-100"
                                            )}
                                            style={
                                                isZoomed 
                                                    ? { 
                                                        transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                                                    } 
                                                    : {}
                                            }
                                            onError={() => handleImageError(currentIndex)}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {/* Indicateur de position */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                        
                        {/* Boutons de navigation */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black rounded-full h-10 w-10 shadow-md"
                                    onClick={handlePrevious}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black rounded-full h-10 w-10 shadow-md"
                                    onClick={handleNext}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Miniatures en carousel */}
                {images.length > 1 && (
                    <div className="relative px-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10 rounded-full h-8 w-8 shadow-sm"
                            onClick={handlePrevious}
                            disabled={images.length <= 5}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div 
                            ref={thumbnailsContainerRef}
                            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                        >
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    data-index={index}
                                    className={cn(
                                        "relative min-w-[80px] aspect-square overflow-hidden rounded-lg transition-all duration-200 flex-shrink-0",
                                        currentIndex === index 
                                            ? "ring-2 ring-primary scale-95" 
                                            : "ring-1 ring-muted-foreground/10 hover:ring-primary/50 hover:scale-95"
                                    )}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    {imageErrors[index] ? (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <ImageOff className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={getImageUrl(image)}
                                                alt={`${productName} - Miniature ${index + 1}`}
                                                fill={true}
                                                className="object-cover"
                                                onError={() => handleImageError(index)}
                                            />
                                        </div>
                                    )}
                                    {currentIndex === index && (
                                        <div className="absolute inset-0 bg-primary/10 border border-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 z-10 rounded-full h-8 w-8 shadow-sm"
                            onClick={handleNext}
                            disabled={images.length <= 5}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Fullscreen modal */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
                    <div 
                        className="relative w-full h-[90vh]"
                        onMouseMove={handleMouseMove}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <AnimatePresence>
                            {showControls && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent"
                                >
                                    <div className="text-white text-lg font-medium">
                                        {productName}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                                            onClick={toggleZoom}
                                        >
                                            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                                            onClick={() => setIsFullscreen(false)}
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div 
                            className="relative w-full h-full"
                            onClick={toggleZoom}
                            onMouseMove={handleZoomMove}
                        >
                            <AnimatePresence initial={false} mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0"
                                >
                                    {imageErrors[currentIndex] ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageOff className="w-16 h-16 text-white/70" />
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={getImageUrl(images[currentIndex])}
                                                alt={`${productName} - Image ${currentIndex + 1}`}
                                                fill={true}
                                                className={cn(
                                                    "object-contain transition-all duration-300",
                                                    isZoomed ? "scale-[2]" : "scale-100"
                                                )}
                                                style={
                                                    isZoomed 
                                                        ? { 
                                                            transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                                                        } 
                                                        : {}
                                                }
                                                quality={100}
                                                onError={() => handleImageError(currentIndex)}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {showControls && images.length > 1 && (
                                <>
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onClick={handlePrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                            bg-white/10 hover:bg-white/20 text-white
                                            transform hover:scale-105 transition-all"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                            bg-white/10 hover:bg-white/20 text-white
                                            transform hover:scale-105 transition-all"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </motion.button>

                                    {/* Thumbnails at bottom */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2"
                                    >
                                        <div className="flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm overflow-x-auto max-w-[80vw]">
                                            {images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentIndex(index)}
                                                    className={`
                                                        relative w-16 aspect-[4/3] rounded-lg overflow-hidden
                                                        ${currentIndex === index 
                                                            ? 'ring-2 ring-white scale-95' 
                                                            : 'hover:ring-1 ring-white/50 hover:scale-105'}
                                                        transition-all duration-200
                                                    `}
                                                >
                                                    {imageErrors[index] ? (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageOff className="w-4 h-4 text-white/70" />
                                                        </div>
                                                    ) : (
                                                        <Image
                                                            src={getImageUrl(image)}
                                                            alt={`${productName} - Miniature ${index + 1}`}
                                                            fill={true}
                                                            className="object-cover"
                                                            sizes="64px"
                                                            onError={() => handleImageError(index)}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

