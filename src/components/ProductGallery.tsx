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
    const validImages = images
        .map(img => {
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img !== null && 'url' in img) return img.url;
            if (img instanceof File || img instanceof Blob) return URL.createObjectURL(img);
            return null;
        })
        .filter((url): url is string => url !== null && !imageErrors[images.indexOf(url)]);
    
    // Log pour déboguer les images
    useEffect(() => {
        console.log('ProductGallery - Images reçues:', images);
        console.log('ProductGallery - Images valides:', validImages);
    }, [images, validImages]);
    
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

    // Si aucune image n'est disponible ou si toutes les images sont en erreur, afficher un placeholder
    if (!validImages.length) {
        return (
            <div className="relative aspect-square w-full bg-muted/20 rounded-lg flex flex-col items-center justify-center gap-2">
                <ImageOff className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Aucune image disponible</span>
                {productName && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                            {productName}
                        </Badge>
                    </div>
                )}
            </div>
        )
    }

    const getImageUrl = (image: string | File | Blob | ProductImage): string => {
        if (typeof image === 'string') return image;
        if (typeof image === 'object' && image !== null && 'url' in image) return image.url;
        if (image instanceof File || image instanceof Blob) return URL.createObjectURL(image);
        return '';
    };

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
                {/* Image principale */}
                <div 
                    className={cn(
                        "relative aspect-square w-full overflow-hidden rounded-lg bg-muted/20",
                        isFullscreen && "fixed inset-0 z-50 h-screen w-screen rounded-none bg-background/95 backdrop-blur-sm"
                    )}
                    ref={mainImageRef}
                    onMouseMove={handleZoomMove}
                    onMouseLeave={() => setIsZoomed(false)}
                >
                    {validImages[currentIndex] && (
                        <Image
                            src={validImages[currentIndex]}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            fill
                            priority={currentIndex === 0}
                            className={cn(
                                "object-cover transition-all duration-300",
                                isZoomed && "scale-150"
                            )}
                            style={
                                isZoomed
                                    ? {
                                          transformOrigin: `${zoomPosition.x * 100}% ${
                                              zoomPosition.y * 100
                                          }%`,
                                      }
                                    : undefined
                            }
                            onError={() => handleImageError(currentIndex)}
                        />
                    )}

                    {/* Miniatures */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div 
                            className="flex gap-2 overflow-x-auto px-4 pb-2 max-w-[calc(100vw-2rem)]"
                            ref={thumbnailsContainerRef}
                        >
                            {validImages.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2",
                                        currentIndex === index
                                            ? "border-primary"
                                            : "border-transparent hover:border-primary/50"
                                    )}
                                    data-index={index}
                                >
                                    <Image
                                        src={imgUrl}
                                        alt={`${productName} - Miniature ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        onError={() => handleImageError(index)}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
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

