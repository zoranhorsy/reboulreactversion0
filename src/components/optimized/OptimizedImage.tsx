'use client'

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { getImageSources, optimizedImageLoader } from '@/lib/imageOptimization'

// Types d'images que nous gérons
export type ImageType = 'hero' | 'product-card' | 'product-detail' | 'category' | 'logo' | 'icon'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  /**
   * Indique si cette image est le LCP (Largest Contentful Paint)
   * Si true, l'image aura priority=true et sera préchargée
   */
  isLCP?: boolean;
  
  /**
   * Classe à appliquer quand l'image est en cours de chargement
   */
  loadingClassName?: string;
  
  /**
   * Classe à appliquer quand l'image est chargée
   */
  loadedClassName?: string;
  
  /**
   * Afficher un placeholder pendant le chargement
   */
  showPlaceholder?: boolean;
  
  /**
   * URL du placeholder (si non spécifié, un dégradé sera utilisé)
   */
  placeholderUrl?: string;
  
  /**
   * Type d'image (pour les paramètres d'optimisation spécifiques)
   */
  type?: ImageType;
  
  /**
   * Utiliser l'élément <picture> pour un support avancé des formats WebP/AVIF
   */
  usePicture?: boolean;
  
  /**
   * Callback appelé quand l'image est chargée
   */
  onLoad?: () => void;
}

/**
 * Composant d'image optimisé pour améliorer les Web Vitals
 * Il utilise next/image avec des fonctionnalités additionnelles:
 * - Priorité automatique pour les images LCP
 * - Classes conditionnelles pendant et après le chargement
 * - Placeholder pendant le chargement
 * - Support des formats WebP/AVIF via l'élément <picture>
 * - Optimisation CDN Vercel
 */
export function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  isLCP = false,
  priority = false,
  loadingClassName,
  loadedClassName,
  showPlaceholder = false,
  placeholderUrl,
  type,
  usePicture = true,
  onLoad,
  className,
  sizes = isLCP ? '(max-width: 768px) 100vw, 50vw' : undefined,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Si c'est l'image LCP, on force priority à true
  const shouldPrioritize = isLCP || priority
  
  // Gérer le chargement de l'image
  const handleLoadingComplete = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }
  
  // Précharger l'image LCP
  useEffect(() => {
    if (isLCP && typeof src === 'string') {
      const preloadLink = document.createElement('link')
      preloadLink.rel = 'preload'
      preloadLink.as = 'image'
      preloadLink.href = src
      preloadLink.fetchPriority = 'high'
      document.head.appendChild(preloadLink)
      
      return () => {
        document.head.removeChild(preloadLink)
      }
    }
  }, [isLCP, src])

  // Créer un loader personnalisé qui inclut le type d'image
  const customLoader = (loaderProps: any) => {
    return optimizedImageLoader({
      ...loaderProps,
      src: loaderProps.src,
      imageType: type || (typeof src === 'string' && src.includes('logo') ? 'logo' : undefined)
    });
  };
  
  // Obtenir les sources d'image pour le composant <picture>
  const { webpSrcSet, avifSrcSet, defaultSrc } = typeof src === 'string' 
    ? getImageSources(src)
    : { webpSrcSet: '', avifSrcSet: '', defaultSrc: '' }
    
  // Déterminer si on doit utiliser <picture> ou next/image
  // Pour les logos, désactiver l'élément picture
  const isLogo = type === 'logo' || (typeof src === 'string' && src.includes('logo'));
  const shouldUsePicture = usePicture && typeof src === 'string' && (webpSrcSet || avifSrcSet) && !isLogo;
  
  return (
    <div className="relative overflow-hidden w-full h-full">
      {showPlaceholder && !isLoaded && (
        <div 
          className={cn(
            "absolute inset-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse",
            loadingClassName
          )}
          style={placeholderUrl ? { backgroundImage: `url(${placeholderUrl})`, backgroundSize: 'cover' } : undefined}
        />
      )}
      
      {shouldUsePicture ? (
        // Utiliser l'élément <picture> pour le support des formats modernes
        <picture>
          {avifSrcSet && (
            <source 
              type="image/avif" 
              srcSet={avifSrcSet} 
              sizes={sizes || '(max-width: 768px) 100vw, 50vw'} 
            />
          )}
          {webpSrcSet && (
            <source 
              type="image/webp" 
              srcSet={webpSrcSet} 
              sizes={sizes || '(max-width: 768px) 100vw, 50vw'} 
            />
          )}
          <img
            src={defaultSrc || (typeof src === 'string' ? src : '')}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoadingComplete}
            className={cn(
              "w-full h-full transition-opacity duration-300 ease-in-out",
              !isLoaded && showPlaceholder ? "opacity-0" : "opacity-100",
              !isLoaded ? loadingClassName : loadedClassName,
              className
            )}
            fetchPriority={shouldPrioritize ? "high" : "auto"}
            {...props}
          />
        </picture>
      ) : (
        // Utiliser next/image pour les autres cas
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={shouldPrioritize}
          onLoad={handleLoadingComplete}
          loader={customLoader}
          fetchPriority={shouldPrioritize ? "high" : "auto"}
          className={cn(
            "transition-opacity duration-300 ease-in-out",
            !isLoaded && showPlaceholder ? "opacity-0" : "opacity-100",
            !isLoaded ? loadingClassName : loadedClassName,
            className
          )}
          {...props}
        />
      )}
    </div>
  )
} 