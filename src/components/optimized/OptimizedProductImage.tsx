'use client'

import React from 'react'
import { OptimizedImage, ImageType } from './OptimizedImage'
import { cn } from '@/lib/utils'
import { Product } from '@/lib/api'

// Extension du type Product pour inclure le status optionnel
interface ExtendedProduct extends Product {
  status?: 'new' | 'sale' | 'soldout'
}

interface OptimizedProductImageProps {
  product: ExtendedProduct
  type?: 'card' | 'detail' | 'thumbnail'
  className?: string
  priority?: boolean
  fill?: boolean
  onClick?: () => void
  showHover?: boolean
}

export function OptimizedProductImage({
  product,
  type = 'card',
  className,
  priority = false,
  fill = false,
  onClick,
  showHover = true,
  ...props
}: OptimizedProductImageProps) {
  // Récupérer l'image principale et l'image secondaire (hover)
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/images/product-placeholder.png'
  
  const hoverImage = showHover && product.images && product.images.length > 1 
    ? product.images[1] 
    : null
  
  // Fonction pour convertir l'image en string
  const getImageUrl = (image: string | Blob | any): string => {
    if (!image) return '/images/product-placeholder.png'
    
    // Si c'est déjà une chaîne, la retourner
    if (typeof image === 'string') return image
    
    // Si c'est un objet avec une URL (comme ProductImage pourrait avoir), l'extraire
    if (typeof image === 'object' && image !== null) {
      if ('url' in image) return image.url
      if ('src' in image) return image.src
      if ('source' in image) return image.source
    }
    
    // Fallback si aucun format reconnu
    return '/images/product-placeholder.png'
  }
  
  // Mapper le type de produit au type d'image approprié
  const getImageType = (): ImageType => {
    switch (type) {
      case 'card':
        return 'product-card'
      case 'detail':
        return 'product-detail'
      case 'thumbnail':
        return 'icon'
      default:
        return 'product-card'
    }
  }
  
  const [isHovered, setIsHovered] = React.useState(false)
  
  // Déterminer si le produit a un statut défini
  const hasStatus = product && 'status' in product && product.status
  
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image principale */}
      <div className={cn(
        "transition-opacity duration-300",
        isHovered && hoverImage ? "opacity-0" : "opacity-100"
      )}>
        <OptimizedImage
          src={getImageUrl(mainImage)}
          alt={product.name || "Product image"}
          type={getImageType()}
          priority={priority}
          fill={fill}
          onClick={onClick}
          {...props}
        />
      </div>
      
      {/* Image hover (conditionnelle) */}
      {hoverImage && (
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <OptimizedImage
            src={getImageUrl(hoverImage)}
            alt={`${product.name || "Product"} alternate view`}
            type={getImageType()}
            fill={fill}
            onClick={onClick}
            {...props}
          />
        </div>
      )}
      
      {/* Badge de statut (si disponible) */}
      {hasStatus && (
        <div className="absolute top-2 left-2 z-10">
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded",
            product.status === "new" && "bg-primary text-white",
            product.status === "sale" && "bg-red-500 text-white",
            product.status === "soldout" && "bg-zinc-800 text-white"
          )}>
            {product.status === "new" && "Nouveau"}
            {product.status === "sale" && "Promo"}
            {product.status === "soldout" && "Épuisé"}
          </span>
        </div>
      )}
    </div>
  )
} 