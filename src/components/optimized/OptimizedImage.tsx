'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Types d'images que nous gérons
export type ImageType = 'hero' | 'product-card' | 'product-detail' | 'category' | 'logo' | 'icon'

interface OptimizedImageProps {
  src: string
  alt: string
  type: ImageType
  className?: string
  priority?: boolean
  fill?: boolean
  quality?: number
  onClick?: () => void
  width?: number
  height?: number
}

export function OptimizedImage({
  src,
  alt,
  type,
  className,
  priority = false,
  fill = false,
  quality = 85,
  onClick,
  width,
  height,
  ...props
}: OptimizedImageProps & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'quality' | 'width' | 'height'>) {
  // Définir les configurations de taille selon le type d'image
  const getSizeConfig = () => {
    switch (type) {
      case 'hero':
        return {
          sizes: '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1280px) 1280px, 1920px',
          width: fill ? undefined : 1920,
          height: fill ? undefined : 1080,
        }
      case 'product-card':
        return {
          sizes: '(max-width: 480px) 180px, (max-width: 768px) 240px, 320px',
          width: fill ? undefined : 320,
          height: fill ? undefined : 427,
        }
      case 'product-detail':
        return {
          sizes: '(max-width: 640px) 480px, (max-width: 1024px) 640px, 1200px',
          width: fill ? undefined : 640,
          height: fill ? undefined : 853,
        }
      case 'category':
        return {
          sizes: '(max-width: 480px) 320px, (max-width: 768px) 400px, 600px',
          width: fill ? undefined : 600,
          height: fill ? undefined : 338,
        }
      case 'logo':
        return {
          sizes: '(max-width: 640px) 280px, 350px',
          width: fill ? undefined : width || 350,
          height: fill ? undefined : height || 105,
        }
      case 'icon':
        return {
          sizes: '32px',
          width: fill ? undefined : 32,
          height: fill ? undefined : 32,
        }
      default:
        return {
          sizes: '100vw',
          width: fill ? undefined : 1200,
          height: fill ? undefined : 800,
        }
    }
  }

  const { sizes, width: imageWidth, height: imageHeight } = getSizeConfig()

  return (
    <div className={cn("relative", className)}>
      <Image
        src={src}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        sizes={sizes}
        quality={quality}
        priority={priority}
        fill={fill}
        onClick={onClick}
        className={cn(
          "object-cover transition-opacity duration-300",
          !priority && "blur-up",
          fill && "object-center",
          type === 'logo' && "object-contain"
        )}
        {...props}
      />
    </div>
  )
} 