'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutContent() {
    return (
        <div className="container mx-auto px-4 py-8">
            <motion.h1
                className="text-4xl font-bold mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                À propos de Reboul
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Image
                        src="/images/store-front.jpg"
                        alt="Devanture du magasin Reboul"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
                    <p className="mb-4">
                        Fondée en 2010 à Marseille, Reboul est née de la passion de deux amis d&apos;enfance pour la mode et le style urbain. Ce qui a commencé comme un petit magasin local s&apos;est rapidement transformé en une référence incontournable pour les amateurs de vêtements premium et de streetwear de qualité.
                    </p>
                    <p>
                        Au fil des années, nous avons élargi notre gamme de produits tout en restant fidèles à notre engagement envers la qualité et l&apos;authenticité. Aujourd&apos;hui, Reboul est fier de proposer une sélection soigneusement curatée des meilleures marques internationales, tout en soutenant les créateurs locaux émergents.
                    </p>
                </motion.div>
            </div>

            <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h2 className="text-2xl font-semibold mb-4">Notre Mission</h2>
                <p>
                    Chez Reboul, notre mission est de fournir à nos clients une expérience de shopping unique, alliant style, qualité et service personnalisé. Nous croyons que la mode est une forme d&apos;expression personnelle, et nous nous efforçons d&apos;aider chacun à trouver les pièces qui reflètent sa personnalité et son style de vie.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { title: "Qualité", description: "Nous sélectionnons méticuleusement chaque article pour garantir la meilleure qualité à nos clients." },
                    { title: "Style", description: "Notre collection reflète les dernières tendances tout en offrant des pièces intemporelles." },
                    { title: "Service", description: "Notre équipe passionnée est toujours prête à vous conseiller et à vous aider dans vos choix." }
                ].map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{item.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
            >
                <h2 className="text-2xl font-semibold mb-4">Visitez-nous</h2>
                <p>
                    Nous vous invitons à venir découvrir notre boutique au cœur de Marseille. Notre équipe sera ravie de vous accueillir et de vous faire découvrir notre collection.
                </p>
                <p className="mt-4">
                    <strong>Adresse :</strong> 123 Rue de la Mode, 13001 Marseille<br />
                    <strong>Horaires :</strong> Du lundi au samedi, de 10h à 19h
                </p>
            </motion.div>
        </div>
    )
}

