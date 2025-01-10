'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import styles from './FeaturedProducts.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Product {
    id: string;
    brand: string;
    name: string;
    price: number;
    images?: string[];
    image_url?: string;
}

export function FeaturedProducts() {
    const [isClient, setIsClient] = useState(false)
    const { products, isLoading, error } = useProducts(1, 6)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === Math.max(0, Math.ceil(products.length / 3) - 1) ? 0 : prevIndex + 1
        )
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? Math.max(0, Math.ceil(products.length / 3) - 1) : prevIndex - 1
        )
    }

    // Helper function to get the product image URL
    const getProductImageUrl = (product: Product) => {
        if (product.images && product.images.length > 0) {
            return product.images[0]
        }
        if (product.image_url) {
            return `${API_URL}/uploads/${product.image_url}`
        }
        return '/placeholder.jpg'
    }

    if (!isClient || isLoading) {
        return (
            <div className="py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                        03 EN VEDETTE
                    </h2>
                    <div className="animate-pulse bg-gray-200 rounded-3xl h-[400px]"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                        03 EN VEDETTE
                    </h2>
                    <div className="text-center text-red-500">
                        Erreur lors du chargement des produits
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className={`py-20 sm:py-28 mb-16 ${styles.featuredProducts}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className={`text-2xl sm:text-3xl font-light mb-20 tracking-wider ${styles.title}`}>
                    03 EN VEDETTE
                </h2>

                <div className="relative max-w-[1200px] mx-auto">
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-12 z-10"
                    >
                        <Image
                            src="/Calque 1.png"
                            alt="Previous"
                            width={24}
                            height={24}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </button>

                    <div className="overflow-hidden px-4 h-[450px]">
                        <motion.div
                            className="flex gap-4"
                            animate={{
                                x: `${-currentIndex * 100}%`
                            }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut"
                            }}
                        >
                            {products.map((product) => (
                                <div key={product.id} className="flex-shrink-0 w-1/3 px-2">
                                    <Link href={`/produit/${product.id.toString()}`}>
                                        <div className="bg-white rounded-2xl shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                                            <div className="aspect-[4/3] relative overflow-hidden rounded-t-2xl">
                                                <Image
                                                    src={getProductImageUrl(product)}
                                                    alt={`${product.brand} ${product.name}`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    onError={() => {
                                                        // Handle image error
                                                    }}
                                                />
                                            </div>
                                            <div className="p-4 flex flex-col justify-between h-[150px]">
                                                <div>
                                                    <h3 className="text-sm font-medium uppercase">{product.brand}</h3>
                                                    <p className="text-xs text-gray-600 mt-1">{product.name}</p>
                                                </div>
                                                <p className="text-sm font-medium mt-2">{product.price} €</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 transform translate-x-12 rotate-180 z-10"
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

