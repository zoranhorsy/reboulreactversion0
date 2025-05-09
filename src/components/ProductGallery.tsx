'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ImageOff, ZoomIn, ZoomOut, Maximize2, Expand } from 'lucide-react'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
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
import { OptimizedImage } from './optimized/OptimizedImage'
import { Loader2 } from 'lucide-react'
import { useImageWorker } from '@/hooks/useImageWorker'
import { rafThrottle } from '@/lib/utils'

declare global {
    interface Window {
        Image: {
            new(width?: number, height?: number): HTMLImageElement;
        }
    }
}

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
    const [zoomPosition, setZoomPosition] = useState({ x: 0.5, y: 0.5 })
    const [showControls, setShowControls] = useState(true)
    const [touchStart, setTouchStart] = useState(0)
    const [touchEnd, setTouchEnd] = useState(0)
    const [api, setApi] = useState<CarouselApi>()
    const [showZoomPreview, setShowZoomPreview] = useState(false)
    const [zoomedImage, setZoomedImage] = useState<string | null>(null)
    const [fullscreenLoading, setFullscreenLoading] = useState(true)
    
    const mainImageRef = useRef<HTMLDivElement>(null)
    const thumbnailsContainerRef = useRef<HTMLDivElement>(null)
    
    // Utiliser le worker pour le traitement des images
    const { processedImage, error, isProcessing, processImage } = useImageWorker({
        width: 1200,
        height: 1200,
        quality: 85,
        format: 'webp'
    });

    // Fonction pour charger et traiter l'image
    const loadAndProcessImage = useCallback(async (imageUrl: string) => {
        try {
            const img = new window.Image(0, 0);
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                processImage(imageData);
            };
            
            img.src = imageUrl;
        } catch (err) {
            console.error('Erreur lors du chargement de l\'image:', err);
        }
    }, [processImage]);

    // Charger l'image courante
    useEffect(() => {
        if (images[currentIndex]) {
            loadAndProcessImage(getImageUrl(images[currentIndex]));
        }
    }, [currentIndex, images, loadAndProcessImage]);
    
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
    
    // Réactiver les contrôles lors du mouvement de la souris - Version originale
    const handleMouseMoveOriginal = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!showZoomPreview) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        setZoomPosition({ x, y })
    }
    
    // Version optimisée avec rafThrottle pour éviter le blocage du thread principal
    const handleMouseMove = rafThrottle((e: React.MouseEvent<HTMLDivElement>) => {
        if (!showZoomPreview) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        setZoomPosition({ x, y })
        setShowControls(true)
    })
    
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
        if (!image) return '/placeholder.svg'; // Retourne une image par défaut si l'image est null ou undefined
        
        if (typeof image === 'string') {
            // Vérifier si la chaîne est vide ou contient seulement des espaces
            return image.trim() ? image : '/placeholder.svg';
        }
        
        if (typeof image === 'object' && image !== null && 'url' in image) {
            const url = image.url;
            // Vérifier si l'URL est vide ou contient seulement des espaces
            return url && url.trim() ? url : '/placeholder.svg';
        }
        
        if (image instanceof File || image instanceof Blob) {
            return URL.createObjectURL(image);
        }
        
        return '/placeholder.svg'; // Fallback par défaut
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
                                    <OptimizedImage
                                        src={getImageUrl(image)}
                                        alt={`${productName} - Image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                        isLCP={index === 0}
                                        priority={index === 0}
                                        quality={index === 0 ? 85 : 75}
                                        showPlaceholder={true}
                                        loadingClassName="blur-sm"
                                        loadedClassName="blur-0"
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
                <DialogContent className="max-w-7xl w-screen h-screen flex items-center justify-center p-0 sm:p-6 overflow-hidden">
                    <div className="relative w-full h-full">
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex flex-col"
                            >
                                <div className="flex-1 relative">
                                    {isProcessing ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                                        </div>
                                    ) : error ? (
                                        <div className="w-full h-full flex items-center justify-center text-red-500">
                                            Erreur de chargement de l&apos;image
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <OptimizedImage
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
                                                quality={85}
                                                onError={() => handleImageError(currentIndex)}
                                                showPlaceholder={true}
                                                loadingClassName="blur-sm"
                                                loadedClassName="blur-0"
                                            />
                                        </div>
                                    )}
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

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.3 }}
                                                className="py-4 px-2"
                                            >
                                                <div className="flex overflow-x-auto space-x-2 pb-2">
                                                    {images.map((image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                setCurrentIndex(index);
                                                                api?.scrollTo(index);
                                                            }}
                                                            className={cn(
                                                                "relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                                                                currentIndex === index 
                                                                    ? "border-primary" 
                                                                    : "border-transparent hover:border-primary/50"
                                                            )}
                                                        >
                                                            {imageErrors[index] ? (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <ImageOff className="w-4 h-4 text-white/70" />
                                                                </div>
                                                            ) : (
                                                                <OptimizedImage
                                                                    src={getImageUrl(image)}
                                                                    alt={`${productName} - Miniature ${index + 1}`}
                                                                    fill={true}
                                                                    className="object-cover"
                                                                    sizes="64px"
                                                                    onError={() => handleImageError(index)}
                                                                    quality={60}
                                                                    showPlaceholder={true}
                                                                />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

