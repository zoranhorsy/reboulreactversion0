import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

interface ProductImagesProps {
  product: Product;
  size?: "sm" | "md" | "lg";
}

const getValidImages = (product: Product): (string | File | Blob)[] => {
  // D'abord vérifier le tableau d'images
  if (Array.isArray(product.images) && product.images.length > 0) {
    const validImages = product.images
      .filter((img) => {
        if (typeof img === "string") {
          return img && img.trim() !== "";
        }
        if (img instanceof File || img instanceof Blob) {
          return true;
        }
        // Si c'est un objet ProductImage, on vérifie qu'il a une URL valide
        if (typeof img === "object" && img !== null && "url" in img) {
          return img.url && img.url.trim() !== "";
        }
        return false;
      })
      .map((img) => {
        // Convertir les objets ProductImage en chaînes
        if (typeof img === "object" && img !== null && "url" in img) {
          return img.url;
        }
        return img;
      });
    if (validImages.length > 0) return validImages;
  }
  // Si pas d'images dans le tableau, on utilise image_url comme fallback
  if (product.image_url && product.image_url.trim() !== "") {
    return [product.image_url];
  }
  // Si pas d'image_url, on utilise image comme dernier recours
  if (product.image && product.image.trim() !== "") {
    return [product.image];
  }
  // Si aucune image valide n'est trouvée, retourner un tableau vide
  return [];
};

const getImageUrl = (image: string | File | Blob): string => {
  if (typeof image === "string") {
    // Si c'est déjà une URL complète
    if (image.startsWith("http")) {
      return image;
    }

    // Vérifier si c'est une URL Cloudinary
    if (image.includes("cloudinary.com")) {
      return image;
    }

    // Toujours utiliser l'URL Railway comme fallback
    const baseUrl = "https://reboul-store-api-production.up.railway.app";

    // Nettoyer le chemin d'image et retirer /api s'il est présent
    let cleanPath = image.startsWith("/") ? image : `/${image}`;
    cleanPath = cleanPath.startsWith("/api/") ? cleanPath.slice(4) : cleanPath;
    return `${baseUrl}${cleanPath}`;
  }

  // Pour les fichiers/blobs
  return URL.createObjectURL(image);
};

export function ProductImages({ product, size = "lg" }: ProductImagesProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const validImages = getValidImages(product);
  const hasMultipleImages = validImages.length > 1;

  if (validImages.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[3/4] bg-muted rounded-lg overflow-hidden",
          size === "sm" && "max-w-[200px]",
          size === "md" && "max-w-[300px]",
          size === "lg" && "max-w-[400px]",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span>ImageOff</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative",
        size === "sm" && "max-w-[200px]",
        size === "md" && "max-w-[300px]",
        size === "lg" && "max-w-[400px]",
      )}
    >
      {/* Image principale */}
      <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
        <button
          onClick={() => setIsFullscreen(true)}
          className="block w-full h-full"
        >
          <CloudinaryImage
            src={getImageUrl(validImages[currentImage])}
            alt={`${product.name} - Image ${currentImage + 1}`}
            width={400}
            height={533}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Overlay avec boutons de navigation */}
        {hasMultipleImages && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white 
                                    dark:bg-black/50 dark:hover:bg-black/70
                                    shadow-lg transform hover:scale-105 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage((prev) =>
                    prev > 0 ? prev - 1 : validImages.length - 1,
                  );
                }}
              >
                <span>←</span>
              </Button>
              <div className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
                {currentImage + 1} / {validImages.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white 
                                    dark:bg-black/50 dark:hover:bg-black/70
                                    shadow-lg transform hover:scale-105 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage((prev) =>
                    prev < validImages.length - 1 ? prev + 1 : 0,
                  );
                }}
              >
                <span>→</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Miniatures */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={cn(
                "relative aspect-[3/4] rounded-md overflow-hidden",
                currentImage === index
                  ? "ring-2 ring-primary"
                  : "hover:ring-1 ring-primary/50",
                "transition-all duration-200",
              )}
            >
              <CloudinaryImage
                src={getImageUrl(image)}
                alt={`${product.name} - Miniature ${index + 1}`}
                width={80}
                height={107}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal plein écran */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/90">
          <div className="relative w-full h-[90vh]">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <span>×</span>
            </button>

            <div className="relative w-full h-full">
              <CloudinaryImage
                src={getImageUrl(validImages[currentImage])}
                alt={`${product.name} - Image ${currentImage + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {hasMultipleImages && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev > 0 ? prev - 1 : validImages.length - 1,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                >
                  <span>←</span>
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev < validImages.length - 1 ? prev + 1 : 0,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 
                                        bg-white/10 hover:bg-white/20 text-white
                                        transform hover:scale-105 transition-all"
                >
                  <span>→</span>
                </button>

                {/* Miniatures en bas */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm">
                    {validImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={cn(
                          "relative w-16 aspect-[4/3] rounded-lg overflow-hidden",
                          currentImage === index
                            ? "ring-2 ring-white scale-95"
                            : "hover:ring-1 ring-white/50 hover:scale-105",
                          "transition-all duration-200",
                        )}
                      >
                        <CloudinaryImage
                          src={getImageUrl(image)}
                          alt={`${product.name} - Miniature ${index + 1}`}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
