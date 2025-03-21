'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from './Footer.module.css'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
    const [mounted, setMounted] = useState(false)
    const { theme, resolvedTheme } = useTheme()
    
    useEffect(() => {
        setMounted(true)
    }, [])
    
    // Déterminer le logo à utiliser en fonction du thème
    const logoSrc = mounted && (theme === 'dark' || resolvedTheme === 'dark') 
        ? "/logo_w.png" 
        : "/logo_black.png"
        
    return (
        <footer className="bg-background dark:bg-black border-t border-border dark:border-zinc-800 overflow-hidden relative">
            {/* Parallax effect background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute right-[-10%] bottom-[-10%] w-[40%] h-[40%] rounded-full border border-primary"></div>
                <div className="absolute left-[-5%] top-[-10%] w-[30%] h-[30%] rounded-full border border-primary"></div>
            </div>
            
            <div className="container mx-auto px-5 sm:px-6 py-12 md:py-16 lg:py-20">
                {/* Main Footer Grid - Responsive pour toutes tailles d'écran */}
                <div className="grid grid-cols-1 gap-y-10 sm:gap-y-12 md:grid-cols-2 md:gap-8 lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
                    {/* Logo Column */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center md:items-start lg:col-span-3 xl:col-span-3"
                    >
                        <div className="mb-6 md:mb-8 w-full max-w-[180px] md:max-w-[220px]">
                            {mounted && (
                                <Image
                                    src={logoSrc}
                                    alt="Reboul"
                                    width={240}
                                    height={240}
                                    className="w-full h-auto opacity-90 hover:opacity-100 transition-all duration-300"
                                    priority
                                />
                            )}
                        </div>
                        
                        <div className="flex items-center justify-center md:justify-start space-x-5 my-6">
                            <Link href="https://instagram.com" target="_blank" className="text-muted-foreground/70 hover:text-primary transition-colors duration-300">
                                <Instagram size={18} />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="https://facebook.com" target="_blank" className="text-muted-foreground/70 hover:text-primary transition-colors duration-300">
                                <Facebook size={18} />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="https://twitter.com" target="_blank" className="text-muted-foreground/70 hover:text-primary transition-colors duration-300">
                                <Twitter size={18} />
                                <span className="sr-only">Twitter</span>
                            </Link>
                        </div>
                        
                        {/* Nav Links pour desktop/tablette */}
                        <div className="hidden md:flex md:mt-8 space-x-4 text-xs">
                            <Link href="/mentions-legales" className="text-muted-foreground/70 hover:text-primary transition-colors">
                                Mentions légales
                            </Link>
                            <span className="text-muted-foreground/40">•</span>
                            <Link href="/cgv" className="text-muted-foreground/70 hover:text-primary transition-colors">
                                CGV
                            </Link>
                        </div>
                        
                        <p className="text-xs tracking-wider mt-6 md:mt-auto text-muted-foreground/60 text-center md:text-left">
                            &copy; 2025 Reboul. Tous droits réservés
                        </p>
                    </motion.div>

                    {/* Concept Store Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left lg:col-span-5 xl:col-span-5"
                    >
                        <h2 className={`text-lg md:text-xl tracking-[0.3em] mb-5 md:mb-8 font-light text-primary/90 ${styles.title}`}>
                            CONCEPT STORE
                        </h2>
                        <div className="space-y-6 md:space-y-8 text-sm leading-loose text-muted-foreground/80">
                            <p className="tracking-wide max-w-md mx-auto md:mx-0">
                                REBOUL REDÉFINIT LE SHOPPING EN OFFRANT UNE EXPÉRIENCE UNIQUE ET UNE SÉLECTION
                                DIVERSIFIÉE DE PRODUITS, MÊLANT LES PRINCIPAUX STYLES DE LA MODE
                                CONTEMPORAINE.
                            </p>
                            <p className="tracking-wide max-w-md mx-auto md:mx-0">
                                UN HÔTEL DANS LE THÈME DE NOS MARQUES, UN CAFÉ, UNE
                                TERRASSE INTÉRIEURE ET UN SERVICE DE RETOUCHE
                                SUR MESURE POUR UN ACCOMPAGNEMENT EXCLUSIF.
                            </p>
                        </div>
                        
                        {/* Contact rapide - visible uniquement sur tablette/médium */}
                        <div className="hidden md:flex lg:hidden flex-col items-start mt-8 space-y-2">
                            <div className="flex items-center text-xs text-muted-foreground/70">
                                <Phone size={14} className="mr-2" />
                                <span>04 91 XX XX XX</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground/70">
                                <Mail size={14} className="mr-2" />
                                <span>contact@reboul.fr</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Addresses Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-center md:text-left lg:col-span-4 xl:col-span-4"
                    >
                        <h2 className={`text-lg md:text-xl tracking-[0.3em] mb-5 md:mb-8 font-light text-primary/90 ${styles.title}`}>
                            ADRESSES
                        </h2>
                        <div className="space-y-5 md:space-y-6 text-xs md:text-sm tracking-wide text-muted-foreground/80">
                            <div className="group cursor-pointer transition-all duration-300 hover:translate-x-1">
                                <p className="font-medium mb-1 text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                    REBOUL
                                </p>
                                <p className="transition-opacity duration-300 flex items-center justify-center md:justify-start">
                                    <MapPin size={12} className="mr-1 opacity-70" />
                                    MARSEILLE - 523 RUE PARADIS
                                </p>
                            </div>
                            <div className="group cursor-pointer transition-all duration-300 hover:translate-x-1">
                                <p className="font-medium mb-1 text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                    REBOUL STORE
                                </p>
                                <p className="transition-opacity duration-300 flex items-center justify-center md:justify-start">
                                    <MapPin size={12} className="mr-1 opacity-70" />
                                    CASSIS - 7 AVENUE VICTOR HUGO
                                </p>
                            </div>
                            <div className="group cursor-pointer transition-all duration-300 hover:translate-x-1">
                                <p className="font-medium mb-1 text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                    REBOUL UTILITY
                                </p>
                                <p className="transition-opacity duration-300 flex items-center justify-center md:justify-start">
                                    <MapPin size={12} className="mr-1 opacity-70" />
                                    SANARY - 16 RUE GAILLARD
                                </p>
                            </div>
                            
                            <div className="w-12 h-[1px] bg-border dark:bg-zinc-700 opacity-50 mx-auto md:mx-0 my-2 md:my-3"></div>
                            
                            <div className="group cursor-pointer transition-all duration-300 hover:translate-x-1">
                                <p className="font-medium mb-1 text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                    THE CORNER C.P.COMPANY
                                </p>
                                <p className="transition-opacity duration-300 flex items-center justify-center md:justify-start">
                                    <MapPin size={12} className="mr-1 opacity-70" />
                                    MARSEILLE - 376 AVENUE DU PRADO
                                </p>
                            </div>
                        </div>
                        
                        {/* Contact rapide - visible uniquement sur desktop/large */}
                        <div className="hidden lg:flex flex-col items-start mt-8 space-y-2">
                            <div className="flex items-center text-xs text-muted-foreground/70">
                                <Phone size={14} className="mr-2" />
                                <span>04 91 XX XX XX</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground/70">
                                <Mail size={14} className="mr-2" />
                                <span>contact@reboul.fr</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Mobile Nav Links */}
                <div className="mt-10 pt-6 border-t border-border/30 dark:border-zinc-800/30 md:hidden">
                    <div className="grid grid-cols-2 gap-3 text-xs text-center">
                        <Link href="/mentions-legales" className="py-2 text-muted-foreground/70 hover:text-primary transition-colors">
                            Mentions légales
                        </Link>
                        <Link href="/cgv" className="py-2 text-muted-foreground/70 hover:text-primary transition-colors">
                            CGV
                        </Link>
                        <Link href="/confidentialite" className="py-2 text-muted-foreground/70 hover:text-primary transition-colors">
                            Confidentialité
                        </Link>
                        <Link href="/contact" className="py-2 text-muted-foreground/70 hover:text-primary transition-colors">
                            Contact
                        </Link>
                    </div>
                    
                    {/* Contact mobile */}
                    <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-border/10 dark:border-zinc-800/10">
                        <div className="flex items-center text-xs text-muted-foreground/70">
                            <Phone size={14} className="mr-1.5" />
                            <span>04 91 XX XX XX</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground/70">
                            <Mail size={14} className="mr-1.5" />
                            <span>contact@reboul.fr</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

