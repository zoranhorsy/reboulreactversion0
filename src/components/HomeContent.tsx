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
            {/* Hero Section */}
            <HeroSection />

            {/* Store Selection */}
            <StoreSelection />
            
            {/* Featured Products */}
            <section className="w-full py-8 bg-zinc-50 dark:bg-zinc-900 relative sm:py-12 md:py-16 lg:py-32">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <FeaturedProducts />
                </div>
            </section>

            {/* Latest Collections */}
            <section className="w-full py-8 bg-white dark:bg-zinc-950 sm:py-12 md:py-16 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="font-geist text-2xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-3 
                            sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
                            DERNIÈRES COLLECTIONS
                        </h2>
                        <p className="font-geist text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed
                            sm:text-lg">
                            Découvrez nos dernières pièces et collections exclusives
                        </p>
                    </motion.div>
                    <LatestCollections />
                </div>
            </section>

            {/* Brands Section */}
            <section className="w-full py-8 bg-zinc-50 dark:bg-zinc-900 sm:py-12 md:py-16 lg:py-32">
                <BrandsCarousel />
            </section>

            {/* Archives Section */}
            <section className="w-full py-8 bg-white dark:bg-zinc-950 sm:py-12 md:py-16 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="font-geist text-2xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-3
                            sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
                            NOS ARCHIVES
                        </h2>
                        <p className="font-geist text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed
                            sm:text-lg">
                            Découvrez l&apos;univers REBOUL à travers notre galerie de photos
                        </p>
                    </motion.div>
                    <Archives />
                </div>
            </section>

            {/* Services & Concept */}
            <section className="w-full py-8 bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden sm:py-12 md:py-16 lg:py-32">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-8 sm:mb-12 md:mb-16"
                    >
                        <h2 className="font-geist text-2xl font-light tracking-wide text-zinc-900 dark:text-zinc-100 mb-3
                            sm:text-3xl md:text-4xl lg:text-5xl sm:mb-4">
                            NOS SERVICES
                        </h2>
                        <p className="font-geist text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed
                            sm:text-lg">
                            REBOUL redéfinit l&apos;expérience shopping en fusionnant l&apos;élégance traditionnelle 
                            avec les tendances contemporaines
                        </p>
                    </motion.div>
                    <Advantages />
                    <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 grid grid-cols-1 gap-8 items-center md:grid-cols-2 md:gap-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4 sm:space-y-6"
                        >
                            <h3 className="font-geist text-2xl font-light tracking-wide text-zinc-900 dark:text-zinc-100
                                sm:text-3xl">
                                Notre Concept
                            </h3>
                            <p className="font-geist text-base text-zinc-600 dark:text-zinc-400 leading-relaxed sm:text-lg">
                                Chez REBOUL, nous croyons en l&apos;alliance parfaite entre style intemporel et tendances actuelles.
                                Notre boutique est un lieu où la mode rencontre l&apos;authenticité, offrant une expérience shopping unique
                                à Marseille depuis plus de 30 ans.
                            </p>
                            <Button 
                                asChild 
                                variant="outline" 
                                size="lg" 
                                className="w-full sm:w-auto font-geist text-xs tracking-[0.2em] uppercase font-light
                                    bg-white dark:bg-zinc-900
                                    text-zinc-900 dark:text-zinc-100 
                                    border-zinc-200 dark:border-zinc-800
                                    hover:bg-zinc-100 hover:text-zinc-900
                                    dark:hover:bg-zinc-800 dark:hover:text-zinc-100
                                    transition-all duration-300"
                            >
                                <Link href="/about" className="flex items-center justify-center gap-2 sm:justify-start">
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
                            className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden"
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