'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

// Images recommandées :
// - Format: JPG/WebP
// - Dimensions: 800x1000px (ratio 4:5)
// - Résolution: 2x pour Retina
// - Poids: <200KB
const STORES = [
    {
        id: 'adulte',
        title: 'REBOUL ADULTE',
        image: '/images/collections/adult-collection.jpg',
        href: '/catalogue?store_type=adult',
        description: 'COLLECTION ADULTE'
    },
    {
        id: 'minots',
        title: 'LES MINOTS DE REBOUL',
        image: '/images/collections/kids-collection.jpg',
        href: '/catalogue?store_type=kids',
        description: 'COLLECTION ENFANT'
    },
    {
        id: 'sneakers',
        title: 'SNEAKERS',
        image: '/images/collections/sneakers-collection.jpg',
        href: '/catalogue?store_type=sneakers',
        description: 'ÉDITION LIMITÉE'
    },
    {
        id: 'cpcompany',
        title: 'THE CORNER MARSEILLE',
        image: '/images/collections/cp-company.jpg',
        href: '/catalogue?store_type=cpcompany',
        description: 'THE CORNER - C.P.COMPANY'
    }
]

export function StoreSelection() {
    return (
        <section className="w-full bg-white dark:bg-zinc-950 px-3 py-12 md:py-20 lg:py-24">
            <div className="max-w-screen-2xl mx-auto">
                {/* Titre de la section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 md:mb-12 lg:mb-16"
                >
                    <h2 className="font-geist text-xs md:text-sm lg:text-base text-foreground/80 tracking-[0.3em] uppercase mb-2 font-normal">
                        Nos collections
                    </h2>
                    <div className="w-8 md:w-12 lg:w-16 h-[1px] bg-foreground/20 mx-auto" />
                </motion.div>

                {/* Grille des boutiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {STORES.map((store, index) => (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group max-w-[500px] mx-auto w-full"
                        >
                            <Link 
                                href={store.href} 
                                className="block w-full aspect-[4/5] relative overflow-hidden rounded-2xl 
                                    bg-zinc-100 dark:bg-zinc-950 shadow-sm hover:shadow-xl
                                    transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                            >
                                {/* Image avec overlay */}
                                <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
                                    <Image
                                        src={store.image}
                                        alt={`Collection ${store.title} - REBOUL`}
                                        fill
                                        className="object-cover transition-all duration-700 ease-out
                                            scale-[1.03] group-hover:scale-[1.08] brightness-[0.85] group-hover:brightness-[0.95]"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 500px"
                                        priority
                                        quality={95}
                                    />
                                    {/* Double overlay pour effet de profondeur */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80 opacity-100 
                                        transition-opacity duration-500 group-hover:opacity-90" />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 backdrop-blur-[2px]
                                        transition-all duration-500 group-hover:opacity-100" />
                                </div>
                                
                                {/* Contenu */}
                                <div className="absolute inset-0 p-5 md:p-7 lg:p-8 flex flex-col justify-end">
                                    <div className="transform transition-all duration-500 translate-y-0 group-hover:translate-y-[-4px]">
                                        {/* Titre */}
                                        <h3 className="font-geist text-sm md:text-lg lg:text-xl font-medium tracking-[0.2em] 
                                            text-white mb-3 md:mb-4 lg:mb-5 uppercase">
                                            {store.title}
                                        </h3>
                                        
                                        {/* Description et flèche */}
                                        <div className="flex items-center justify-between">
                                            <p className="font-geist text-[10px] md:text-xs lg:text-sm tracking-[0.15em]
                                                text-white/70 group-hover:text-white/90 transition-colors duration-500
                                                uppercase font-light">
                                                {store.description}
                                            </p>
                                            <span className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full
                                                bg-white/10 group-hover:bg-white/20 transition-all duration-500">
                                                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white/90 
                                                    transform transition-all duration-500 
                                                    translate-x-0 group-hover:translate-x-[2px]" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bordure intérieure */}
                                <div className="absolute inset-[6px] md:inset-[8px] lg:inset-[10px] rounded-xl border border-white/10 
                                    group-hover:border-white/20 transition-all duration-700 ease-out" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
} 