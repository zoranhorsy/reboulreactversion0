'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Shield, Users, TrendingUp, Truck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const ADVANTAGES = [
    {
        id: 'authenticity',
        icon: Shield,
        title: 'Authenticité garantie',
        description: 'Tous nos produits sont authentiques et proviennent directement des marques'
    },
    {
        id: 'expertise',
        icon: Users,
        title: 'Expertise',
        description: 'Une équipe de passionnés à votre service pour vous conseiller'
    },
    {
        id: 'selection',
        icon: ShoppingBag,
        title: 'Sélection exclusive',
        description: 'Les meilleures pièces des plus grandes marques'
    },
    {
        id: 'trends',
        icon: TrendingUp,
        title: 'Dernières tendances',
        description: 'Une sélection constamment mise à jour selon les tendances'
    },
    {
        id: 'shipping',
        icon: Truck,
        title: 'Livraison rapide',
        description: 'Livraison express disponible sur toute la France'
    },
    {
        id: 'service',
        icon: Clock,
        title: 'Service client',
        description: 'Une équipe disponible pour répondre à vos questions'
    }
]

export function Advantages() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                ease: [0.215, 0.61, 0.355, 1] // easeOutCubic
            }
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
            <motion.div 
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                    Nos Services
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    REBOUL redéfinit l&apos;expérience shopping en fusionnant l&apos;élégance traditionnelle 
                    avec les tendances contemporaines
                </p>
            </motion.div>

            <motion.div 
                className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {ADVANTAGES.map((advantage) => {
                    const Icon = advantage.icon
                    return (
                        <motion.div
                            key={advantage.id}
                            className="group relative"
                            variants={itemVariants}
                        >
                            <div className={cn(
                                "flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-2xl",
                                "bg-white dark:bg-zinc-900",
                                "border border-zinc-200 dark:border-zinc-800",
                                "hover:bg-zinc-900 hover:border-zinc-800 hover:shadow-lg",
                                "dark:hover:bg-white dark:hover:border-zinc-200 dark:hover:shadow-lg",
                                "relative overflow-hidden h-full",
                                "transition-all duration-300"
                            )}>
                                {/* Content */}
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className={cn(
                                        "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 rounded-lg",
                                        "bg-zinc-100 dark:bg-zinc-800",
                                        "flex items-center justify-center",
                                        "group-hover:bg-zinc-800 dark:group-hover:bg-zinc-100",
                                        "transition-all duration-300"
                                    )}>
                                        <Icon className={cn(
                                            "w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6",
                                            "text-zinc-700 dark:text-zinc-200",
                                            "group-hover:text-zinc-100 dark:group-hover:text-zinc-800"
                                        )} />
                                    </div>
                                    
                                    <h3 className="text-sm xs:text-base sm:text-lg font-medium 
                                        text-zinc-800 dark:text-zinc-100 mb-2
                                        group-hover:text-zinc-100 dark:group-hover:text-zinc-800">
                                        {advantage.title}
                                    </h3>
                                    
                                    <p className="text-xs sm:text-sm leading-relaxed
                                        text-zinc-600 dark:text-zinc-400
                                        group-hover:text-zinc-300 dark:group-hover:text-zinc-600">
                                        {advantage.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
} 