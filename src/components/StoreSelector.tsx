'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import styles from './StoreSelector.module.css'

const stores = [
    {
        name: 'Adulte',
        href: '/adulte',
        icon: '/Calque 3.png'
    },
    {
        name: 'Enfant',
        href: '/minots',
        icon: '/Calque 7.png'
    },
    {
        name: 'Sneakers',
        href: '/sneakers',
        icon: '/Calque 6.png'
    },
]

export function StoreSelector() {
    return (
        <section className={`py-16 sm:py-24 ${styles.storeSelector}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Title */}
                    <h2 className={`text-2xl sm:text-3xl font-light mb-12 tracking-wider ${styles.title}`}>
                        01 CATÉGORIES
                    </h2>

                    {/* Cards Grid */}
                    <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center">
                        {/* Navigation Arrow - Left */}
                        <button className="hidden sm:block absolute left-0 transform -translate-x-12">
                            <Image
                                src="/Calque 1.png"
                                alt="Previous"
                                width={24}
                                height={24}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            />
                        </button>

                        {/* Store Cards */}
                        {stores.map((store, index) => (
                            <motion.div
                                key={store.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1
                                }}
                                className="w-full sm:w-[300px]"
                            >
                                <Link
                                    href={store.href}
                                    className="block bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 aspect-[4/5] flex items-center justify-center"
                                >
                                    <Image
                                        src={store.icon}
                                        alt={store.name}
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 object-contain"
                                    />
                                </Link>
                            </motion.div>
                        ))}

                        {/* Navigation Arrow - Right */}
                        <button className="hidden sm:block absolute right-0 transform translate-x-12 rotate-180">
                            <Image
                                src="/Calque 1.png"
                                alt="Next"
                                width={24}
                                height={24}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

