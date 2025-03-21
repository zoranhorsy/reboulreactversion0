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
    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {ADVANTAGES.map((advantage, index) => {
                const Icon = advantage.icon
                return (
                    <motion.div
                        key={advantage.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="group relative"
                    >
                        <div className={cn(
                            "flex flex-col items-center text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl",
                            "bg-white dark:bg-zinc-950",
                            "shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.2)]",
                            "hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.3)]",
                            "border border-zinc-200 dark:border-zinc-800",
                            "transition-all duration-300"
                        )}>
                            <div className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2 sm:mb-3 md:mb-4 rounded-full",
                                "bg-zinc-100 dark:bg-zinc-900/50",
                                "flex items-center justify-center",
                                "group-hover:scale-110 group-hover:rotate-[5deg]",
                                "transition-all duration-300"
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7",
                                    "text-zinc-900 dark:text-zinc-100",
                                    "group-hover:text-primary dark:group-hover:text-primary",
                                    "transition-colors"
                                )} />
                            </div>
                            <h3 className="font-geist text-sm sm:text-base md:text-lg font-medium text-zinc-900 dark:text-white mb-1 sm:mb-2">
                                {advantage.title}
                            </h3>
                            <p className="font-geist text-xs leading-tight sm:leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-[90%] mx-auto">
                                {advantage.description}
                            </p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
} 