'use client'

import { useEffect, useRef } from 'react'
import { ProductGrid } from '@/components/catalogue/ProductGrid'
import { Hero } from '@/components/Hero'
import { Separator } from "@/components/ui/separator"
import { useAnime } from '@/hooks/useAnime'
import anime from 'animejs'
import { FeaturedCarousel } from '@/components/FeaturedCarousel'

export default function MinotsPage() {
    const pageRef = useRef(null)
    const titleRef = useAnime({
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
    })

    const separatorRef = useAnime({
        width: ['0%', '100%'],
        duration: 1000,
        easing: 'easeInOutQuad',
        delay: 600
    })

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

        anime({
            targets: pageRef.current,
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutQuad'
        })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div ref={pageRef} className="space-y-8 sm:space-y-16 opacity-0">
            <Hero
                title="Les Minots de Reboul"
                subtitle="Des vêtements adorables et confortables pour vos petits aventuriers"
                imageUrl="/images/hero-kids.jpg"
                overlayColor="rgba(0, 0, 0, 0.3)"
                parallax
            />
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 ref={titleRef} className="text-2xl sm:text-3xl font-light mb-4 text-center opacity-0">Notre Collection Enfants</h2>
                <Separator ref={separatorRef} className="mb-8" />

                <div className="space-y-12">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-light mb-4">Produits en vedette</h3>
                        <div className="h-[300px] sm:h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                            <FeaturedCarousel storeType="kids" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl sm:text-2xl font-light mb-4">Tous nos produits</h3>
                        <ProductGrid storeType="kids" />
                    </div>
                </div>
            </section>
        </div>
    )
}

