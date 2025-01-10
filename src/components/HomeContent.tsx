'use client'

import React, { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { AnimatedBrands } from '@/components/AnimatedBrands'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { AboutSection } from '@/components/AboutSection'
import { StoreSelector } from "@/components/StoreSelector"

export function HomeContent() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-16">
            <section className="animate-section font-light">
                <Hero />
            </section>

            <section className="animate-section font-light">
                <StoreSelector />
            </section>

            <section className="animate-section bg-gray-100">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-light mb-12 text-center text-black">
                        Nos marques phares
                    </h2>
                    <AnimatedBrands />
                </div>
            </section>

            <section className="animate-section">
                <FeaturedProducts />
            </section>

            <section className="animate-section">
                <AboutSection />
            </section>
        </div>
    )
}

