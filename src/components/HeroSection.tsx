'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { ChevronRight, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { initGSAP } from '@/lib/gsap-config'

export function HeroSection() {
    const heroRef = useRef<HTMLElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const buttonsRef = useRef<HTMLDivElement>(null)
    const mouseFollowerRef = useRef<HTMLDivElement>(null)
    const scrollIndicatorRef = useRef<HTMLDivElement>(null)
    
    const { resolvedTheme } = useTheme()
    const [logoSource, setLogoSource] = useState("/images/logotype_w.png")
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Changer la source du logo en fonction du thème
    useEffect(() => {
        if (resolvedTheme) {
            setLogoSource(resolvedTheme === 'dark' ? "/images/logotype_w.png" : "/images/logotype_b.png")
        }
    }, [resolvedTheme])

    // Création des animations GSAP
    useEffect(() => {
        let ctx: any
        
        const setupGSAP = async () => {
            try {
                // Initialiser GSAP
                const { gsap, ScrollTrigger } = await initGSAP()
                
                ctx = gsap.context(() => {
                    // Animation d'entrée principale
                    const mainTimeline = gsap.timeline({ delay: 0.3 })
                    
                    // Zoom out léger du background
                    mainTimeline.fromTo('.hero-bg',
                        { scale: 1.1, opacity: 0.8 },
                        { scale: 1, opacity: 1, duration: 2.5, ease: 'power2.out' },
                        0
                    )
                    
                    // Animation du logo
                    mainTimeline.fromTo('.hero-logo',
                        { y: 40, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
                        0.8
                    )
                    
                    // Animation des boutons
                    mainTimeline.fromTo('.hero-buttons',
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
                        1.2
                    )
                    
                    // Animation de l'indicateur de défilement
                    mainTimeline.fromTo('.scroll-indicator',
                        { opacity: 0, y: -10 },
                        { opacity: 0.8, y: 0, duration: 0.8, ease: 'power1.out' },
                        2
                    )
                    
                    // Animation continue de l'indicateur de défilement
                    gsap.to('.scroll-arrow', {
                        y: 10,
                        opacity: 0.6,
                        duration: 1.5,
                        ease: 'power1.inOut',
                        repeat: -1,
                        yoyo: true
                    })
                    
                    // Effet de parallaxe au scroll
                    if (ScrollTrigger && heroRef.current) {
                        gsap.to('.hero-parallax', {
                            y: 120,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: heroRef.current,
                                start: 'top top',
                                end: 'bottom top',
                                scrub: true
                            }
                        })
                    }
                    
                    // Suivi de souris pour l'effet de profondeur
                    const handleMouseMove = (e: MouseEvent) => {
                        // Calculer la position relative à l'élément
                        if (!heroRef.current) return
                        const rect = heroRef.current.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        const y = e.clientY - rect.top
                        
                        // Normaliser la position (entre -1 et 1)
                        const normalizedX = (x / rect.width) * 2 - 1
                        const normalizedY = (y / rect.height) * 2 - 1
                        
                        // Stocker la position pour les animations réactives
                        setMousePosition({ x: normalizedX, y: normalizedY })
                        
                        // Déplacer subtilement le logo en fonction de la position de la souris
                        if (logoRef.current) {
                            gsap.to(logoRef.current, {
                                x: normalizedX * 10,
                                y: normalizedY * 5,
                                duration: 1,
                                ease: 'power2.out'
                            })
                        }
                        
                        // Déplacer plus subtilement les boutons
                        if (buttonsRef.current) {
                            gsap.to(buttonsRef.current, {
                                x: normalizedX * 5,
                                y: normalizedY * 3,
                                duration: 1.2,
                                ease: 'power2.out'
                            })
                        }
                        
                        // Déplacer l'élément qui suit la souris
                        if (mouseFollowerRef.current) {
                            gsap.to(mouseFollowerRef.current, {
                                x: e.clientX,
                                y: e.clientY,
                                duration: 0.2,
                                ease: 'power1.out'
                            })
                        }
                    }
                    
                    // Ajouter et nettoyer l'écouteur d'événement
                    if (heroRef.current) {
                        heroRef.current.addEventListener('mousemove', handleMouseMove)
                    }
                    
                    return () => {
                        if (heroRef.current) {
                            heroRef.current.removeEventListener('mousemove', handleMouseMove)
                        }
                    }
                }, heroRef)
            } catch (error) {
                console.error('Erreur lors de l\'initialisation des animations GSAP:', error)
            }
        }
        
        setupGSAP()

        return () => {
            if (ctx) ctx.revert() // Nettoyer les animations
        }
    }, [])
    
    // Fonction pour le défilement vers le bas
    const scrollToNextSection = () => {
        if (heroRef.current) {
            const nextSection = heroRef.current.nextElementSibling as HTMLElement
            if (nextSection) {
                window.scrollTo({
                    top: nextSection.offsetTop,
                    behavior: 'smooth'
                })
            }
        }
    }

    return (
        <section 
            ref={heroRef} 
            className="relative py-20 md:py-32 lg:py-40 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
        >
            {/* Effet de grain */}
            <div className="absolute inset-0 bg-noise opacity-20 dark:opacity-30 pointer-events-none" />

            {/* Élément suivant la souris */}
            <div 
                ref={mouseFollowerRef}
                className="fixed w-32 h-32 pointer-events-none opacity-10 -ml-16 -mt-16 rounded-full bg-gradient-to-br from-zinc-900/20 to-zinc-900/5 dark:from-zinc-100/20 dark:to-zinc-100/5 blur-xl"
                style={{ zIndex: 5 }}
            />
            
            {/* Arrière-plan avec superposition */}
            <div className="hero-bg absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-950/50 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200/5 via-transparent to-zinc-200/5 dark:from-zinc-700/5 dark:via-transparent dark:to-zinc-700/5 opacity-[0.05] z-20 hero-parallax" />
            </div>

            {/* Contenu principal */}
            <div className="hero-content relative z-10 flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4">
                {/* Logo */}
                <div ref={logoRef} className="hero-logo opacity-0 w-full max-w-[350px] mx-auto mb-12 relative">
                    <div className="relative">
                        <Image
                            src={logoSource}
                            alt="REBOUL"
                            width={350}
                            height={105}
                            className="w-full h-auto relative z-10"
                            priority
                            quality={100}
                        />
                        
                        {/* Effet de brillance derrière le logo */}
                        <div className="absolute inset-0 -z-10 blur-2xl opacity-20 dark:opacity-30 bg-gradient-to-r from-zinc-200/0 via-zinc-300/80 to-zinc-200/0 dark:from-zinc-700/0 dark:via-zinc-600/80 dark:to-zinc-700/0" />
                    </div>
                </div>

                {/* Boutons */}
                <div ref={buttonsRef} className="hero-buttons flex flex-col sm:flex-row items-center gap-4 md:gap-6 opacity-0">
                    <motion.div 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto"
                    >
                        <Button 
                            asChild 
                            className="bg-gradient-to-r from-zinc-950 to-zinc-900 hover:from-zinc-900 hover:to-zinc-800 
                                dark:from-zinc-50 dark:to-zinc-100 dark:hover:from-zinc-100 dark:hover:to-zinc-200 
                                text-white dark:text-zinc-950
                                hover:text-white dark:hover:text-zinc-950
                                transition-all duration-300
                                h-12 md:h-14 px-8 w-full sm:w-auto text-[11px] md:text-[12px] tracking-[0.2em] font-light uppercase
                                shadow-lg shadow-zinc-200/20 dark:shadow-zinc-900/20
                                hover:shadow-xl hover:shadow-zinc-200/30 dark:hover:shadow-zinc-900/30"
                        >
                            <Link href="/catalogue" className="flex items-center gap-2">
                                Explorer la collection
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </motion.div>
                    <motion.div 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto"
                    >
                        <Button 
                            asChild 
                            variant="outline"
                            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
                                text-zinc-950 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700
                                hover:bg-zinc-950 hover:text-white hover:border-zinc-950
                                dark:hover:bg-zinc-50 dark:hover:text-zinc-950 dark:hover:border-zinc-50
                                transition-all duration-300 h-12 md:h-14 px-8 w-full sm:w-auto 
                                text-[11px] md:text-[12px] tracking-[0.2em] font-light uppercase
                                shadow-lg shadow-zinc-200/10 dark:shadow-zinc-900/10
                                hover:shadow-xl hover:shadow-zinc-200/20 dark:hover:shadow-zinc-900/20"
                        >
                            <Link href="/about" className="flex items-center gap-2">
                                Notre histoire
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
                
            </div>
        </section>
    )
} 