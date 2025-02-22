'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ProductGalleryProps {
    images: (string | File | Blob)[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const getImageUrl = (image: string | File | Blob): string => {
        if (typeof image === 'string') {
            if (image.startsWith('http')) return image
            if (image.startsWith('/')) return image
            return `/uploads/${image}`
        }
        return URL.createObjectURL(image)
    }

    const handlePrevious = () => {
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNext = () => {
        setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }

    return (
        <>
            <div className="h-full w-full">
                {/* Image principale */}
                <div className="relative h-full group">
                    <div 
                        className="relative w-full h-full cursor-zoom-in bg-zinc-100 dark:bg-zinc-900"
                        onClick={() => setIsFullscreen(true)}
                    >
                        <motion.div
                            key={currentImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={getImageUrl(images[currentImage])}
                                alt={`${productName} - Vue principale`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                priority
                                quality={95}
                            />
                        </motion.div>

                        {/* Boutons de navigation */}
                        {images.length > 1 && (
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePrevious()
                                        }}
                                        className="rounded-full p-2 bg-white/90 backdrop-blur-sm hover:bg-white 
                                            dark:bg-black/50 dark:hover:bg-black/70
                                            shadow-lg transform hover:scale-105 transition-all"
                                        aria-label="Image précédente"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                                        {currentImage + 1} / {images.length}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleNext()
                                        }}
                                        className="rounded-full p-2 bg-white/90 backdrop-blur-sm hover:bg-white 
                                            dark:bg-black/50 dark:hover:bg-black/70
                                            shadow-lg transform hover:scale-105 transition-all"
                                        aria-label="Image suivante"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal plein écran */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
                    <div className="relative w-full h-[90vh]">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 z-50 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full h-full">
                            <Image
                                src={getImageUrl(images[currentImage])}
                                alt={`${productName} - Vue principale`}
                                fill
                                className="object-contain"
                                quality={100}
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>

                                {/* Miniatures en bas */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                    <div className="flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImage(index)}
                                                className={`relative w-16 aspect-[4/3] rounded-lg overflow-hidden
                                                    ${currentImage === index 
                                                        ? 'ring-2 ring-white scale-95' 
                                                        : 'hover:ring-1 ring-white/50 hover:scale-105'}
                                                    transition-all duration-200`}
                                            >
                                                <Image
                                                    src={getImageUrl(image)}
                                                    alt={`${productName} - Miniature ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

