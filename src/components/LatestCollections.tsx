'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'

const COLLECTIONS = [
    {
        id: 'stone-island-ss24',
        title: 'Stone Island SS24',
        description: 'Collection Printemps-Été 2024',
        image: '/collections/stone-island-ss24.jpg',
        href: '/catalogue?collection=stone-island-ss24'
    },
    {
        id: 'cp-company-ss24',
        title: 'C.P Company SS24',
        description: 'Collection Printemps-Été 2024',
        image: '/collections/cp-company-ss24.jpg',
        href: '/catalogue?collection=cp-company-ss24'
    },
    {
        id: 'nike-tech',
        title: 'Nike Tech',
        description: 'Collection Sportswear',
        image: '/collections/nike-tech.jpg',
        href: '/catalogue?collection=nike-tech'
    }
]

export function LatestCollections() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COLLECTIONS.map((collection, index) => (
                <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="group relative"
                >
                    <Link href={collection.href} className="block">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                            <Image
                                src={collection.image}
                                alt={collection.title}
                                fill
                                className="object-cover transition-transform duration-700 
                                    group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                quality={90}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                                opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                <h3 className="font-geist text-xl md:text-2xl font-light tracking-wide text-white mb-2">
                                    {collection.title}
                                </h3>
                                <p className="font-geist text-sm text-white/80 mb-6">
                                    {collection.description}
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full sm:w-auto font-geist text-xs tracking-[0.2em] uppercase font-light
                                        text-white border-white/20 hover:bg-white hover:text-zinc-900
                                        transition-all duration-300"
                                >
                                    <span className="flex items-center gap-2">
                                        Découvrir
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    )
} 