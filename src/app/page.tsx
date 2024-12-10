'use client'

import { useRef, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { AnimatedBrands } from '@/components/AnimatedBrands'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { AboutSection } from '@/components/AboutSection'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            sectionRefs.current.forEach((section, index) => {
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
                                // markers: true, // Uncomment for debugging
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
            <section ref={el => sectionRefs.current[0] = el} className="animate-section">
                <Hero />
            </section>

            <section ref={el => sectionRefs.current[1] = el} className="animate-section bg-gray-100 py-32">
                <div className="container mx-auto px-4">
                    <h2 className="animate-on-scroll text-3xl font-bold mb-12 text-center text-black">Nos marques phares</h2>
                    <AnimatedBrands />
                </div>
            </section>

            <section ref={el => sectionRefs.current[2] = el} className="animate-section">
                <FeaturedProducts />
            </section>

            <section ref={el => sectionRefs.current[3] = el} className="animate-section">
                <AboutSection />
            </section>
        </div>
    )
}

