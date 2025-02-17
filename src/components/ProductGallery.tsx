'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)

    const handlePrevious = () => {
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNext = () => {
        setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }

    return (
        <div className="w-full space-y-2">
            {/* Image principale */}
            <div className="relative rounded-lg overflow-hidden bg-[#F5F5F5]">
                <div className="relative aspect-[3/2] w-full">
                    <Image
                        src={images[currentImage]}
                        alt={`${productName} - Vue principale`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        priority
                        quality={95}
                    />

                    {/* Boutons de navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-50 transition-colors"
                                aria-label="Image précédente"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-50 transition-colors"
                                aria-label="Image suivante"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
                <div className="grid grid-flow-col auto-cols-fr gap-2 max-w-full overflow-x-auto">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={`relative aspect-square w-20 rounded-lg overflow-hidden bg-[#F5F5F5] cursor-pointer
                                ${currentImage === index ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-gray-300'}
                                transition-all duration-200`}
                            onClick={() => setCurrentImage(index)}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - Miniature ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

