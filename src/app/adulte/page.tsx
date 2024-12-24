'use client'

import { useEffect, useRef, useMemo } from 'react'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Hero } from '@/components/Hero'
import { Separator } from "@/components/ui/separator"
import anime from 'animejs'
import { FeaturedCarousel } from '@/components/FeaturedCarousel'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AdultePage() {
    const pageRef = useRef<HTMLDivElement>(null)

    const animationConfig = useMemo(() => ({
        title: {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 300
        },
        separator: {
            width: ['0%', '100%'],
            duration: 1000,
            easing: 'easeInOutQuad',
            delay: 600
        }
    }), [])

    const titleRef = useRef<HTMLHeadingElement>(null)
    const separatorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        window.scrollTo(0, 0)

        const parallaxAnimation = anime({
            targets: '.parallax-bg',
            translateY: ['0%', '30%'],
            easing: 'linear',
            duration: 1000,
            autoplay: false
        })

        const handleScroll = () => {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
            parallaxAnimation.seek(parallaxAnimation.duration * scrollPercent)
        }

        window.addEventListener('scroll', handleScroll)

        if (pageRef.current) {
            anime({
                targets: pageRef.current,
                opacity: [0, 1],
                duration: 1000,
                easing: 'easeOutQuad'
            })
        }

        if (titleRef.current) {
            anime({
                targets: titleRef.current,
                ...animationConfig.title
            })
        }

        if (separatorRef.current) {
            anime({
                targets: separatorRef.current,
                ...animationConfig.separator
            })
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [animationConfig])

    return (
        <div ref={pageRef} className="space-y-8 sm:space-y-16 opacity-0">
            <Hero
                title="Collection Adulte"
                subtitle="Découvrez notre sélection élégante et confortable pour hommes et femmes"
                imageUrl="/images/hero-adult.jpg"
                overlayColor="rgba(0, 0, 0, 0.4)"
                parallax
            />
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 ref={titleRef} className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 text-center opacity-0">Notre Collection</h2>
                <Separator ref={separatorRef} className="mb-8" />

                <div className="space-y-12">
                    <div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-4">Produits en vedette</h3>
                        <div className="h-[300px] sm:h-[400px] md:h-[500px] bg-transparent rounded-lg overflow-hidden">
                            <ErrorBoundary fallback={<p>Erreur dans FeaturedCarousel</p>}>
                                <FeaturedCarousel storeType="adult" />
                            </ErrorBoundary>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-light mb-4">Tous nos produits</h3>
                        <ErrorBoundary fallback={<p>Erreur dans ProductGrid</p>}>
                            <ProductGrid storeType="adult" />
                        </ErrorBoundary>
                    </div>
                </div>
            </section>
        </div>
    )
}

