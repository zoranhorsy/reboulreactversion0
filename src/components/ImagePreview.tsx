import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react';

interface ImagePreviewProps {
    images: string[];
    onRemove: (index: number) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {images.map((image, index) => (
                <div key={index} className="relative">
                    <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 rounded-full w-6 h-6 p-1"
                        onClick={() => onRemove(index)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

