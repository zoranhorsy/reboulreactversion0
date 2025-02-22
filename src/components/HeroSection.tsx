import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { ChevronRight, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
    const heroRef = useRef(null)
    const imageRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Timeline principale avec un délai plus court pour une réponse plus rapide
            const mainTimeline = gsap.timeline({ delay: 0.1 })
            
            // Animation de l'image de fond avec un effet de zoom plus subtil
            mainTimeline.fromTo('.hero-image',
                { scale: 1.05, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' }
            )
            
            // Animation de l'overlay avec un effet de fondu plus subtil
            mainTimeline.fromTo('.hero-overlay',
                { opacity: 0 },
                { opacity: 1, duration: 1.6, ease: 'power2.out' },
                '-=1.8'
            )
            
            // Animation du logo avec un effet de montée plus doux
            mainTimeline.fromTo('.hero-logo',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
                '-=1.2'
            )
            
            // Animation du texte avec un délai pour créer une séquence
            mainTimeline.fromTo('.hero-text',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
                '-=0.8'
            )
            
            // Animation des boutons avec un effet d'apparition progressif
            mainTimeline.fromTo('.hero-buttons',
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
                '-=0.6'
            )

            // Animation de l'indicateur de scroll
            mainTimeline.fromTo('.scroll-indicator',
                { opacity: 0, y: -10 },
                { opacity: 0.7, y: 0, duration: 0.6, ease: 'power2.out' },
                '-=0.4'
            )

            // Animation continue de l'indicateur de scroll
            gsap.to('.scroll-arrow', {
                y: 8,
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: 'power1.inOut'
            })
        })

        return () => ctx.revert()
    }, [])

    return (
        <section 
            ref={heroRef} 
            className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        >
            {/* Image de fond avec qualité optimisée */}
            <div className="hero-image absolute inset-0 opacity-0">
                <Image
                    ref={imageRef}
                    src="/images/hero-bg.jpg"
                    alt="REBOUL Background"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
            </div>

            {/* Overlay avec dégradé sophistiqué */}
            <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/85 opacity-0" />

            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-screen-2xl mx-auto px-4">
                <div className="flex-1" />
                
                {/* Logo avec taille optimisée */}
                <div className="hero-logo opacity-0 w-full max-w-[600px] mx-auto mb-16">
                    <Image
                        src="/images/logo_white.png"
                        alt="REBOUL"
                        width={600}
                        height={180}
                        className="w-full h-auto"
                        priority
                        quality={100}
                    />
                </div>
                
                {/* Texte avec typographie Geist */}
                <div className="hero-text opacity-0 text-center mb-16">
                    <p className="font-geist text-[12px] font-light tracking-[0.5em] text-white/90 uppercase">
                        L&apos;élégance intemporelle depuis 1872
                    </p>
                </div>

                {/* Boutons avec design cohérent */}
                <div className="hero-buttons flex flex-col sm:flex-row items-center gap-4 opacity-0">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto"
                    >
                        <Button 
                            asChild 
                            variant="default"
                            className="bg-white text-black hover:bg-white/90 transition-all duration-300
                                h-11 px-6 w-full sm:w-auto text-[11px] tracking-[0.2em] font-light uppercase
                                border-none"
                        >
                            <Link href="/catalogue" className="flex items-center gap-2">
                                Explorer la collection
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto"
                    >
                        <Button 
                            asChild 
                            variant="outline"
                            className="bg-transparent text-white border-white/20 
                                hover:bg-white/5 hover:text-white
                                transition-all duration-300 h-11 px-8 w-full sm:w-auto text-[11px] tracking-[0.2em] font-light uppercase"
                        >
                            <Link href="/about" className="flex items-center gap-2">
                                Notre histoire
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                <div className="flex-1" />

                {/* Indicateur de scroll amélioré */}
                <div className="scroll-indicator absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="font-geist text-[10px] tracking-[0.4em] text-white/60 uppercase font-light">
                        Découvrir
                    </span>
                    <div className="scroll-arrow">
                        <ArrowDown className="w-4 h-4 text-white/60" />
                    </div>
                </div>
            </div>
        </section>
    )
} 