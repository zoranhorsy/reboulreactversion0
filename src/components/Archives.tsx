'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Store, Camera, PartyPopper, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface Archive {
    id: number
    title: string
    description: string
    category: 'store' | 'shooting' | 'event'
    image_paths: string[]
    date: string
    active: boolean
    display_order: number
}

const CATEGORIES = [
    { id: 'all', label: 'Tout', icon: Camera },
    { id: 'store', label: 'Boutique', icon: Store },
    { id: 'shooting', label: 'Shootings', icon: Camera },
    { id: 'event', label: 'Événements', icon: PartyPopper }
] as const

const getImageUrl = (path: string): string => {
    if (!path) return '/placeholder.png'
    
    // Si c'est déjà une URL Cloudinary, la retourner telle quelle
    if (path.includes('cloudinary.com')) {
        return path
    }
    
    const RAILWAY_BASE_URL = 'https://reboul-store-api-production.up.railway.app'
    
    // Si c'est une URL localhost, la convertir en URL Railway
    if (path.includes('localhost:5001')) {
        const parts = path.split('localhost:5001')
        return `${RAILWAY_BASE_URL}${parts[1]}`
    }
    
    // Si c'est déjà une URL complète (non-localhost)
    if (path.startsWith('http')) {
        return path
    }
    
    // Pour les chemins relatifs
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${RAILWAY_BASE_URL}${cleanPath}`
}

export function Archives() {
    const [archives, setArchives] = useState<Archive[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState<Archive | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const carouselRef = useRef<HTMLDivElement>(null)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    // Charger les archives depuis l'API
    useEffect(() => {
        const loadArchives = async () => {
            try {
                setIsLoading(true);
                console.log('Chargement des archives...');
                const response = await api.fetchArchives();
                console.log('Réponse des archives:', response);
                setArchives(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error('Erreur lors du chargement des archives:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadArchives();
    }, []);

    const filteredItems = archives.filter(
        item => selectedCategory === 'all' || item.category === selectedCategory
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Reset current index when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory]);

    const goToNext = useCallback(() => {
        if (filteredItems.length === 0) return;
        setCurrentIndex(prev => (prev + 1) % filteredItems.length);
    }, [filteredItems]);

    const goToPrevious = useCallback(() => {
        if (filteredItems.length === 0) return;
        setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    }, [filteredItems]);

    const handleLightboxPreviousImage = useCallback(() => {
        if (!selectedImage) return
        const currentIdx = filteredItems.findIndex(item => item.id === selectedImage.id)
        const newIndex = currentIdx > 0 ? currentIdx - 1 : filteredItems.length - 1
        setSelectedImage(filteredItems[newIndex])
    }, [selectedImage, filteredItems])

    const handleLightboxNextImage = useCallback(() => {
        if (!selectedImage) return
        const currentIdx = filteredItems.findIndex(item => item.id === selectedImage.id)
        const newIndex = currentIdx < filteredItems.length - 1 ? currentIdx + 1 : 0
        setSelectedImage(filteredItems[newIndex])
    }, [selectedImage, filteredItems])

    // Handle touch events for swiping
    const [touchStart, setTouchStart] = useState(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        
        // Swipe threshold (px)
        const threshold = 50;
        
        if (diff > threshold) {
            goToNext();
        } else if (diff < -threshold) {
            goToPrevious();
        }
    };

    // Réinitialiser l'index quand on ouvre le modal
    useEffect(() => {
        if (selectedImage) {
            setSelectedImageIndex(0);
        }
    }, [selectedImage]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        )
    }

    if (archives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] py-8 text-center px-4">
                <Camera className="w-10 h-10 mb-3 text-muted-foreground" />
                <h3 className="text-base font-medium sm:text-lg">Aucune archive disponible</h3>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Les archives seront bientôt disponibles.
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
            {/* Titre et description */}
            <motion.div 
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                    Nos Archives
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    Découvrez l&apos;univers REBOUL à travers notre galerie de photos
                </p>
            </motion.div>

            {/* Filtres */}
            <div className="mb-8 sm:mb-12">
                <motion.div 
                    className="flex flex-wrap gap-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:justify-center sm:gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon
                        return (
                            <motion.button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg text-sm whitespace-nowrap",
                                    "flex items-center justify-center gap-2",
                                    "w-[calc(50%-4px)] sm:w-auto",
                                    "sm:px-5 sm:py-2.5 sm:rounded-full",
                                    "transition-all duration-300",
                                    selectedCategory === category.id
                                        ? "bg-white text-zinc-900 font-medium shadow-lg"
                                        : "bg-zinc-900/90 text-white border border-white/20 hover:bg-zinc-800 hover:border-white/40"
                                )}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{category.label}</span>
                            </motion.button>
                        )
                    })}
                </motion.div>
            </div>

            {/* Contenu principal */}
            <div className="space-y-6">
                {/* Carousel principal */}
                <div className="relative w-full mt-2 sm:mt-6 mb-8">
                    {filteredItems.length > 0 && (
                        <>
                            <div 
                                ref={carouselRef}
                                className="relative w-full overflow-hidden rounded-2xl"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className="relative aspect-[4/5] md:aspect-[16/9] w-full">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentIndex}
                                            initial={{ opacity: 0, x: 100 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                                            className="absolute inset-0"
                                        >
                                            <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                                                onClick={() => setSelectedImage(filteredItems[currentIndex])}>
                                                <Image
                                                    src={getImageUrl(filteredItems[currentIndex].image_paths[0])}
                                                    alt={filteredItems[currentIndex].title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="100vw"
                                                    priority
                                                    quality={95}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 text-white">
                                                        <h3 className="text-2xl sm:text-3xl font-medium mb-3 tracking-wide">{filteredItems[currentIndex].title}</h3>
                                                        <p className="text-sm sm:text-base opacity-90 mb-4 line-clamp-3">{filteredItems[currentIndex].description}</p>
                                                        <div className="flex items-center gap-2 text-sm opacity-75">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(filteredItems[currentIndex].date), 'd MMMM yyyy', { locale: fr })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Bordure intérieure avec effet de brillance */}
                                                <div className="absolute inset-[10px] rounded-xl border border-white/10 
                                                    hover:border-white/30 transition-all duration-700 ease-out z-40" />
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                
                                {/* Navigation buttons */}
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full 
                                        bg-white text-zinc-900
                                        hover:bg-zinc-100
                                        transition-colors duration-200
                                        shadow-lg"
                                    aria-label="Image précédente"
                                >
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-4 rounded-full 
                                        bg-white text-zinc-900
                                        hover:bg-zinc-100
                                        transition-colors duration-200
                                        shadow-lg"
                                    aria-label="Image suivante"
                                >
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            {/* Pagination indicators */}
                            <div className="flex justify-center gap-2 mt-6">
                                {filteredItems.slice(0, 7).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            currentIndex === idx
                                                ? "bg-primary w-6 h-2.5 shadow-sm shadow-primary/20"
                                                : "bg-zinc-300 dark:bg-zinc-700 w-2.5 h-2.5 hover:bg-zinc-400"
                                        )}
                                        aria-label={`Aller à l'image ${idx + 1}`}
                                    />
                                ))}
                                {filteredItems.length > 7 && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                )}
                            </div>
                            
                            {/* Image count indicator */}
                            <div className="absolute top-5 right-5 z-10 
                                bg-white text-zinc-900
                                text-sm py-1.5 px-4 rounded-full
                                shadow-lg">
                                {currentIndex + 1} / {filteredItems.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Vignettes - version simplifiée pour mobile */}
                {filteredItems.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 mt-4">
                        {filteredItems.slice(0, 4).map((item, index) => (
                            <div 
                                key={item.id}
                                className={cn(
                                    "relative aspect-square rounded-xl overflow-hidden cursor-pointer",
                                    "border-2 shadow-md",
                                    "transition-all duration-300 hover:scale-105",
                                    currentIndex === index 
                                        ? "border-primary shadow-primary/20" 
                                        : "border-transparent"
                                )}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <Image
                                    src={getImageUrl(item.image_paths[0])}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, 16vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        ))}
                        {filteredItems.length > 4 && (
                            <div 
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800 
                                    flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300
                                    border border-zinc-200 dark:border-zinc-700"
                                onClick={() => setSelectedImage(filteredItems[0])}
                            >
                                <div className="text-center">
                                    <p className="text-sm font-medium">+{filteredItems.length - 4}</p>
                                    <p className="text-xs mt-1">Voir tout</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal de visualisation - adapté pour mobile */}
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl p-0 overflow-hidden bg-transparent border-none mx-2 sm:mx-4">
                        {selectedImage && (
                            <motion.div 
                                className="relative aspect-square sm:aspect-[3/2] rounded-2xl overflow-hidden bg-black"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Navigation buttons in modal */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageIndex((prev) => 
                                            prev > 0 ? prev - 1 : selectedImage.image_paths.length - 1
                                        );
                                    }}
                                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full 
                                        bg-black text-white hover:bg-zinc-900
                                        transition-colors duration-200"
                                    aria-label="Image précédente"
                                >
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                {/* Close button */}
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-5 right-5 z-50 p-3 rounded-full 
                                        bg-black text-white hover:bg-zinc-900
                                        transition-colors duration-200"
                                    aria-label="Fermer"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>

                                {/* Image info */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black to-transparent">
                                    <motion.div 
                                        className="space-y-2 sm:space-y-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white">
                                                {selectedImage.title}
                                            </h2>
                                            <div className="flex items-center gap-1.5 text-white/90 bg-black/50 px-3 py-1.5 rounded-full self-start">
                                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                <span className="text-xs sm:text-sm">
                                                    {format(new Date(selectedImage.date), 'd MMM yyyy', { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-white/90 text-sm sm:text-base max-w-3xl">
                                            {selectedImage.description}
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
} 