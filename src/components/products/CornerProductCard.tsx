import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Variant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/app/contexts/FavoritesContext";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import { ProductImage } from "@/lib/types/product-image";
import { getColorInfo, isWhiteColor } from "@/config/productColors";
import { api } from "@/lib/api";

// Hook pour récupérer les marques
function useBrands() {
  const [brands, setBrands] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const brandsData = await api.fetchBrands();
        const brandsMap = brandsData.reduce(
          (acc, brand) => {
            acc[brand.id] = brand.name;
            return acc;
          },
          {} as Record<number, string>,
        );
        setBrands(brandsMap);
      } catch (error) {
        console.error("Error loading brands:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBrands();
  }, []);

  return { brands, isLoading };
}

// Hook pour récupérer les catégories
function useCategories() {
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await api.fetchCategories();
        const categoriesMap = categoriesData.reduce(
          (acc, category) => {
            acc[category.id] = category.name;
            return acc;
          },
          {} as Record<number, string>,
        );
        setCategories(categoriesMap);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  return { categories, isLoading };
}

interface CornerProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function CornerProductCard({
  product,
  viewMode = "grid",
}: CornerProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { brands } = useBrands();
  const { categories } = useCategories();

  const formatPrice = useCallback((price: number | undefined) => {
    if (typeof price !== "number") return null;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price));
  }, []);

  const handleFavoriteClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour ajouter des favoris",
          variant: "destructive",
        });
        return;
      }

      try {
        if (isFavorite(product.id, "corner")) {
          await removeFromFavorites(product.id, "corner");
        } else {
          await addToFavorites(product.id, "corner");
        }
      } catch (error) {
        console.error("Erreur avec les favoris:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue avec les favoris",
          variant: "destructive",
        });
      }
    },
    [user, product.id, isFavorite, addToFavorites, removeFromFavorites],
  );

  if (!product) return null;

  const getImageUrl = (product: Product) => {
    const isValidUrl = (url: string): boolean => {
      if (!url) return false;
      if (url.startsWith("http://") || url.startsWith("https://")) return true;
      if (url.startsWith("/")) return true;
      return false;
    };

    // Essayer d'abord image_url (le plus commun)
    if (product.image_url && isValidUrl(product.image_url)) {
      return product.image_url;
    }

    // Ensuite image
    if (product.image && isValidUrl(product.image)) {
      return product.image;
    }

    // Puis le tableau images
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];

      if (
        typeof firstImage === "object" &&
        firstImage !== null &&
        "url" in firstImage &&
        "publicId" in firstImage
      ) {
        const url = (firstImage as ProductImage).url;
        if (isValidUrl(url)) {
          return url;
        }
      } else if (typeof firstImage === "string") {
        if (isValidUrl(firstImage)) {
          return firstImage;
        }
      }
    }

    // Image de fallback par défaut
    return "https://via.placeholder.com/400x533/f3f4f6/9ca3af?text=Image+non+disponible";
  };

  return (
    <Link
      href={`/the-corner/${product.id}`}
      className={cn(
        "group block relative",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5",
        "rounded-xl overflow-hidden",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
        viewMode === "list" && "flex gap-4",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={cn(
          "aspect-[3/4] relative overflow-hidden",
          viewMode === "list" && "w-48",
        )}
      >
        <Image
          src={getImageUrl(product)}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-all duration-500",
            isHovered && "scale-105",
          )}
          sizes={
            viewMode === "list" ? "192px" : "(max-width: 768px) 100vw, 25vw"
          }
        />

        {/* Overlay avec effet de gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          )}
        />

        {/* Bouton favoris */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-2 right-2 z-10",
            "w-9 h-9 rounded-full",
            "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm",
            "hover:bg-white/90 dark:hover:bg-zinc-900/90",
            "transition-all duration-300",
            "opacity-0 group-hover:opacity-100",
            isFavorite(product.id, "corner") && "opacity-100 text-red-500",
          )}
          onClick={handleFavoriteClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorite(product.id, "corner") ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </Button>

        {/* Badges pour les promotions et nouveautés */}
        {product.old_price && product.old_price > product.price && (
          <Badge variant="destructive" className="absolute top-2 left-2 z-10">
            -
            {Math.round(
              ((product.old_price - product.price) / product.old_price) * 100,
            )}
            %
          </Badge>
        )}
        {product.new && (
          <Badge variant="default" className="absolute top-2 left-2 z-10">
            Nouveau
          </Badge>
        )}
      </div>

      <div className={cn("p-4 space-y-2", viewMode === "list" && "flex-1")}>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-medium line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.brand_id && brands[product.brand_id] && (
              <span className="text-xs text-muted-foreground font-medium">
                {brands[product.brand_id]}
              </span>
            )}
            {product.brand_id &&
              brands[product.brand_id] &&
              product.category_id &&
              categories[product.category_id] && (
                <span className="text-xs text-muted-foreground">•</span>
              )}
            {product.category_id && categories[product.category_id] && (
              <span className="text-xs text-muted-foreground">
                {categories[product.category_id]}
              </span>
            )}
          </div>
        </div>

        {/* Informations sur les variantes */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-4">
            {/* Couleurs disponibles */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {
                  Array.from(
                    new Set(
                      product.variants.map((v) => v.color?.toLowerCase()),
                    ),
                  ).filter(Boolean).length
                }{" "}
                couleur(s)
              </span>
            </div>

            {/* Nombre de tailles disponibles */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {
                  Array.from(
                    new Set(product.variants.map((v) => v.size)),
                  ).filter(Boolean).length
                }{" "}
                taille(s)
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="font-medium text-sm sm:text-base">
            {formatPrice(product.price)}
            {product.old_price && product.old_price > product.price && (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                product.variants && product.variants.some((v) => v.stock > 0)
                  ? "default"
                  : "destructive"
              }
              className="hidden sm:block"
            >
              {product.variants && product.variants.some((v) => v.stock > 0)
                ? "En stock"
                : "Rupture"}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
