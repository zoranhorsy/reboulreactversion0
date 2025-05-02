'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ImageOff, ZoomIn, ZoomOut, Maximize2, Expand } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/lib/types/product-image"
import { Badge } from "@/components/ui/badge"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  CarouselApi
} from '@/components/ui/carousel'

interface ProductGalleryProps {
    images: (string | File | Blob | ProductImage)[]
    productName: string
    brand?: string
    isNew?: boolean
    isFeatured?: boolean
    discount?: number
    aspectRatio?: 'square' | 'portrait' | 'landscape'
    className?: string
}

export function ProductGallery({ 
    images, 
    productName, 
    brand, 
    isNew = false, 
    isFeatured = false,
    discount,
    aspectRatio = 'square',
    className
}: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [showControls, setShowControls] = useState(true)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [api, setApi] = useState<CarouselApi>()
    const [showZoomPreview, setShowZoomPreview] = useState(false)
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)
    
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
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!showZoomPreview) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        setZoomPosition({ x, y })
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

    const calculateAspectRatio = () => {
        switch (aspectRatio) {
            case 'portrait':
                return 'aspect-[3/4]'
            case 'landscape':
                return 'aspect-[4/3]'
            case 'square':
            default:
                return 'aspect-square'
        }
    }

    // Effet pour gérer l'API du carousel
    useEffect(() => {
        if (!api) {
            return
        }

        setCurrentIndex(api.selectedScrollSnap() || 0)

        api.on('select', () => {
            setCurrentIndex(api.selectedScrollSnap() || 0)
        })
    }, [api])

    const handleImageClick = (imageUrl: string) => {
        setZoomedImage(imageUrl)
    }

    // Afficher un placeholder si aucune image valide
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

    return (
        <>
            <div className={cn('space-y-4', className)}>
                {/* Main Image Carousel */}
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div 
                                    className={cn(
                                        'relative overflow-hidden rounded-xl border border-border/40',
                                        calculateAspectRatio()
                                    )}
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onMouseMove={handleMouseMove}
                                >
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`${productName} - Image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                    {isZoomed && (
                                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        variant="secondary" 
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                                        onClick={() => handleImageClick(getImageUrl(image))}
                                                    >
                                                        <Expand className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl">
                                                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                                                        <Image
                                                            src={getImageUrl(image)}
                                                            alt={`${productName} - Image ${index + 1}`}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                                        <Button variant="ghost" size="icon">
                                                            <span>×</span>
                                                            <span className="sr-only">Close</span>
                                                        </Button>
                                                    </DialogClose>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    )}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                        <CarouselPrevious className="h-10 w-10 bg-background border shadow-md" />
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                        <CarouselNext className="h-10 w-10 bg-background border shadow-md" />
                    </div>
                </Carousel>

                {/* Thumbnails */}
                <div className="flex overflow-x-auto space-x-2 pb-1">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={cn(
                                'relative rounded-md overflow-hidden border-2 flex-shrink-0 w-16 h-16 cursor-pointer transition-all duration-200',
                                currentIndex === index 
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/50'
                            )}
                            onClick={() => api?.scrollTo(index)}
                        >
                            <Image
                                src={getImageUrl(image)}
                                alt={`${productName} - Miniature ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 64px, 64px"
                                className={cn(
                                    'object-cover transition-opacity duration-300',
                                    currentIndex !== index && 'group-hover:opacity-75'
                                )}
                            />
                        </button>
                    ))}
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
                                                    onClick={() => api?.scrollTo(index)}
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

