'use client'

import React, { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { AnimatedBrands } from '@/components/AnimatedBrands'
import { FeaturedProducts } from '@/components/FeaturedProducts'
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
        <div className="space-y-32">
            <section className="animate-section font-light pt-8">
                <Hero />
            </section>

            <section className="animate-section font-light">
                <div className="container mx-auto px-4">
                    <StoreSelector />
                </div>
            </section>

            <section className="animate-section">
                <div className="container mx-auto px-4">
                    <AnimatedBrands />
                </div>
            </section>

            <section className="animate-section">
                <div className="container mx-auto px-4">
                    <FeaturedProducts />
                </div>
            </section>
        </div>
    )
}