import type React from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImagePath } from "@/lib/api"

interface ImagePreviewProps {
  images: string[]
  onRemove: (index: number) => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <div key={index} className="relative group aspect-square">
          <Image
            src={getImagePath(image) || "/placeholder.svg"}
            alt={`Preview ${index + 1}`}
            fill
            className="rounded-lg object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.png"
            }}
            unoptimized // Add this to bypass Image Optimization for external URLs
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

