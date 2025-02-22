import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STORES = [
    {
        id: 'adulte',
        title: 'ADULTE',
        image: '/images/adult-bg.jpg',
        href: '/catalogue?store_type=adult',
        description: 'Mode contemporaine'
    },
    {
        id: 'minots',
        title: 'MINOTS',
        image: '/images/kids-bg.jpg',
        href: '/catalogue?store_type=kids',
        description: 'Collection enfant'
    },
    {
        id: 'sneakers',
        title: 'SNEAKERS',
        image: '/images/sneakers-bg.jpg',
        href: '/catalogue?store_type=sneakers',
        description: 'Édition limitée'
    },
    {
        id: 'cpcompany',
        title: 'C.P COMPANY',
        image: '/CP_2_b.png',
        href: '/catalogue?store_type=cpcompany',
        description: 'Boutique C.P COMPANY'
    }
]

export function StoreSelection() {
    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-4 h-[90vh] bg-background">
            {STORES.map((store, index) => (
                <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="relative h-full"
                >
                    <Link 
                        href={store.href} 
                        className="group relative block w-full h-full overflow-hidden"
                    >
                        {/* Image avec overlay */}
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={store.image}
                                alt={store.title}
                                fill
                                className="object-cover transition-all duration-700 
                                    group-hover:scale-105 brightness-[0.85] group-hover:brightness-100"
                                sizes="(max-width: 768px) 100vw, 25vw"
                                priority
                                quality={90}
                            />
                            <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 
                                group-hover:bg-black/20" />
                        </div>
                        
                        {/* Contenu */}
                        <div className="relative h-full z-10 flex flex-col items-center justify-center p-6 
                            transition-transform duration-500 group-hover:translate-y-[-8px]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.2 }}
                                className="text-center"
                            >
                                <h2 className="font-geist text-2xl md:text-3xl font-light tracking-[0.2em] text-white mb-4">
                                    {store.title}
                                </h2>
                                <p className="font-geist text-xs tracking-[0.15em] text-white/80 
                                    transform transition-all duration-500 
                                    opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                                    {store.description}
                                </p>
                            </motion.div>
                        </div>

                        {/* Bordure animée */}
                        <div className="absolute inset-0 border border-white/0 transition-all duration-500 
                            group-hover:border-white/20" />
                    </Link>
                </motion.div>
            ))}
        </section>
    )
} 