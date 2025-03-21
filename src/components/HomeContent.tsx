'use client'

import React from 'react'
import { HeroSection } from './HeroSection'
import { StoreSelection } from './StoreSelection'
import { BrandsCarousel } from './BrandsCarousel'
import { FeaturedProducts } from './FeaturedProducts'
import { RandomAdultProducts } from './RandomAdultProducts'
import { RandomKidsProducts } from './RandomKidsProducts'
import { RandomSneakersProducts } from './RandomSneakersProducts'
import { RandomCpcompanyProducts } from './RandomCpcompanyProducts'
import { LatestCollections } from './LatestCollections'
import { Advantages } from './Advantages'
import { Archives } from './Archives'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function HomeContent() {
    return (
        <main className="w-full min-w-full overflow-hidden bg-white dark:bg-zinc-950">
            {/* Hero Section */}
            <HeroSection />

            {/* Store Selection */}
            <StoreSelection />
            
            {/* Featured Products */}
            <section className="w-full py-4 xs:py-5 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <FeaturedProducts />
                </div>
            </section>

            {/* Random Adult Products */}
            <section className="w-full py-4 xs:py-5 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <RandomAdultProducts />
                </div>
            </section>

            {/* Random Kids Products */}
            <section className="w-full py-4 xs:py-5 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <RandomKidsProducts />
                </div>
            </section>

            {/* Random Sneakers Products */}
            <section className="w-full py-4 xs:py-5 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <RandomSneakersProducts />
                </div>
            </section>

            {/* Random CP Company Products */}
            <section className="w-full py-4 xs:py-5 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white dark:bg-zinc-950 relative">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.03] dark:opacity-[0.02]" />
                <div className="w-full relative">
                    <RandomCpcompanyProducts />
                </div>
            </section>

            {/* Latest Collections */}
            <section className="w-full pt-4 pb-6 bg-white dark:bg-zinc-950 sm:pt-6 sm:pb-8 md:pt-8 md:pb-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <LatestCollections />
                </div>
            </section>

            {/* Archives Section */}
            <section className="w-full pt-6 pb-8 bg-white dark:bg-zinc-950 sm:pt-8 sm:pb-12 md:pt-12 md:pb-16 lg:pt-16 lg:pb-24">
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

            {/* Services Section */}
            <section className="w-full py-8 bg-white dark:bg-zinc-950 relative overflow-hidden sm:py-12 md:py-16 lg:py-24">
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
                </div>
            </section>
        </main>
    )
}