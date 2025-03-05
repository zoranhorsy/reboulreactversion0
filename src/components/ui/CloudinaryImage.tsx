'use client';

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { isCloudinaryUrl } from "@/config/cloudinary"
import { fixCloudinaryUrl } from "@/lib/cloudinary"

export interface CloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  fallbackSrc?: string
  showDebug?: boolean
  onError?: () => void
  onLoad?: () => void
}

export function CloudinaryImage({
  src,
  alt,
  width = 500,
  height = 500,
  className,
  priority = false,
  sizes,
  fill = false,
  fallbackSrc = '/images/product-placeholder.png',
  showDebug = process.env.NODE_ENV === 'development',
  onError,
  onLoad,
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(src)

  useEffect(() => {
    // Essayer de corriger l'URL si nécessaire
    const fixedUrl = fixCloudinaryUrl(src);
    setImageUrl(fixedUrl);
    
    console.log("CloudinaryImage - URL d'origine:", src);
    console.log("CloudinaryImage - URL corrigée:", fixedUrl);
  }, [src])

  const handleImageError = () => {
    console.error(`Erreur de chargement de l'image: ${imageUrl}`);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  }

  // Si l'image a une erreur, afficher l'image de remplacement
  if (hasError) {
    return (
      <div className={cn(
        "relative overflow-hidden",
        className
      )}>
        {fill ? (
          <Image
            src={fallbackSrc}
            alt={alt}
            fill={true}
            className={cn(
              "object-cover transition-all",
              isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
            )}
            onLoad={handleImageLoad}
            onError={() => console.error(`Erreur de chargement de l'image de fallback: ${fallbackSrc}`)}
            priority={priority}
            unoptimized={true}
          />
        ) : (
          <Image
            src={fallbackSrc}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              "object-cover transition-all",
              isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
            )}
            onLoad={handleImageLoad}
            onError={() => console.error(`Erreur de chargement de l'image de fallback: ${fallbackSrc}`)}
            priority={priority}
            unoptimized={true}
          />
        )}
        {showDebug && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
            <div>Fallback: {fallbackSrc.substring(0, 30)}...</div>
            <div>Original: {src ? src.substring(0, 30) + '...' : 'none'}</div>
            <div>Erreur: Oui</div>
          </div>
        )}
      </div>
    )
  }

  // Afficher l'image avec le composant Image de Next.js
  return (
    <div className={cn(
      "relative overflow-hidden",
      className
    )}>
      {fill ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill={true}
          className={cn(
            "object-cover transition-all",
            isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={priority}
          unoptimized={true}
          sizes={sizes || "100vw"}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "object-cover transition-all",
            isLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={priority}
          unoptimized={true}
          sizes={sizes}
        />
      )}
      
      {showDebug && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
          <div>URL: {imageUrl ? imageUrl.substring(0, 30) + '...' : 'none'}</div>
          <div>Type: Image Next.js</div>
        </div>
      )}
    </div>
  )
} 