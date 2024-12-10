import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

type ProductGalleryProps = {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        )
    }

    return (
        <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl relative">
                <Image
                    src={images[currentImageIndex]}
                    alt={`${productName} - Image ${currentImageIndex + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-opacity duration-500"
                />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="icon" className="absolute bottom-4 right-4">
                            <ZoomIn className="h-4 w-4" />
                            <span className="sr-only">Zoom</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <div className="relative aspect-square">
                            <Image
                                src={images[currentImageIndex]}
                                alt={`${productName} - Image ${currentImageIndex + 1}`}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Button variant="ghost" size="icon" onClick={prevImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-black hover:bg-white/90 rounded-full">
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Image précédente</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={nextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 text-black hover:bg-white/90 rounded-full">
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Image suivante</span>
            </Button>
            <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-black' : 'bg-gray-300'}`}
                        aria-label={`Voir l'image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

