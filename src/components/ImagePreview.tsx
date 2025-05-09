import type React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { convertToCloudinaryUrl } from "@/lib/utils"
import { isCloudinaryUrl } from "@/config/cloudinary"
import Image from "next/image"
import { fixCloudinaryUrl } from "@/lib/cloudinary"
import config from '@/config'

interface ImagePreviewProps {
  images: string[]
  onRemove: (index: number) => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  const [processedImages, setProcessedImages] = useState<string[]>([])

  useEffect(() => {
    // Log pour le débogage
    console.log("ImagePreview - Images reçues:", images)
    
    // Traiter les images pour s'assurer qu'elles sont correctement formatées
    const processed = images
      .filter(img => img && img.trim() !== '')
      .map(img => {
        // Essayer de corriger l'URL si nécessaire
        return fixCloudinaryUrl(img);
      });
    
    setProcessedImages(processed);
  }, [images])

  if (!processedImages.length) {
    return <div className="text-sm text-muted-foreground">Aucune image</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {processedImages.map((imageUrl, index) => (
          <div key={index} className="relative group aspect-square">
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={`Preview ${index + 1}`}
                fill={true}
                className="rounded-lg object-cover"
                priority={index === 0}
                unoptimized={true}
              />
              {config.debug && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                  <div>URL: {imageUrl.substring(0, 30)}...</div>
                </div>
              )}
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Indicateur de l'index de l'image */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
      
      {/* Informations de débogage (à supprimer en production) */}
      {config.debug && (
        <div className="mt-4 p-2 bg-muted/20 rounded-md text-xs space-y-1 max-h-32 overflow-y-auto">
          <div className="font-semibold">Informations de débogage:</div>
          <div className="text-muted-foreground">Nombre d&apos;images: {images.length}</div>
          <div className="text-muted-foreground">Images traitées: {processedImages.length}</div>
          {processedImages.map((url, idx) => (
            <div key={idx} className="text-muted-foreground truncate">
              Image {idx + 1}: {url.substring(0, 50)}...
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

