'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { toast } from '@/components/ui/use-toast'
import { Api } from '@/lib/api'

// Types pour les données de collections
interface StoreCollection {
    id: string;        // Identifiant unique de la collection
    title: string;     // Titre affiché
    image: string;     // Image de la collection
    href: string;      // Lien vers la page de la collection
    description: string; // Description courte (badge)
    tagline: string;   // Phrase d'accroche
    
    // Ces propriétés seront remplies dynamiquement
    productCount?: number;   // Nombre de produits
    newProductsCount?: number; // Nombre de nouveaux produits
    hasNewProducts?: boolean; // Si la collection a des nouveautés
}

// Données statiques des collections - correspond aux valeurs dans le champ store_type
const STORE_COLLECTIONS: StoreCollection[] = [
    {
        id: 'adult',
        title: 'REBOUL ADULTE',
        image: '/images/collections/adult-collection.jpg',
        href: '/catalogue?store_type=adult',
        description: 'COLLECTION ADULTE',
        tagline: 'Style et élégance pour tous'
    },
    {
        id: 'kids',
        title: 'LES MINOTS DE REBOUL',
        image: '/images/collections/kids-collection.jpg',
        href: '/catalogue?store_type=kids',
        description: 'COLLECTION ENFANT',
        tagline: 'Mode tendance pour les petits'
    },
    {
        id: 'sneakers',
        title: 'SNEAKERS',
        image: '/images/collections/sneakers-collection.jpg',
        href: '/catalogue?store_type=sneakers',
        description: 'ÉDITION LIMITÉE',
        tagline: 'Pour les passionnés de streetwear'
    },
    {
        id: 'cpcompany',
        title: 'THE CORNER MARSEILLE',
        image: '/images/collections/cp-company.jpg',
        href: '/the-corner',
        description: 'C.P.COMPANY',
        tagline: 'L\'exclusivité à l\'italienne'
    }
]

// Dégradés sobres pour les cartes
const CARD_GRADIENTS = [
    "from-black/50 via-black/40 to-black/60",
    "from-black/50 via-black/45 to-black/55",
    "from-black/55 via-black/45 to-black/60",
    "from-black/50 via-black/40 to-black/55"
]

export function StoreSelection() {
    const [ref, inView] = useInView({ 
        triggerOnce: true,
        threshold: 0.1
    })
    
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { 
            loop: true,
            align: 'center',
            slidesToScroll: 1,
            dragFree: true,
            containScroll: 'trimSnaps',
        }, 
        [
            Autoplay({
                delay: 6000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
                playOnInit: true
            })
        ]
    )
    
    const [selectedSlide, setSelectedSlide] = useState(0)
    const [isHovering, setIsHovering] = useState(false)
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(true)
    const [nextBtnEnabled, setNextBtnEnabled] = useState(true)
    const [collections, setCollections] = useState<StoreCollection[]>(STORE_COLLECTIONS)
    const [isLoading, setIsLoading] = useState(true)
    
    // Fonction pour charger les données des collections à partir de l'API
    const loadCollectionsData = useCallback(async () => {
        try {
            setIsLoading(true)
            
            // Utiliser l'API pour récupérer les statistiques des collections
            const api = new Api()
            const stats = await api.fetchCollectionStats()
            
            // Mettre à jour les collections avec les données récupérées
            const enrichedCollections = STORE_COLLECTIONS.map(collection => {
                const storeStats = stats[collection.id] || { total: 0, new: 0 }
                
                return {
                    ...collection,
                    productCount: storeStats.total,
                    newProductsCount: storeStats.new,
                    hasNewProducts: storeStats.new > 0
                }
            })
            
            setCollections(enrichedCollections)
        } catch (error) {
            console.error("Erreur lors du chargement des données des collections:", error)
            
            // En cas d'erreur, utiliser des données simulées
            const simulatedData = STORE_COLLECTIONS.map(collection => ({
                ...collection,
                productCount: collection.id === 'adult' ? 178 : 
                               collection.id === 'kids' ? 94 : 
                               collection.id === 'sneakers' ? 67 : 42,
                newProductsCount: collection.id === 'adult' ? 12 :
                                   collection.id === 'kids' ? 8 : 0,
                hasNewProducts: ['adult', 'kids'].includes(collection.id)
            }))
            
            setCollections(simulatedData)
            
            toast({
                title: "Information",
                description: "Chargement des données de démonstration (mode hors ligne)",
                variant: "default"
            })
        } finally {
            setIsLoading(false)
        }
    }, [])
    
    // Charger les données au montage du composant
    useEffect(() => {
        loadCollectionsData()
    }, [loadCollectionsData])
    
    // Mettre à jour l'index du slide actif lors du défilement
    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedSlide(emblaApi.selectedScrollSnap())
        setPrevBtnEnabled(emblaApi.canScrollPrev())
        setNextBtnEnabled(emblaApi.canScrollNext())
    }, [emblaApi])
    
    useEffect(() => {
        if (!emblaApi) return
        
        onSelect()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
        
        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }
    }, [emblaApi, onSelect])
    
    // Naviguer vers le slide précédent
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])
    
    // Naviguer vers le slide suivant
    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    // Récupérer le dégradé pour une carte en fonction de son index
    const getCardGradient = useCallback((index: number) => {
        return CARD_GRADIENTS[index % CARD_GRADIENTS.length]
    }, [])

    // État de chargement
    if (isLoading) {
        return (
            <section className="w-full bg-white dark:bg-zinc-950 py-12 md:py-20 lg:py-24 overflow-hidden">
                <div className="w-full max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mx-auto mb-4 animate-pulse" />
                        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md mx-auto animate-pulse" />
                    </div>
                    <div className="w-full aspect-[16/9] bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                </div>
            </section>
        )
    }

    return (
        <section 
            ref={ref} 
            className="w-full bg-white dark:bg-zinc-950 py-12 md:py-20 lg:py-24 overflow-hidden"
        >
            <div className="w-full mx-auto px-0">
                {/* Titre de la section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                    className="text-center mb-10 md:mb-14 lg:mb-16 px-4"
                >
                    <div className="relative inline-block mb-4">
                        <motion.h2 
                            className="font-geist text-sm md:text-base lg:text-lg text-foreground/90 tracking-[0.3em] uppercase font-medium"
                            initial={{ letterSpacing: "0.2em", opacity: 0.7 }}
                            animate={inView ? { letterSpacing: "0.3em", opacity: 1 } : {}}
                            transition={{ duration: 1.2, ease: [0.215, 0.61, 0.355, 1] }}
                        >
                            Nos collections
                        </motion.h2>
                        <motion.div 
                            className="w-full h-[1px] bg-foreground/20 absolute -bottom-2"
                            initial={{ width: '0%' }}
                            animate={inView ? { width: '100%' } : {}}
                            transition={{ duration: 1, delay: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                    >
                        <p className="text-foreground/60 text-sm md:text-base max-w-md mx-auto">
                            Découvrez notre sélection exclusive de vêtements et accessoires pour tous les styles
                        </p>
                    </motion.div>
                </motion.div>

                {/* Carousel principal */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                    className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex py-3 md:py-4 lg:py-6 pl-0">
                            {collections.map((store, index) => (
                                <div 
                                    key={store.id} 
                                    className={cn(
                                        "relative flex-grow-0 flex-shrink-0",
                                        "w-[95vw] px-3 sm:w-[85vw] sm:px-4 md:w-[75vw] lg:w-[65vw] xl:w-[55vw]",
                                        "transition-all duration-500 ease-out", 
                                        selectedSlide === index ? "" : "scale-[0.98] opacity-85"
                                    )}
                                >
                                    <Link 
                                        href={store.href} 
                                        className={cn(
                                            "block w-full aspect-[4/3] xs:aspect-[16/9] md:aspect-[21/9] relative overflow-hidden rounded-lg md:rounded-xl",
                                            "shadow-md hover:shadow-lg",
                                            "transition-all duration-500 ease-out group"
                                        )}
                                    >
                                        {/* Image principale */}
                                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                                            <Image
                                                src={store.image}
                                                alt={`Collection ${store.title} - REBOUL`}
                                                fill
                                                className={cn(
                                                    "object-cover transition-all duration-1000 ease-out",
                                                    selectedSlide === index 
                                                        ? "scale-105 brightness-105" 
                                                        : "scale-100 brightness-95",
                                                    "group-hover:scale-[1.03]"
                                                )}
                                                sizes="(max-width: 768px) 95vw, (max-width: 1024px) 85vw, (max-width: 1280px) 75vw, 65vw"
                                                priority
                                                quality={90}
                                            />
                                            
                                            {/* Overlay */}
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-b",
                                                getCardGradient(index),
                                                "transition-opacity duration-700 z-20",
                                                selectedSlide === index ? "opacity-65" : "opacity-75"
                                            )} />

                                            {/* Léger effet de brillance au hover */}
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-25"></div>
                                        </div>
                                        
                                        {/* Contenu principal */}
                                        <div className="absolute inset-0 p-3 xs:p-4 sm:p-6 md:p-10 lg:p-12 
                                                flex flex-col justify-center items-center text-center z-40">
                                            <div className={cn(
                                                "transform transition-all duration-700 w-full max-w-lg",
                                                selectedSlide === index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                                            )}>
                                                {/* Badge catégorie */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={selectedSlide === index ? { opacity: 1, y: 0 } : {}}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                    className="inline-block px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/15 backdrop-blur-sm mb-2 xs:mb-3 md:mb-5"
                                                >
                                                    <p className="font-geist text-[8px] xs:text-[10px] sm:text-xs tracking-[0.1em] xs:tracking-[0.15em] text-white uppercase font-light">
                                                        {store.description}
                                                    </p>
                                                </motion.div>
                                                
                                                {/* Titre */}
                                                <motion.h3
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={selectedSlide === index ? { opacity: 1, y: 0 } : {}}
                                                    transition={{ duration: 0.5, delay: 0.5 }}
                                                    className="font-geist text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-[0.08em] xs:tracking-[0.1em] 
                                                     text-white mb-1 xs:mb-2 md:mb-4 uppercase"
                                                >
                                                    {store.title}
                                                </motion.h3>
                                                
                                                {/* Tagline */}
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={selectedSlide === index ? { opacity: 1, y: 0 } : {}}
                                                    transition={{ duration: 0.5, delay: 0.6 }}
                                                    className="text-white/80 text-[10px] xs:text-xs sm:text-sm md:text-base mb-2 xs:mb-3 sm:mb-5 md:mb-6 max-w-xs xs:max-w-sm mx-auto"
                                                >
                                                    {store.tagline}
                                                </motion.p>
                                                
                                                {/* Bouton */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={selectedSlide === index ? { opacity: 1, y: 0 } : {}}
                                                    transition={{ duration: 0.5, delay: 0.7 }}
                                                    className="inline-block overflow-hidden rounded-full bg-white/15 hover:bg-white/25 
                                                        backdrop-blur-sm transition-all duration-300
                                                        px-3 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 group/btn"
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="font-geist text-[10px] xs:text-xs sm:text-sm md:text-base text-white flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                                                        Découvrir
                                                        <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                                                    </span>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Badge nouveautés - basé sur hasNewProducts de l'API */}
                                        {store.hasNewProducts && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={selectedSlide === index ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                                transition={{ duration: 0.5, delay: 0.4 }}
                                                className="absolute top-3 right-3 md:top-4 md:right-4 lg:top-5 lg:right-5 z-40"
                                            >
                                                <div className="bg-red-500/90 text-white px-1.5 py-0.5 xs:px-2 sm:px-3 md:px-4 md:py-1.5 rounded-full 
    text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs uppercase tracking-wide xs:tracking-wider shadow-sm flex items-center gap-1 xs:gap-1.5">
                                                    <span className="w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full bg-white animate-ping-slow"></span>
                                                    <span>Nouveautés</span>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Compteur de produits - basé sur productCount de l'API */}
                                        {store.productCount !== undefined && store.productCount > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={selectedSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                                transition={{ duration: 0.5, delay: 0.6 }}
                                                className="absolute bottom-3 left-3 md:bottom-4 md:left-4 lg:bottom-5 lg:left-5 z-40"
                                            >
                                                <div className="bg-black/40 backdrop-blur-sm text-white px-1 py-0.5 xs:px-1.5 sm:px-2 md:px-2.5 md:py-1
    text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs rounded-md">
                                                    {store.productCount} {store.productCount > 1 ? 'produits' : 'produit'}
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {/* Légère bordure intérieure */}
                                        <div className="absolute inset-0 border border-white/10 rounded-lg md:rounded-xl z-30" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Flèches de navigation */}
                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 left-2 right-2 sm:left-4 sm:right-4 md:left-6 md:right-6 lg:left-8 lg:right-8 flex justify-between z-50 transition-opacity duration-300 pointer-events-none",
                        isHovering ? "opacity-100" : "opacity-0 sm:opacity-60"
                    )}>
                        <motion.button
                            onClick={scrollPrev}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full
                                bg-black/40 backdrop-blur-md
                                text-white border border-white/10 hover:bg-black/60 hover:border-white/30
                                transition-all duration-300 shadow-md pointer-events-auto"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Collection précédente"
                            disabled={!prevBtnEnabled}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                        </motion.button>
                        <motion.button
                            onClick={scrollNext}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full
                                bg-black/40 backdrop-blur-md
                                text-white border border-white/10 hover:bg-black/60 hover:border-white/30
                                transition-all duration-300 shadow-md pointer-events-auto"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Collection suivante"
                            disabled={!nextBtnEnabled}
                        >
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
} 