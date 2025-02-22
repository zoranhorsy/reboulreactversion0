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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map((advantage, index) => {
                const Icon = advantage.icon
                return (
                    <motion.div
                        key={advantage.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative"
                    >
                        <div className={cn(
                            "flex flex-col items-center text-center p-8 rounded-xl",
                            "bg-white dark:bg-zinc-900",
                            "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]",
                            "hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)]",
                            "border border-zinc-200 dark:border-zinc-800",
                            "transition-all duration-300"
                        )}>
                            <div className={cn(
                                "w-16 h-16 mb-6 rounded-full",
                                "bg-zinc-100 dark:bg-zinc-800/50",
                                "flex items-center justify-center",
                                "group-hover:scale-110 group-hover:rotate-[5deg]",
                                "transition-all duration-300"
                            )}>
                                <Icon className={cn(
                                    "w-8 h-8",
                                    "text-zinc-900 dark:text-zinc-100",
                                    "group-hover:text-primary dark:group-hover:text-primary",
                                    "transition-colors"
                                )} />
                            </div>
                            <h3 className="font-geist text-lg font-medium text-zinc-900 dark:text-white mb-3">
                                {advantage.title}
                            </h3>
                            <p className="font-geist text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {advantage.description}
                            </p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
} 