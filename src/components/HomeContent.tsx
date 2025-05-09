'use client'

import React, { useEffect, useRef } from 'react'
import { HeroSection } from './HeroSection'
import { DynamicStoreSelection, DynamicLatestCollections } from './dynamic-imports'
import { LazyLoadWrapper } from './LazyLoadWrapper'
import { FeaturedProducts } from './FeaturedProducts'
import { RandomAdultProducts } from './RandomAdultProducts'
import { RandomSneakersProducts } from './RandomSneakersProducts'
import { RandomKidsProducts } from './RandomKidsProducts'
import { TheCornerShowcase } from './TheCornerShowcase'
import { Archives } from './Archives'
import { Advantages } from './Advantages'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import Link from 'next/link'
import { gsap } from 'gsap'
import { initGSAP } from '@/lib/gsap-config'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

// Définition des types pour GSAP
type GSAPContextType = ReturnType<typeof gsap.context> | null;
type ScrollTriggerType = any;

export function HomeContent() {
    const mainRef = useRef<HTMLDivElement>(null)
    
    // Configuration initiale de GSAP et ScrollTrigger
    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger)
        
        let ctx: GSAPContextType = null;
        
        const setupGSAP = async () => {
            try {
                // Initialiser GSAP de manière dynamique
                const { gsap, ScrollTrigger } = await initGSAP()
                
                // Créer le contexte GSAP pour nettoyer correctement
                ctx = gsap.context(() => {
                    // ===== OPTIMISATION: UTILISATION DE TIMELINES POUR GROUPER LES ANIMATIONS =====
                    
                    // Timeline principale pour la séquence d'entrée
                    const mainTimeline = gsap.timeline({ delay: 0.3 })
                    
                    // ===== ANIMATIONS DES SECTIONS AU SCROLL =====
                    const sections = gsap.utils.toArray<HTMLElement>('.gsap-section')
                    sections.forEach((section, i) => {
                        // Animation de base pour chaque section avec délai croissant par section
                        gsap.set(section, { 
                            opacity: 0, 
                            y: 50 
                        })
                        
                        // Créer une timeline dédiée pour chaque section
                        const sectionTL = gsap.timeline({
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                                toggleActions: "play none none none", // plus réactif
                                once: true
                            }
                        })
                        
                        sectionTL.to(section, {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power2.out",
                            clearProps: "transform" // amélioration des performances
                        })
                    })
                    
                    // ===== ANIMATIONS DES TITRES =====
                    const titles = gsap.utils.toArray<HTMLElement>('.gsap-title')
                    titles.forEach((title) => {
                        const titleTL = gsap.timeline({
                            scrollTrigger: {
                                trigger: title,
                                start: "top 90%",
                                once: true
                            }
                        })
                        
                        titleTL.fromTo(title, 
                            { opacity: 0, y: 20 },
                            { 
                                opacity: 1, 
                                y: 0, 
                                duration: 0.7,
                                ease: "power3.out",
                                clearProps: "transform"
                            }
                        )
                    })
                    
                    // ===== ANIMATIONS PARALLAXES AMÉLIORÉES =====
                    const parallaxElements = gsap.utils.toArray<HTMLElement>('.gsap-parallax')
                    parallaxElements.forEach((element) => {
                        gsap.fromTo(element,
                            { y: 0 },
                            {
                                y: -50,
                                ease: "none",
                                scrollTrigger: {
                                    trigger: element.parentElement,
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: 0.8, // Plus fluide
                                    invalidateOnRefresh: true // Recalcule lors du redimensionnement
                                }
                            }
                        )
                    })
                    
                    // ===== ANIMATION STAGGERED POUR LES CARTES ET IMAGES =====
                    // Animation des cartes avec effet cascade
                    const productCards = gsap.utils.toArray<HTMLElement>('.product-card')
                    if (productCards.length) {
                        productCards.forEach((cardGroup) => {
                            const cards = gsap.utils.toArray<HTMLElement>(cardGroup.querySelectorAll('.card-item'))
                            
                            if (cards.length) {
                                gsap.set(cards, { opacity: 0, y: 30 })
                                
                                ScrollTrigger.create({
                                    trigger: cardGroup,
                                    start: "top 85%",
                                    onEnter: () => {
                                        gsap.to(cards, {
                                            opacity: 1,
                                            y: 0,
                                            duration: 0.5,
                                            stagger: 0.08, // Effet cascade
                                            ease: "power2.out",
                                            clearProps: "transform"
                                        })
                                    },
                                    once: true
                                })
                            }
                        })
                    }
                    
                    // Timeline pour la section The Corner
                    const cornerTimeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.the-corner-section',
                            start: 'top 80%',
                            end: 'bottom 20%',
                            toggleActions: 'play none none reverse',
                        }
                    })

                    cornerTimeline
                        .from('.the-corner-section .title', {
                            y: 50,
                            opacity: 0,
                            duration: 0.8,
                            ease: 'power3.out'
                        })
                        .from('.the-corner-section .description', {
                            y: 30,
                            opacity: 0,
                            duration: 0.6,
                            ease: 'power3.out'
                        }, '-=0.4')
                        .from('.the-corner-section .link', {
                            y: 20,
                            opacity: 0,
                            duration: 0.5,
                            ease: 'power3.out'
                        }, '-=0.3')
                }, mainRef) // Portée au niveau du ref principal
            } catch (error) {
                console.error('Erreur lors de la configuration de GSAP:', error)
            }
        }
        
        setupGSAP()
        
        // Cleanup
        return () => {
            if (ctx) ctx.revert()
        }
    }, [])

    return (
        <div ref={mainRef} className="relative">
            <HeroSection />
            <LazyLoadWrapper>
                <DynamicStoreSelection />
            </LazyLoadWrapper>
            <FeaturedProducts />
            <LazyLoadWrapper>
                <DynamicLatestCollections />
            </LazyLoadWrapper>
            <RandomAdultProducts />
            <RandomSneakersProducts />
            <RandomKidsProducts />
            <TheCornerShowcase />
            <Archives />
            <Advantages />
        </div>
    )
}