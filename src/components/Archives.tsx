'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
    image_path: string
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
        <div className="space-y-6">
            {/* Filtres avec animation - redesign pour meilleure visibilité mobile */}
            <div className="mb-4 sm:mb-6">
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
                                    "px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all duration-300",
                                    "shadow-sm",
                                    "flex items-center justify-center gap-2",
                                    "w-[calc(50%-4px)] sm:w-auto",
                                    "sm:px-5 sm:py-2.5 sm:rounded-full",
                                    selectedCategory === category.id
                                        ? "bg-primary text-white dark:text-zinc-900 font-medium"
                                        : "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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

            {/* Carousel principal */}
            <div className="relative w-full mt-2 sm:mt-6 mb-6">
                {filteredItems.length > 0 && (
                    <>
                        <div 
                            ref={carouselRef}
                            className="relative w-full overflow-hidden rounded-lg sm:rounded-xl"
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
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0"
                                    >
                                        <div className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden cursor-pointer"
                                            onClick={() => setSelectedImage(filteredItems[currentIndex])}>
                                            <Image
                                                src={getImageUrl(filteredItems[currentIndex].image_path)}
                                                alt={filteredItems[currentIndex].title}
                                                fill
                                                className="object-cover"
                                                sizes="100vw"
                                                priority
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-95">
                                                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 text-white">
                                                    <h3 className="text-xl sm:text-2xl font-medium mb-2">{filteredItems[currentIndex].title}</h3>
                                                    <p className="text-sm sm:text-base opacity-90 mb-3 line-clamp-3">{filteredItems[currentIndex].description}</p>
                                                    <div className="flex items-center gap-2 text-sm opacity-75">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(filteredItems[currentIndex].date), 'd MMMM yyyy', { locale: fr })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            
                            {/* Navigation buttons - plus grands sur mobile */}
                            <button
                                onClick={goToPrevious}
                                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                aria-label="Image précédente"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-3 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                aria-label="Image suivante"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Pagination indicators */}
                        <div className="flex justify-center gap-1.5 mt-4">
                            {filteredItems.slice(0, 7).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        currentIndex === idx
                                            ? "bg-primary scale-100 w-4"
                                            : "bg-zinc-300 dark:bg-zinc-700 scale-90"
                                    )}
                                    aria-label={`Aller à l'image ${idx + 1}`}
                                />
                            ))}
                            {filteredItems.length > 7 && (
                                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 scale-90" />
                            )}
                        </div>
                        
                        {/* Image count indicator - amélioré pour la visibilité */}
                        <div className="absolute top-4 right-4 z-10 bg-black/70 text-white text-sm py-1.5 px-3 rounded-full">
                            {currentIndex + 1} / {filteredItems.length}
                        </div>
                    </>
                )}
            </div>

            {/* Vignettes - version simplifiée pour mobile */}
            {filteredItems.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 mt-2">
                    {filteredItems.slice(0, 4).map((item, index) => (
                        <div 
                            key={item.id}
                            className={cn(
                                "relative aspect-square rounded-md overflow-hidden cursor-pointer",
                                "border-2",
                                "shadow-sm",
                                currentIndex === index 
                                    ? "border-primary" 
                                    : "border-transparent"
                            )}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <Image
                                src={getImageUrl(item.image_path)}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 25vw, (max-width: 768px) 25vw, 16vw"
                            />
                        </div>
                    ))}
                    {filteredItems.length > 4 && (
                        <div 
                            className="relative aspect-square rounded-md overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm"
                            onClick={() => setSelectedImage(filteredItems[0])}
                        >
                            <div className="text-center">
                                <p className="text-sm font-medium">+{filteredItems.length - 4}</p>
                                <p className="text-xs">Voir tout</p>
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
                            className="relative aspect-square sm:aspect-[3/2] rounded-lg overflow-hidden bg-black"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Boutons de navigation - plus gros sur mobile pour faciliter l'interaction */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleLightboxPreviousImage()
                                }}
                                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                                aria-label="Image précédente"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleLightboxNextImage()
                                }}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                                aria-label="Image suivante"
                            >
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            {/* Bouton de fermeture */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-3 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            {/* Image */}
                            <Image
                                src={getImageUrl(selectedImage.image_path)}
                                alt={selectedImage.title}
                                fill
                                className="object-contain sm:object-cover"
                                priority
                                sizes="100vw"
                            />

                            {/* Informations - simplifié et plus compact sur mobile */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                                <motion.div 
                                    className="space-y-1 sm:space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <h2 className="text-xl sm:text-2xl font-medium text-white">
                                            {selectedImage.title}
                                        </h2>
                                        <div className="flex items-center gap-1.5 text-white/75">
                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span className="text-xs sm:text-sm">
                                                {format(new Date(selectedImage.date), 'd MMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-sm sm:text-base line-clamp-3 sm:line-clamp-none">
                                        {selectedImage.description}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Indicateurs de position */}
                            <div className="absolute top-4 left-4 z-50 bg-black/70 text-white text-xs py-1.5 px-3 rounded-full">
                                {filteredItems.findIndex(item => item.id === selectedImage.id) + 1} / {filteredItems.length}
                            </div>
                        </motion.div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 