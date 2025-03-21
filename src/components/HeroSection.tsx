'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export function HeroSection() {
    const heroRef = useRef(null)
    const { resolvedTheme } = useTheme()
    const [logoSource, setLogoSource] = useState("/images/logo_white.png")

    useEffect(() => {
        if (resolvedTheme) {
            setLogoSource(resolvedTheme === 'dark' ? "/images/logo_white.png" : "/images/logo_black.png")
        }
    }, [resolvedTheme])

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mainTimeline = gsap.timeline({ delay: 0.1 })
            
            // Animation du logo
            mainTimeline.fromTo('.hero-logo',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
            )
            
            // Animation des boutons
            mainTimeline.fromTo('.hero-buttons',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
                '-=0.6'
            )
        })

        return () => ctx.revert()
    }, [])

    return (
        <section 
            ref={heroRef} 
            className="relative min-h-[60dvh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 py-8"
        >
            {/* Contenu principal */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-screen-xl mx-auto px-4">
                <div className="flex-1" />
                
                {/* Logo */}
                <div className="hero-logo opacity-0 w-full max-w-[400px] mx-auto mb-8">
                    <Image
                        src={logoSource}
                        alt="REBOUL"
                        width={400}
                        height={120}
                        className="w-full h-auto"
                        priority
                        quality={100}
                    />
                </div>

                {/* Boutons */}
                <div className="hero-buttons flex flex-col sm:flex-row items-center gap-4 md:gap-6 opacity-0">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto"
                    >
                        <Button 
                            asChild 
                            variant="default"
                            className="bg-foreground text-background hover:bg-foreground/90 transition-all duration-300
                                h-11 md:h-12 px-8 w-full sm:w-auto text-[11px] md:text-[12px] tracking-[0.2em] font-light uppercase
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
                            className="bg-transparent text-foreground border-foreground/20 
                                hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30
                                transition-all duration-300 h-11 md:h-12 px-8 w-full sm:w-auto 
                                text-[11px] md:text-[12px] tracking-[0.2em] font-light uppercase"
                        >
                            <Link href="/about" className="flex items-center gap-2">
                                Notre histoire
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                <div className="flex-1" />
            </div>
        </section>
    )
} 