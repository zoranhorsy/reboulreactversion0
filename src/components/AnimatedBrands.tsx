'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import styles from './AnimatedBrands.module.css'

const brands = [
    {
        src: '/STONE_ISLAND_2_b.png',
        alt: 'Stone Island',
        width: 240,
        height: 240
    },
    {
        src: '/AUTRY_b.png',
        alt: 'Autry',
        width: 240,
        height: 100
    },
    {
        src: '/CP_1_b.png',
        alt: 'C.P. Company',
        width: 240,
        height: 120
    },
    {
        src: '/APC_b.png',
        alt: 'A.P.C.',
        width: 240,
        height: 80
    }
]

export function AnimatedBrands() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === brands.length - 3 ? 0 : prevIndex + 1
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? brands.length - 3 : prevIndex - 1
        )
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                nextSlide();
            }, 3000); // Change slide every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    return (
        <section className={`py-20 sm:py-28 ${styles.animatedBrands} bg-white`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                    02 MARQUES
                </h2>

                <div className="relative max-w-[1200px] mx-auto">
                    {/* Navigation Arrow - Left */}
                    <button
                        onClick={() => {
                            prevSlide();
                            setIsAutoPlaying(false);
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-12 z-10"
                        aria-label="Previous brand"
                    >
                        <Image
                            src="/Calque 1.png"
                            alt="Previous"
                            width={24}
                            height={24}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </button>

                    {/* Brands Slider */}
                    <div className="overflow-hidden px-4">
                        <motion.div
                            className="flex items-center justify-center gap-16 sm:gap-20"
                            animate={{
                                x: `${-currentIndex * 33.33}%`
                            }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut"
                            }}
                        >
                            {brands.map((brand, index) => (
                                <motion.div
                                    key={index}
                                    className="flex-shrink-0 w-[240px] flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                >
                                    <Image
                                        src={brand.src}
                                        alt={brand.alt}
                                        width={brand.width}
                                        height={brand.height}
                                        className="w-auto h-auto max-h-[100px] object-contain transition-all duration-300"
                                        priority
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Navigation Arrow - Right */}
                    <button
                        onClick={() => {
                            nextSlide();
                            setIsAutoPlaying(false);
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-12 rotate-180 z-10"
                        aria-label="Next brand"
                    >
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
        </section>
    )
}

