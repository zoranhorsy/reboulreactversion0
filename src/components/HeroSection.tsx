'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function HeroSection() {
    const heroRef = useRef<HTMLElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)
    const buttonsRef = useRef<HTMLDivElement>(null)
    
    const { resolvedTheme } = useTheme()
    const [logoSource, setLogoSource] = useState("/images/logotype_w.png")
    const [animationsInitialized, setAnimationsInitialized] = useState(false)

    // Changer la source du logo en fonction du thème
    useEffect(() => {
        if (resolvedTheme) {
            setLogoSource(resolvedTheme === 'dark' ? "/images/logotype_w.png" : "/images/logotype_b.png")
        }
    }, [resolvedTheme])

    // Initialiser les animations GSAP APRÈS le premier rendu
    useEffect(() => {
        // Marquer le contenu critique comme visible immédiatement
        if (logoRef.current) {
            logoRef.current.style.opacity = "1"
        }
        if (buttonsRef.current) {
            buttonsRef.current.style.opacity = "1"
        }

        // Reporter le chargement des animations non critiques
        const timer = setTimeout(async () => {
            if (animationsInitialized) return
            
            try {
                // Import dynamique de GSAP après le chargement initial
                const { gsap } = await import('gsap')
                const ScrollTriggerModule = await import('gsap/ScrollTrigger')
                const { ScrollTrigger } = ScrollTriggerModule
                
                // Enregistrer le plugin
                gsap.registerPlugin(ScrollTrigger)
                
                // Initialiser les animations seulement après le chargement initial
                const ctx = gsap.context(() => {
                    // Animation de l'élément suivant la souris (non critique)
                    const handleMouseMove = (e: MouseEvent) => {
                        if (!heroRef.current) return
                        
                        // Alléger les calculs en limitant la fréquence des mises à jour
                        requestAnimationFrame(() => {
                            const mouseFollower = document.querySelector('.mouse-follower') as HTMLElement
                            if (mouseFollower) {
                                gsap.to(mouseFollower, {
                                    x: e.clientX,
                                    y: e.clientY,
                                    duration: 0.5,
                                    ease: 'power2.out'
                                })
                            }
                        })
                    }
                    
                    // Ajouter l'écouteur d'événement avec limitation
                    if (heroRef.current) {
                        // Utiliser un écouteur d'événement avec throttle
                        let lastTime = 0
                        const throttledMouseMove = (e: MouseEvent) => {
                            const now = Date.now()
                            if (now - lastTime >= 50) { // Limiter à 20fps
                                lastTime = now
                                handleMouseMove(e)
                            }
                        }
                        
                        heroRef.current.addEventListener('mousemove', throttledMouseMove)
                    }
                    
                    return () => {
                        if (heroRef.current) {
                            heroRef.current.removeEventListener('mousemove', handleMouseMove)
                        }
                    }
                }, heroRef)
                
                setAnimationsInitialized(true)
                
                return () => {
                    ctx.revert() // Nettoyer les animations
                }
            } catch (error) {
                console.error('Erreur lors de l\'initialisation des animations GSAP:', error)
            }
        }, 1000) // Attendre 1 seconde après le chargement initial
        
        return () => clearTimeout(timer)
    }, [animationsInitialized])

    return (
        <section 
            ref={heroRef} 
            className="relative py-20 md:py-32 lg:py-40 w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950"
        >
            {/* Effet de grain - Rendu en CSS plutôt qu'en image */}
            <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

            {/* Élément suivant la souris - Ajouté de manière conditionnelle après le chargement initial */}
            {animationsInitialized && (
                <div 
                    className="mouse-follower fixed w-32 h-32 pointer-events-none opacity-10 -ml-16 -mt-16 rounded-full bg-gradient-to-br from-zinc-900/20 to-zinc-900/5 dark:from-zinc-100/20 dark:to-zinc-100/5 blur-xl"
                    style={{ zIndex: 5, transform: 'translate(-100%, -100%)' }}
                />
            )}
            
            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-full mx-auto px-4">
                {/* Logo - Priorité critique */}
                <div ref={logoRef} className="w-full mx-auto mb-20 relative opacity-0 transition-opacity duration-300 flex justify-center">
                    <div className="relative w-[900px] h-[270px] sm:w-[1400px] sm:h-[420px]">
                        <Image
                            src={logoSource}
                            alt="REBOUL"
                            width={1400}
                            height={420}
                            className="w-full h-full object-contain"
                            priority={true}
                            quality={100}
                            fetchPriority="high"
                            sizes="(max-width: 640px) 900px, 1400px"
                        />
                    </div>
                </div>

                {/* Boutons - Priorité critique */}
                <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 opacity-0 transition-opacity duration-300">
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