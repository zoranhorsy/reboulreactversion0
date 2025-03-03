'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X, Store, Camera, PartyPopper, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

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
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`
}

const ARCHIVES = [
    {
        id: 'store-front',
        title: 'Notre boutique',
        description: 'La façade emblématique de REBOUL',
        image: '/archives/store-front.jpg',
        size: 'large'
    },
    {
        id: 'vintage-collection',
        title: 'Collection vintage',
        description: 'Les pièces qui ont marqué notre histoire',
        image: '/archives/vintage.jpg',
        size: 'small'
    },
    {
        id: 'events',
        title: 'Événements',
        description: 'Les moments forts de la boutique',
        image: '/archives/events.jpg',
        size: 'small'
    },
    {
        id: 'team',
        title: 'Notre équipe',
        description: 'Les passionnés qui font REBOUL',
        image: '/archives/team.jpg',
        size: 'medium'
    }
]

export function Archives() {
    const [archives, setArchives] = useState<Archive[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState<Archive | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

    const handlePreviousImage = useCallback(() => {
        if (!selectedImage) return
        const currentIndex = archives.findIndex(item => item.id === selectedImage.id)
        const newIndex = currentIndex > 0 ? currentIndex - 1 : archives.length - 1
        setSelectedImage(archives[newIndex])
        setCurrentImageIndex(newIndex)
    }, [selectedImage, archives])

    const handleNextImage = useCallback(() => {
        if (!selectedImage) return
        const currentIndex = archives.findIndex(item => item.id === selectedImage.id)
        const newIndex = currentIndex < archives.length - 1 ? currentIndex + 1 : 0
        setSelectedImage(archives[newIndex])
        setCurrentImageIndex(newIndex)
    }, [selectedImage, archives])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (archives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Camera className="w-12 h-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Aucune archive disponible</h3>
                <p className="text-muted-foreground">
                    Les archives seront bientôt disponibles.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Filtres avec animation */}
            <motion.div 
                className="flex flex-wrap justify-center gap-4"
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
                                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                "border-2",
                                "flex items-center gap-2",
                                "hover:scale-105 active:scale-95",
                                selectedCategory === category.id
                                    ? "border-primary bg-primary text-white dark:text-zinc-900"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-primary/50"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{category.label}</span>
                        </motion.button>
                    )
                })}
            </motion.div>

            {/* Grille d'images avec animation */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={selectedCategory}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                >
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group cursor-pointer"
                            onClick={() => {
                                setSelectedImage(item)
                                setCurrentImageIndex(index)
                            }}
                        >
                            <div className={cn(
                                "relative h-[300px] rounded-xl overflow-hidden",
                                "ring-2 ring-transparent",
                                "group-hover:ring-primary/50",
                                "transition-all duration-300"
                            )}>
                                <Image
                                    src={getImageUrl(item.image_path)}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={index < 6}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                                        <p className="text-sm opacity-90 mb-2 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-2 text-xs opacity-75">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(item.date), 'MMMM yyyy', { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Modal de visualisation amélioré */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-none">
                    {selectedImage && (
                        <motion.div 
                            className="relative aspect-[3/2] rounded-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Boutons de navigation */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePreviousImage()
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleNextImage()
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Bouton de fermeture */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Image */}
                            <Image
                                src={getImageUrl(selectedImage.image_path)}
                                alt={selectedImage.title}
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Informations */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                <motion.div 
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-medium text-white">
                                            {selectedImage.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-white/75">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {format(new Date(selectedImage.date), 'dd MMMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-base">
                                        {selectedImage.description}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Indicateurs de navigation */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {archives.map((_, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            currentImageIndex === index
                                                ? "bg-white scale-100"
                                                : "bg-white/50 scale-75"
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
} 