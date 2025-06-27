"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/lib/types/product-image";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { OptimizedImage } from "./optimized/OptimizedImage";
import { useImageWorker } from "@/hooks/useImageWorker";
import { rafThrottle } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

declare global {
  interface Window {
    Image: {
      new (width?: number, height?: number): HTMLImageElement;
    };
  }
}

interface ProductGalleryProps {
  images: (string | File | Blob | ProductImage)[];
  productName: string;
  brand?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  aspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
}

export function ProductGallery({
  images,
  productName,
  brand,
  isNew = false,
  isFeatured = false,
  discount,
  aspectRatio = "square",
  className,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [zoomPosition, setZoomPosition] = useState({ x: 0.5, y: 0.5 });
  const [showControls, setShowControls] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [showZoomPreview, setShowZoomPreview] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [fullscreenLoading, setFullscreenLoading] = useState(true);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Utiliser le worker pour le traitement des images
  const { processedImage, error, isProcessing, processImage } = useImageWorker({
    width: 1200,
    height: 1200,
    quality: 85,
    format: "webp",
  });

  // Fonction pour charger et traiter l'image
  const loadAndProcessImage = useCallback(
    async (imageUrl: string) => {
      try {
        const img = new window.Image(0, 0);
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          processImage(imageData);
        };

        img.src = imageUrl;
      } catch (err) {
        console.error("Erreur lors du chargement de l'image:", err);
      }
    },
    [processImage],
  );

  // Charger l'image courante
  useEffect(() => {
    if (images[currentIndex]) {
      loadAndProcessImage(getImageUrl(images[currentIndex]));
    }
  }, [currentIndex, images, loadAndProcessImage]);

  // Filtrer les images valides (non en erreur)
  const validImages = images
    .map((img) => {
      if (typeof img === "string") return img;
      if (typeof img === "object" && img !== null && "url" in img)
        return img.url;
      if (img instanceof File || img instanceof Blob)
        return URL.createObjectURL(img);
      return null;
    })
    .filter(
      (url): url is string => url !== null && !imageErrors[images.indexOf(url)],
    );

  // Log pour déboguer les images
  useEffect(() => {
    console.log("ProductGallery - Images reçues:", images);
    console.log("ProductGallery - Images valides:", validImages);
  }, [images, validImages]);

  // Masquer les contrôles après un délai d'inactivité
  useEffect(() => {
    if (isFullscreen && !isMobile) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isFullscreen, zoomPosition, isMobile]);

  // Réactiver les contrôles lors du mouvement de la souris - Version originale
  const handleMouseMoveOriginal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoomPreview) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  // Version optimisée avec rafThrottle pour éviter le blocage du thread principal
  const handleMouseMove = rafThrottle((e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoomPreview) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
    setShowControls(true);
  });

  // Gestion du swipe sur mobile - Version améliorée
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
  };

  // Gestion du zoom tactile (pinch)
  const handleTouchZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Logique de zoom par pincement à implémenter si nécessaire
      e.preventDefault();
    }
  };

  // Faire défiler les miniatures pour que la miniature active soit visible
  useEffect(() => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const activeThumb = container.querySelector(
        `[data-index="${currentIndex}"]`,
      ) as HTMLElement;

      if (activeThumb) {
        const containerWidth = container.offsetWidth;
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;

        // Calculer la position de défilement idéale
        const scrollPosition = thumbLeft - containerWidth / 2 + thumbWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  // Si aucune image n'est disponible ou si toutes les images sont en erreur, afficher un placeholder
  const getImageUrl = (image: string | File | Blob | ProductImage): string => {
    if (!image) return "/placeholder.svg"; // Retourne une image par défaut si l'image est null ou undefined

    if (typeof image === "string") {
      // Vérifier si la chaîne est vide ou contient seulement des espaces
      return image.trim() ? image : "/placeholder.svg";
    }

    if (typeof image === "object" && image !== null && "url" in image) {
      const url = image.url;
      // Vérifier si l'URL est vide ou contient seulement des espaces
      return url && url.trim() ? url : "/placeholder.svg";
    }

    if (image instanceof File || image instanceof Blob) {
      return URL.createObjectURL(image);
    }

    return "/placeholder.svg"; // Fallback par défaut
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !mainImageRef.current) return;

    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    setZoomPosition({ x, y });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isZoomed) setIsZoomed(false);
  };

  // Aspect ratio responsif et intelligent
  const calculateResponsiveAspectRatio = () => {
    const baseRatio = calculateAspectRatio();
    
    if (isMobile) {
      // Sur mobile, adapter selon le type de produit
      switch (aspectRatio) {
        case "landscape":
          return "aspect-[4/3]"; // Plus adapté sur mobile que landscape complet
        case "portrait":
          return "aspect-[3/4]"; // Garde le portrait sur mobile
        case "square":
        default:
          return "aspect-square"; // Square reste optimal sur mobile
      }
    }
    
    return baseRatio;
  };

  const calculateAspectRatio = () => {
    switch (aspectRatio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      case "square":
      default:
        return "aspect-square";
    }
  };

  // Effet pour gérer l'API du carousel
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentIndex(api.selectedScrollSnap() || 0);

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap() || 0);
    });
  }, [api]);

  const handleImageClick = (imageUrl: string) => {
    setZoomedImage(imageUrl);
  };

  // Afficher un placeholder si aucune image valide
  if (!validImages.length) {
    return (
      <div className="relative aspect-square w-full bg-muted/20 rounded-lg flex flex-col items-center justify-center gap-2">
        <span>ImageOff</span>
        <span className="text-sm text-muted-foreground">
          Aucune image disponible
        </span>
        {productName && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {productName}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-2 sm:space-y-4", className)}>
        {/* Main Image Carousel */}
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-border/40",
                    calculateResponsiveAspectRatio(),
                  )}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseEnter={() => !isMobile && setIsZoomed(true)}
                  onMouseLeave={() => !isMobile && setIsZoomed(false)}
                  onMouseMove={!isMobile ? handleMouseMove : undefined}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`${productName} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 95vw, (max-width: 1024px) 75vw, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority={index === 0}
                    onError={() => handleImageError(index)}
                  />
                  
                  {(isZoomed || isMobile) && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1 sm:gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={() => handleImageClick(getImageUrl(image))}
                          >
                            <span className="text-xs sm:text-sm">⚡</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full sm:max-w-4xl max-h-full sm:max-h-[90vh] p-2 sm:p-6">
                          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg">
                            <Image
                              src={getImageUrl(image)}
                              alt={`${productName} - Image ${index + 1}`}
                              fill
                              sizes="(max-width: 640px) 95vw, (max-width: 1200px) 85vw, 75vw"
                              className="object-contain"
                            />
                          </div>
                          <DialogClose asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <span>×</span>
                              <span className="sr-only">Close</span>
                            </Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Thumbnails - Flex optimisé avec CSS custom pour 790px-1000px */}
        <div 
          ref={thumbnailsContainerRef}
          className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              data-index={index}
              className={cn(
                "relative rounded-md overflow-hidden border-2 flex-none cursor-pointer",
                "transition-all duration-300 ease-out",
                // Tailles de base avec Tailwind
                "w-[40px] h-[40px]",
                "sm:w-[48px] sm:h-[48px]", 
                "md:w-[52px] md:h-[52px]",
                "lg:w-[56px] lg:h-[56px]",
                currentIndex === index
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : "border-border hover:border-primary/50 hover:shadow-md",
              )}
              style={{
                // CSS custom pour la zone problématique 790px-1000px
                width: 'clamp(40px, calc(40px + (100vw - 640px) / (1024 - 640) * 16px), 56px)',
                height: 'clamp(40px, calc(40px + (100vw - 640px) / (1024 - 640) * 16px), 56px)',
              }}
              onClick={() => api?.scrollTo(index)}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${productName} - Miniature ${index + 1}`}
                fill
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, (max-width: 1024px) 56px, 56px"
                className="object-cover transition-opacity duration-300"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen modal - Version responsive */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-full max-h-full p-0 border-0 sm:max-w-[95vw] sm:max-h-[90vh]">
          <div className="relative w-full h-full min-h-screen-safe sm:min-h-[80vh]">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex-1 relative">
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : error ? (
                    <div className="w-full h-full flex items-center justify-center text-red-500">
                      Erreur de chargement de l&apos;image
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <OptimizedImage
                        src={getImageUrl(images[currentIndex])}
                        alt={`${productName} - Image ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        priority
                        quality={95}
                        onError={() => handleImageError(currentIndex)}
                        showPlaceholder={true}
                        loadingClassName="blur-sm"
                        loadedClassName="blur-0"
                      />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {(showControls || isMobile) && images.length > 1 && (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={handlePrevious}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full p-3 sm:p-4
                                   bg-white/10 hover:bg-white/20 text-white
                                   transform hover:scale-105 transition-all
                                   w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center"
                      >
                        <span className="text-lg sm:text-xl">←</span>
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={handleNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full p-3 sm:p-4
                                   bg-white/10 hover:bg-white/20 text-white
                                   transform hover:scale-105 transition-all
                                   w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center"
                      >
                        <span className="text-lg sm:text-xl">→</span>
                      </motion.button>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="py-2 sm:py-4 px-2"
                      >
                        <div className="flex overflow-x-auto space-x-1 sm:space-x-2 pb-2 scrollbar-hide">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setCurrentIndex(index);
                                api?.scrollTo(index);
                              }}
                              className={cn(
                                "relative rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                                // Tailles responsives des miniatures en fullscreen
                                "w-12 h-12 sm:w-16 sm:h-16",
                                currentIndex === index
                                  ? "border-primary ring-1 sm:ring-2 ring-primary/30"
                                  : "border-transparent hover:border-primary/50",
                              )}
                            >
                              {imageErrors[index] ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span>ImageOff</span>
                                </div>
                              ) : (
                                <div className="relative w-full h-full">
                                  <OptimizedImage
                                    src={getImageUrl(image)}
                                    alt={`${productName} - Image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 640px) 48px, 64px"
                                    priority
                                    quality={95}
                                    onError={() => handleImageError(index)}
                                    showPlaceholder={true}
                                    loadingClassName="blur-sm"
                                    loadedClassName="blur-0"
                                  />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
