'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function AnimatedBrands() {
    const brands = [
        { src: '/placeholder.svg', alt: 'Stone Island' },
        { src: '/placeholder.svg', alt: 'CP Company' },
        { src: '/placeholder.svg', alt: 'Nike' },
        { src: '/placeholder.svg', alt: 'Adidas' },
    ]

    return (
        <div className="flex justify-around items-center space-x-4 overflow-hidden">
            {brands.map((brand, index) => (
                <motion.div
                    key={index}
                    className="animate-on-scroll brand-logo w-24 h-auto"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                    <Image src={brand.src} alt={brand.alt} width={100} height={50} />
                </motion.div>
            ))}
        </div>
    )
}

