
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovering, setIsHovering] = useState(false)
    const [isZoomed, setIsZoomed] = useState(false)

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div
            className="relative w-full h-[calc(100vh-4rem)] bg-white overflow-hidden cursor-zoom-in"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setIsZoomed(!isZoomed)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full w-full"
                >
                    <Image
                        src={images[currentImageIndex]}
                        alt={`${productName} - Image ${currentImageIndex + 1}`}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-300",
                            isZoomed ? "scale-150" : "scale-100"
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation areas */}
            <div
                className="absolute left-0 top-0 w-1/2 h-full cursor-w-resize"
                onClick={(e) => { e.stopPropagation(); previousImage(); }}
            />
            <div
                className="absolute right-0 top-0 w-1/2 h-full cursor-e-resize"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
            />

            {/* Controls (only visible on hover) */}
            <AnimatePresence>
                {isHovering && !isZoomed && (
                    <>
                        {/* Navigation buttons */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); previousImage(); }}
                                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm pointer-events-auto text-black/50 hover:text-black/70"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm pointer-events-auto text-black/50 hover:text-black/70"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </motion.div>

                        {/* Image counter */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-4 left-4 text-xs text-black/50 font-light tracking-wider"
                        >
                            {currentImageIndex + 1} / {images.length}
                        </motion.div>

                        {/* Zoom button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-4 right-4"
                        >
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                        <span className="sr-only">Zoom</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                                    <DialogTitle className="sr-only">{`${productName} - Vue agrandie`}</DialogTitle>
                                    <DialogDescription className="sr-only">Image agrandie du produit</DialogDescription>
                                    <div className="relative w-full h-[90vh]">
                                        <Image
                                            src={images[currentImageIndex]}
                                            alt={`${productName} - Vue agrandie`}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                                            priority
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "w-1 h-1 rounded-full transition-all duration-300",
                            index === currentImageIndex ? "bg-black/70" : "bg-black/30"
                        )}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    />
                ))}
            </div>
        </div>
    )
}

