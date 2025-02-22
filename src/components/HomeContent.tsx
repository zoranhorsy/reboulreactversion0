'use client'

import React from 'react'
import { HeroSection } from './HeroSection'
import { StoreSelection } from './StoreSelection'
import { BrandsCarousel } from './BrandsCarousel'
import { FeaturedProducts } from './FeaturedProducts'
import { LatestCollections } from './LatestCollections'
import { Advantages } from './Advantages'
import { Archives } from './Archives'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HomeContent() {
    return (
        <main className="w-full min-w-full overflow-hidden bg-white dark:bg-zinc-950">
            {/* Hero Section - Pleine hauteur */}
            <HeroSection />

            {/* Store Selection - Pas de padding pour un effet bord à bord */}
            <StoreSelection />
            
            {/* Featured Products - Fond avec motif subtil */}
            <section className="w-full py-32 bg-zinc-50 dark:bg-zinc-900 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <FeaturedProducts />
                </div>
            </section>

            {/* Latest Collections - Fond contrasté */}
            <section className="w-full py-32 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-geist text-4xl md:text-5xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-4">
                            DERNIÈRES COLLECTIONS
                        </h2>
                        <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Découvrez nos dernières pièces et collections exclusives
                        </p>
                    </motion.div>
                    <LatestCollections />
                </div>
            </section>

            {/* Brands Section - Fond neutre */}
            <section className="w-full py-32 bg-zinc-50 dark:bg-zinc-900">
                <BrandsCarousel />
            </section>

            {/* Archives Section - Fond contrasté */}
            <section className="w-full py-32 bg-white dark:bg-zinc-950">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-geist text-4xl md:text-5xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-4">
                            NOS ARCHIVES
                        </h2>
                        <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Découvrez l&apos;univers REBOUL à travers notre galerie de photos
                        </p>
                    </motion.div>
                    <Archives />
                </div>
            </section>

            {/* Services & Concept - Fond avec motif subtil */}
            <section className="w-full py-32 bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-geist text-4xl md:text-5xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-4">
                            NOS SERVICES
                        </h2>
                        <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            REBOUL redéfinit l&apos;expérience shopping en fusionnant l&apos;élégance traditionnelle 
                            avec les tendances contemporaines
                        </p>
                    </motion.div>
                    <Advantages />
                    <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <h3 className="font-geist text-3xl font-light tracking-wide text-zinc-900 dark:text-zinc-100">
                                Notre Concept
                            </h3>
                            <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Chez REBOUL, nous croyons en l&apos;alliance parfaite entre style intemporel et tendances actuelles.
                                Notre boutique est un lieu où la mode rencontre l&apos;authenticité, offrant une expérience shopping unique
                                à Marseille depuis plus de 30 ans.
                            </p>
                            <Button 
                                asChild 
                                variant="outline" 
                                size="lg" 
                                className="font-geist text-xs tracking-[0.2em] uppercase font-light
                                    bg-white dark:bg-zinc-900
                                    text-zinc-900 dark:text-zinc-100 
                                    border-zinc-200 dark:border-zinc-800
                                    hover:bg-zinc-100 hover:text-zinc-900
                                    dark:hover:bg-zinc-800 dark:hover:text-zinc-100
                                    transition-all duration-300"
                            >
                                <Link href="/about" className="flex items-center gap-2">
                                    En savoir plus
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden"
                        >
                            <Image
                                src="/store-front.jpg"
                                alt="REBOUL Store"
                                fill
                                className="object-cover"
                                quality={90}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    )
}