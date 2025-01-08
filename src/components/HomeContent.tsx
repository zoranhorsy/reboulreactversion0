'use client'

import { useRef, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { AnimatedBrands } from '@/components/AnimatedBrands'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { AboutSection } from '@/components/AboutSection'
import { StoreSelector } from "@/components/StoreSelector"
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

export function HomeContent() {
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            sectionRefs.current.forEach((section) => {
                if (section) {
                    gsap.fromTo(
                        section.querySelectorAll('.animate-on-scroll'),
                        {
                            opacity: 0,
                            y: 50
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 2,
                            stagger: 0.5,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: section,
                                start: 'top 60%',
                                end: 'bottom 20%',
                                toggleActions: 'play none none reverse',
                            }
                        }
                    )
                }
            })
        })

        return () => ctx.revert()
    }, [])

    return (
        <div className="space-y-16">
            <section ref={el => sectionRefs.current[0] = el} className="animate-section font-light">
                <Hero />
            </section>

            <section ref={el => sectionRefs.current[1] = el} className="animate-section font-light">
                <StoreSelector />
            </section>

            <section ref={el => sectionRefs.current[2] = el} className="animate-section bg-gray-100">
                <div className="container mx-auto">
                    <h2 className="animate-on-scroll text-3xl font-light mb-12 text-center text-black">
                        Nos marques phares
                    </h2>
                    <AnimatedBrands />
                </div>
            </section>

            <section ref={el => sectionRefs.current[3] = el} className="animate-section">
                <FeaturedProducts />
            </section>

            <section ref={el => sectionRefs.current[4] = el} className="animate-section">
                <AboutSection />
            </section>
        </div>
    )
}

