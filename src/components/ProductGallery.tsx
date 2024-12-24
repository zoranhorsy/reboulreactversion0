'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { motion, AnimatePresence } from 'framer-motion'

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto">
            <Card>
                <CardContent className="p-0">
                    <Carousel className="w-full">
                        <CarouselContent>
                            <AnimatePresence mode="wait">
                                {images.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <motion.div
                                            className="relative aspect-square"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${productName} - Image ${index + 1}`}
                                                fill
                                                className="object-cover rounded-lg"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </AnimatePresence>
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </CardContent>
            </Card>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="outline"
                            className={`flex-shrink-0 w-16 h-16 p-0 overflow-hidden ${
                                index === currentIndex ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - Thumbnail ${index + 1}`}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                            />
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

