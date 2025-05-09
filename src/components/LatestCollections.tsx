'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react'
import { fetchBrands, fetchProducts } from '@/lib/api'
import { type Brand } from '@/lib/api'
import { toast } from './ui/use-toast'
import { useTheme } from 'next-themes'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Typage pour les marques avec information sur les nouveautés
interface BrandWithNewProducts extends Brand {
    hasNewProducts: boolean;
    productCount?: number;  // Nombre de produits disponibles
    isTrending?: boolean;   // Indication si la marque est tendance
}

// Couleurs sobres pour les arrière-plans des cartes
const BRAND_BACKGROUNDS = [
    "bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-black/95",
    "bg-gradient-to-br from-zinc-900/95 via-slate-900/95 to-black/95",
    "bg-gradient-to-br from-stone-800/95 via-stone-900/95 to-black/95",
    "bg-gradient-to-br from-neutral-800/95 via-neutral-900/95 to-black/95",
    "bg-gradient-to-br from-gray-800/95 via-slate-900/95 to-black/95",
]

// Couleurs d'accent neutres pour Reboul
const ACCENT_COLORS = [
    "from-white to-white", // Blanc pur
    "from-zinc-100 to-white", // Blanc grisé
    "from-white to-white", // Blanc pur (répété pour augmenter sa fréquence)
    "from-stone-100 to-white", // Blanc cassé
    "from-white to-white", // Blanc pur (répété pour augmenter sa fréquence)
];

// Couleurs des lignes d'accent selon la charte de Reboul (tons sobres)
const ACCENT_LINE_COLORS = [
    "from-zinc-300 to-zinc-400", // Gris zinc
    "from-stone-300 to-stone-400", // Beige/taupe
    "from-slate-300 to-slate-400", // Bleu-gris
    "from-neutral-300 to-neutral-400", // Gris neutre
    "from-gray-300 to-gray-500", // Gris foncé
];

export function LatestCollections() {
    const [brands, setBrands] = useState<BrandWithNewProducts[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { resolvedTheme } = useTheme()
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
    const [slideCount, setSlideCount] = useState(0)
    
    // Fonction pour vérifier les nouveaux produits pour chaque marque
    const checkNewProductsForBrands = async (brandsData: Brand[]) => {
        try {
            // Récupérer tous les produits marqués comme "new"
            const { products } = await fetchProducts({ new: "true" })
            
            // Récupérer tous les produits pour compter ceux de chaque marque
            const { products: allProducts } = await fetchProducts({})
            
            // Créer un ensemble des IDs de marques qui ont des nouveaux produits
            const brandsWithNewProducts = new Set(
                products.map(product => product.brand_id)
            )
            
            // Compter le nombre de produits par marque
            const productCountByBrand = allProducts.reduce((acc, product) => {
                if (!acc[product.brand_id]) {
                    acc[product.brand_id] = 0
                }
                acc[product.brand_id]++
                return acc
            }, {} as Record<number, number>)
            
            // Déterminer les marques tendance (par exemple, celles avec plus de X produits et des nouveautés)
            const trendingBrands = new Set(
                Object.entries(productCountByBrand)
                    .filter(([brandId, count]) => count > 5 && brandsWithNewProducts.has(Number(brandId)))
                    .map(([brandId]) => Number(brandId))
            )
            
            // Ajouter l'information aux marques
            return brandsData.map(brand => ({
                ...brand,
                hasNewProducts: brandsWithNewProducts.has(brand.id),
                productCount: productCountByBrand[brand.id] || 0,
                isTrending: trendingBrands.has(brand.id)
            }))
        } catch (error) {
            console.error("Erreur lors de la vérification des nouveaux produits:", error)
            // En cas d'erreur, on considère qu'aucune marque n'a de nouveaux produits
            return brandsData.map(brand => ({
                ...brand,
                hasNewProducts: false,
                productCount: 0,
                isTrending: false
            }))
        }
    }
    
    useEffect(() => {
        const loadBrands = async () => {
            try {
                const data = await fetchBrands()
                if (data && data.length > 0) {
                    // Vérifier les nouveaux produits pour chaque marque
                    const brandsWithNewInfo = await checkNewProductsForBrands(data)
                    setBrands(brandsWithNewInfo)
                } else {
                    console.warn("Aucune marque n'a été trouvée")
                }
            } catch (error) {
                console.error("Erreur lors du chargement des marques:", error)
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les marques, veuillez réessayer plus tard.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        
        loadBrands()
    }, [])

    // Mettre à jour l'index du slide actif lors du défilement
    useEffect(() => {
        if (!emblaApi) return
        
        const onSelect = () => {
            setSelectedSlide(emblaApi.selectedScrollSnap())
        }
        
        // Mettre à jour le nombre total de slides
        setSlideCount(emblaApi.slideNodes().length)
        
        emblaApi.on('select', onSelect)
        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi])

    const getBrandLogo = (brand: Brand) => {
        if (!brand) return '/placeholder.png'
        
        // Toujours utiliser le logo clair (blanc) car les cartes ont un fond sombre
        let logoUrl = brand.logo_light;
            
        if (!logoUrl) return '/placeholder.png'
        
        // Construction de l'URL complète pour l'API
        const apiUrl = 'https://reboul-store-api-production.up.railway.app'
        
        // Nettoyer le chemin
        let cleanPath = logoUrl
        cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath
        cleanPath = cleanPath.startsWith('api/') ? cleanPath.slice(4) : cleanPath
        
        return `${apiUrl}/${cleanPath}`
    }
    
    // Naviguer vers le slide précédent
    const scrollPrev = () => {
        if (emblaApi) emblaApi.scrollPrev()
    }
    
    // Naviguer vers le slide suivant
    const scrollNext = () => {
        if (emblaApi) emblaApi.scrollNext()
    }
    
    // Récupérer un fond aléatoire pour une marque en fonction de son index
    const getBrandBackground = (index: number) => {
        return BRAND_BACKGROUNDS[index % BRAND_BACKGROUNDS.length]
    }
    
    if (isLoading) {
        return (
            <div className="w-full relative">
                <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl aspect-[16/13] sm:aspect-[16/12] md:aspect-[16/10] lg:aspect-[16/8] animate-pulse" />
            </div>
        )
    }
    
    if (!brands.length) {
        return (
            <div className="text-center py-10">
                <p>Aucune marque disponible pour le moment.</p>
            </div>
        )
    }
    
    return (
        <div 
            ref={ref} 
            className="w-full relative mb-10 md:mb-16"
        >
           

            {/* Carousel principal avec largeur 100vw */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw]"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex py-3 md:py-4 lg:py-6">
                        {brands.map((brand, index) => (
                            <div 
                                key={brand.id} 
                                className={cn(
                                    "relative flex-grow-0 flex-shrink-0",
                                    "w-[98vw] px-3 sm:w-[90vw] sm:px-4 md:w-[80vw] lg:w-[70vw] xl:w-[60vw]",
                                    "transition-all duration-500 ease-out",
                                    selectedSlide === index ? "" : "scale-[0.95] opacity-80"
                                )}
                            >
                                <Link 
                                    href={`/catalogue?brand=${brand.id}`} 
                                    className={cn(
                                        "block w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/8] lg:aspect-[16/7] relative overflow-hidden rounded-lg md:rounded-xl lg:rounded-2xl",
                                        "shadow-lg hover:shadow-xl md:hover:shadow-2xl group",
                                        "transition-all duration-700 ease-out border border-transparent group-hover:border-white/40",
                                        "transform group-hover:translate-y-[-5px]"
                                    )}
                                >
                                    {/* Contour blanc pur avec flou augmenté */}
                                    <div className={cn(
                                        "absolute -inset-[2px] rounded-lg md:rounded-xl lg:rounded-2xl z-0",
                                        "bg-white border border-white",
                                        "opacity-0 group-hover:opacity-30 transition-all duration-500",
                                        "blur-[2px]"
                                    )}></div>
                                    
                                    {/* Fond avec blur */}
                                    <div className={cn(
                                        "absolute inset-[1px] w-[calc(100%-2px)] h-[calc(100%-2px)] backdrop-blur-md z-10",
                                        getBrandBackground(index),
                                        "transition-all duration-700 rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden"
                                    )}>
                                        {/* Motif subtil */}
                                        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('/pattern-dots.svg')]"></div>
                                        
                                        {/* Effet de brillance */}
                                        <div className="absolute -inset-[50%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-in-out"></div>
                                        
                                        {/* Ligne d'accent colorée au bas */}
                                        <div className={cn(
                                            "absolute bottom-0 left-0 right-0 h-1 md:h-1.5 lg:h-2 bg-gradient-to-r",
                                            ACCENT_LINE_COLORS[index % ACCENT_LINE_COLORS.length],
                                            "transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                                        )}></div>
                                    </div>
                                    
                                    {/* Bordure standard */}
                                    <div className="absolute inset-0 border border-white/10 rounded-lg md:rounded-xl lg:rounded-2xl z-20"></div>
                                    
                                    {/* Ombre intérieure subtile */}
                                    <div className="absolute inset-0 shadow-inner rounded-lg md:rounded-xl lg:rounded-2xl z-20"></div>
                                    
                                    {/* Logo centré avec animation */}
                                    <div className="absolute inset-0 flex items-center justify-center z-30">
                                        <div className={cn(
                                            "transform transition-all duration-700 ease-out",
                                            selectedSlide === index ? "scale-105" : "scale-100",
                                            "w-[60%] sm:w-[55%] md:w-[50%] lg:w-[45%] max-w-[350px] h-auto max-h-[40%] md:max-h-[35%] flex items-center justify-center relative",
                                            "group-hover:scale-110"
                                        )}>
                                            {/* Effet de halo derrière le logo - encore plus réduit */}
                                            <div className={cn(
                                                "absolute inset-0 filter blur-xl opacity-5 bg-white rounded-full scale-90",
                                                selectedSlide === index ? "opacity-10" : "opacity-0",
                                                "transition-opacity duration-700"
                                            )}></div>
                                            
                                            <Image
                                                key={`${brand.id}-${resolvedTheme}`}
                                                src={getBrandLogo(brand)}
                                                alt={brand.name}
                                                width={300}
                                                height={150}
                                                className={cn(
                                                    "object-contain max-h-full max-w-full relative z-10",
                                                    "transition-all duration-500 ease-out filter drop-shadow-sm",
                                                    selectedSlide === index ? "brightness-110 drop-shadow-md" : "brightness-100",
                                                    "scale-[0.85]" // Réduction uniforme de tous les logos, sans rotation
                                                )}
                                                sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw"
                                                priority
                                                quality={95}
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement
                                                    img.src = '/placeholder.png'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Décoration coin inférieur gauche */}
                                    <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 lg:bottom-6 lg:left-6 opacity-30 group-hover:opacity-40 transition-opacity duration-500 z-20">
                                        <div className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 border-l-2 border-b-2 border-white/20 rounded-bl-md"></div>
                                    </div>
                                    
                                    {/* Décoration coin supérieur droit */}
                                    <div className="absolute top-3 right-3 md:top-5 md:right-5 lg:top-6 lg:right-6 opacity-30 group-hover:opacity-40 transition-opacity duration-500 z-20">
                                        <div className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 border-r-2 border-t-2 border-white/20 rounded-tr-md"></div>
                                    </div>
                                    
                                    {/* Description de la marque uniquement */}
                                    <div className={cn(
                                        "absolute bottom-0 left-0 right-0 z-40",
                                        "bg-gradient-to-t from-black/80 via-black/60 to-transparent h-[30%]",
                                        "transition-all duration-500 transform",
                                        selectedSlide === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
                                        "flex flex-col justify-end"
                                    )}>
                                        {brand.description && (
                                            <div className="flex flex-col items-center pb-4 md:pb-5 lg:pb-6">
                                                <div className="text-center text-white/90 text-[10px] md:text-xs lg:text-sm
                                                    max-w-[90%] md:max-w-[80%] lg:max-w-[70%]
                                                    line-clamp-2 overflow-hidden">
                                                    {brand.description}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Overlay hover - déplacé avant les badges pour ne pas les masquer */}
                                    <div className="absolute inset-0 bg-black/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                                    {/* Déplacer les badges APRÈS l'overlay pour qu'ils restent visibles */}
                                    {/* Badge nouveautés */}
                                    <div className="absolute top-3 right-3 md:top-5 md:right-6 lg:top-6 lg:right-8 z-40 flex flex-col gap-2">
                                        {brand.hasNewProducts && (
                                            <div className="relative">
                                                <div className="bg-zinc-900/95 dark:bg-black/95 text-white px-2 py-0.5 md:px-3 md:py-1 lg:px-4 lg:py-1.5 rounded-full 
                                                    text-[10px] md:text-xs lg:text-sm uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-red-500 animate-ping-slow"></span>
                                                    <span>Nouveautés</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Badge tendance */}
                                        {brand.isTrending && (
                                            <div className="relative">
                                                <div className="bg-amber-500/95 text-black/90 px-2 py-0.5 md:px-3 md:py-1 lg:px-4 lg:py-1.5 rounded-full 
                                                    text-[10px] md:text-xs lg:text-sm uppercase tracking-wider border border-amber-400/50 shadow-sm flex items-center gap-1.5">
                                                    <span className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                                            <path d="M9.984 5.06a8.5 8.5 0 013.132.639V3.27a.75.75 0 011.5 0v2.428c.96.216 1.866.544 2.7.952V5.25a.75.75 0 011.5 0v2.043c.623.446 1.197.956 1.712 1.53a.75.75 0 11-1.118 1.002A7.5 7.5 0 1013.5 4.534v1.634a.75.75 0 11-1.5 0V4.534a7.5 7.5 0 00-9.303 9.303 7.5 7.5 0 0014.287-3.192.75.75 0 111.5.216A9 9 0 1116.5 21a9 9 0 019-9 .75.75 0 010 1.5 7.5 7.5 0 00-7.5 7.5v.75a.75.75 0 01-1.5 0v-.75a7.5 7.5 0 00-7.5-7.5.75.75 0 010-1.5 9 9 0 019-9 .75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-4.484a7.495 7.495 0 00-9.216 4.294.75.75 0 01-1.5 0v-.072a9 9 0 019-8.928z" />
                                                        </svg>
                                                    </span>
                                                    <span>Tendance</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Compteur de produits */}
                                    {brand.productCount && brand.productCount > 0 && (
                                        <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 lg:bottom-7 lg:left-7 z-40">
                                            <div className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 md:px-2.5 md:py-1 
                                                text-[10px] md:text-xs rounded-md border border-white/10 shadow-sm">
                                                {brand.productCount} {brand.productCount > 1 ? 'produits' : 'produit'}
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Flèches de navigation */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none z-50 transition-opacity duration-300",
                    isHovering ? "opacity-100" : "opacity-0 sm:opacity-70"
                )}>
                    {/* Flèche gauche */}
                    <div className="absolute left-2 sm:left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 pointer-events-auto">
                        <motion.button
                            onClick={scrollPrev}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full
                                bg-zinc-900/90 dark:bg-black/90 text-white border border-zinc-700/30 dark:border-white/10
                                hover:bg-zinc-800 dark:hover:bg-zinc-950 
                                transition-all duration-300 shadow-md"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Marque précédente"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                        </motion.button>
                    </div>
                    
                    {/* Flèche droite */}
                    <div className="absolute right-2 sm:right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 pointer-events-auto">
                        <motion.button
                            onClick={scrollNext}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full
                                bg-zinc-900/90 dark:bg-black/90 text-white border border-zinc-700/30 dark:border-white/10
                                hover:bg-zinc-800 dark:hover:bg-zinc-950
                                transition-all duration-300 shadow-md"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Marque suivante"
                        >
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                        </motion.button>
                    </div>
                </div>
                
                {/* Indicateur de position du carousel */}
                {slideCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-1.5 mb-1 md:mb-2 transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100">
                        {Array.from({ length: slideCount }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => emblaApi?.scrollTo(i)}
                                className={cn(
                                    "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full pointer-events-auto transition-all duration-300",
                                    selectedSlide === i 
                                        ? "bg-white scale-110" 
                                        : "bg-white/40 hover:bg-white/60"
                                )}
                                aria-label={`Aller à la marque ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
                
                {/* Lien vers toutes les marques */}
                <div className="text-center mt-6 md:mt-8 lg:mt-10 mb-4 md:mb-6 lg:mb-8">
                    <Link 
                        href="/catalogue" 
                        className="inline-flex items-center gap-1.5 px-4 py-2 md:gap-2 md:px-5 md:py-2.5 lg:gap-2.5 lg:px-6 lg:py-3
                            bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 
                            rounded-full text-zinc-900 dark:text-zinc-100 transition-all duration-300
                            text-xs md:text-sm uppercase tracking-wider shadow-sm border border-zinc-200 dark:border-zinc-800"
                    >
                        <span>Toutes nos marques</span>
                        <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" />
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

// Ajout de cette classe CSS pour l'animation du badge "Nouveautés"
// À ajouter à votre tailwind.config.js dans la section 'extend.animation'
/*
'ping-slow': {
  '0%, 100%': { opacity: '1' },
  '50%': { opacity: '0.5' },
},
'pulse-slow': {
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
}
*/ 