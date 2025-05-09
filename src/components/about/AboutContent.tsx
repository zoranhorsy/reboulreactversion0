'use client'

import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Mail, Instagram, Facebook } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

export function AboutContent() {
    return (
        <div className="container mx-auto py-16 space-y-24">
            {/* En-tête */}
            <motion.div 
                className="text-center space-y-6"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <h1 className="text-4xl font-light uppercase tracking-[0.4em]">Notre Histoire</h1>
                <div className="w-24 h-px bg-primary mx-auto" />
                <p className="font-geist text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Chez REBOUL, nous croyons en l&apos;alliance parfaite entre style intemporel et tendances actuelles.
                    Notre boutique est un lieu où la mode rencontre l&apos;authenticité, offrant une expérience shopping unique
                    à Marseille depuis plus de 30 ans.
                </p>
            </motion.div>

            {/* Histoire et Valeurs */}
            <motion.div 
                className="grid md:grid-cols-2 gap-12 items-center"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={fadeIn} className="relative aspect-[4/5] rounded-xl overflow-hidden">
                    <Image
                        src="/about/store-front.jpg"
                        alt="Devanture de Reboul Store"
                        fill
                        className="object-cover"
                    />
                </motion.div>
                <motion.div variants={fadeIn} className="space-y-6">
                    <h2 className="text-2xl font-medium">L&apos;Esprit Streetwear</h2>
                    <p className="text-muted-foreground">
                        Établi au cœur de Marseille, Reboul Store est devenu un lieu emblématique pour les passionnés 
                        de streetwear et de sneakers. Notre sélection pointue de marques premium et notre expertise 
                        dans la culture urbaine nous permettent d&apos;offrir à notre clientèle les dernières tendances 
                        et les pièces les plus recherchées.
                    </p>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Emplacement</h3>
                                <p className="text-sm text-muted-foreground">Au cœur de Marseille</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">Horaires d&apos;Ouverture</h3>
                                <p className="text-sm text-muted-foreground">Du Lundi au Samedi, 10h-19h</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Nos Valeurs */}
            <motion.div 
                className="space-y-12"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={fadeIn} className="text-center space-y-6">
                    <h2 className="text-3xl font-light uppercase tracking-[0.3em]">Notre ADN</h2>
                    <div className="w-24 h-px bg-primary mx-auto" />
                </motion.div>
                <motion.div 
                    className="grid md:grid-cols-3 gap-8"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeIn}>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 7L10 17L5 12" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-center">Authenticité</h3>
                                <p className="text-muted-foreground text-center">
                                    Nous garantissons l&apos;authenticité de tous nos produits, 
                                    sélectionnés auprès des meilleures marques streetwear.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-center">Style</h3>
                                <p className="text-muted-foreground text-center">
                                    Une sélection pointue des dernières tendances streetwear 
                                    et des sneakers les plus recherchées.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={fadeIn}>
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-center">Culture</h3>
                                <p className="text-muted-foreground text-center">
                                    Plus qu&apos;une boutique, un lieu de rencontre pour les passionnés 
                                    de la culture streetwear et sneakers.
                                </p>
                                <p className="text-muted-foreground text-center">
                                    L&apos;authenticité de tous nos produits est garantie.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Contact */}
            <motion.div 
                className="bg-muted rounded-xl p-8 md:p-12"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div variants={fadeIn} className="space-y-6">
                        <h2 className="text-2xl font-medium">Contactez-nous</h2>
                        <p className="text-muted-foreground">
                            Notre équipe de passionnés est à votre disposition pour vous conseiller 
                            et vous aider à trouver les pièces qui vous correspondent.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-primary" />
                                <span>04 91 XX XX XX</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-primary" />
                                <span>contact@reboulstore.com</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>XX Rue XXXXX, 13001 Marseille</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link href="https://instagram.com/reboulstore" target="_blank">
                                <Button variant="outline" size="icon">
                                    <Instagram className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="https://facebook.com/reboulstore" target="_blank">
                                <Button variant="outline" size="icon">
                                    <Facebook className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div variants={fadeIn} className="relative aspect-video rounded-xl overflow-hidden">
                        <Image
                            src="/about/map.jpg"
                            alt="Carte de localisation"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}

