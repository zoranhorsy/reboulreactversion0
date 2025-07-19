"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getProductById } from "@/lib/api";
import { useCart } from "@/app/contexts/CartContext";
import { useFavorites } from "@/app/contexts/FavoritesContext";
import { toast } from "@/components/ui/use-toast";
import type { CartItem } from "@/lib/types/cart";
import { ProductDetails } from "@/components/ProductDetails";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReboulPageHeader } from "@/components/reboul/components/ReboulPageHeader";
import { StoreType } from "@/components/catalogue/CatalogueShared";

// Chargement dynamique des composants non-critiques
const SimilarProducts = dynamic(
  () =>
    import("@/components/SimilarProducts").then((mod) => ({
      default: mod.SimilarProducts,
    })),
  {
    loading: () => (
      <div className="h-32 animate-pulse bg-zinc-100/10 rounded-md"></div>
    ),
    ssr: false,
  },
);

const RecentlyViewedProducts = dynamic(
  () =>
    import("@/components/RecentlyViewedProducts").then((mod) => ({
      default: mod.RecentlyViewedProducts,
    })),
  {
    loading: () => (
      <div className="h-32 animate-pulse bg-zinc-100/10 rounded-md"></div>
    ),
    ssr: false,
  },
);

// Squelette pour le composant ProductDetails
const ProductDetailsSkeleton = () => (
  <div className="grid gap-8 md:grid-cols-2">
    <div className="aspect-square rounded-xl bg-muted animate-pulse"></div>
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-24 w-full" />
      <div className="flex flex-wrap gap-2 pt-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-12 rounded-md" />
          ))}
      </div>
      <div className="pt-4">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="mb-6 text-red-500">
      <span>⚠️</span>
    </div>
    <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
    <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
      Le produit que vous recherchez n&apos;existe pas ou a été supprimé.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button onClick={onRetry} variant="default">
        Réessayer
      </Button>
    </div>
  </div>
);

interface ProductPageSharedProps {
  productId: string;
  storeType: StoreType;
  title: string;
  subtitle?: string;
  backLink: string;
  backText: string;
  breadcrumbs: { label: string; href: string }[];
}

export default function ProductPageShared({
  productId,
  storeType,
  title,
  subtitle,
  backLink,
  backText,
  breadcrumbs,
}: ProductPageSharedProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [isWishlist, setIsWishlist] = useState(false);

  // Fonction pour récupérer le produit selon le store type
  const fetchProduct = useCallback(async () => {
    if (retryCount >= 3) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      let productData: any = null;

      // Selon le store type, utiliser la bonne API
      if (storeType === "adult") {
        // Pour les produits adultes, utiliser l'API standard
        productData = await getProductById(productId);
      } else {
        // Pour sneakers et kids, l'API ReboulProductController gère déjà tout
        productData = await getProductById(productId);
      }

      if (!productData) {
        console.error(`Produit avec ID ${productId} non trouvé pour store type ${storeType}`);
        throw new Error("Produit non trouvé");
      }

      console.log(`Produit ${storeType} chargé:`, productData);
      setProduct(productData);
      
      // Initialiser les valeurs par défaut
      if (productData.variants && productData.variants.length > 0) {
        const availableColors = Array.from(
          new Set(productData.variants.map((v: any) => v.color).filter(Boolean))
        );
        const availableSizes = Array.from(
          new Set(productData.variants.map((v: any) => v.size).filter(Boolean))
        );
        
        if (availableColors.length > 0 && !selectedColor) {
          setSelectedColor(String(availableColors[0]));
        }
        if (availableSizes.length > 0 && !selectedSize) {
          setSelectedSize(String(availableSizes[0]));
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement du produit:", err);
      setRetryCount((prev) => prev + 1);
      
      // Réessayer automatiquement avec un délai
      if (retryCount < 2) {
        setTimeout(() => {
          fetchProduct();
        }, 1000 * (retryCount + 1));
      } else {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId, storeType, retryCount, selectedColor, selectedSize]);

  // Charger le produit au montage
  useEffect(() => {
    if (productId) {
      setRetryCount(0);
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  // Mettre à jour l'état des favoris
  useEffect(() => {
    if (product) {
      const storeTypeForFavorites = product.store_type === "cpcompany" ? "corner" : "main";
      setIsWishlist(isFavorite(product.id, storeTypeForFavorites));
    }
  }, [product, isFavorite]);

  // Précharger l'image principale
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const img = new Image();
      const imgSrc = product.images[0];
      if (typeof imgSrc === "string") {
        img.src = imgSrc;
      } else if (imgSrc && typeof imgSrc === "object") {
        img.src = (imgSrc as any).url || (imgSrc as any).src || "";
      }
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (!selectedSize || !selectedColor) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une taille et une couleur.",
        variant: "destructive",
      });
      return;
    }

    const cartItem: CartItem = {
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.images?.[0] || "/placeholder.svg",
      variant: {
        size: selectedSize,
        color: selectedColor,
        colorLabel: selectedColor, // Utiliser la couleur sélectionnée comme label
        stock: product.variants.find((v: any) => v.size === selectedSize && v.color === selectedColor)?.stock || 0,
      },
      quantity: quantity,
      storeType: storeType,
    };

    addItem(cartItem);
    
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} (${selectedSize}, ${selectedColor}) x${quantity}`,
      action: (
        <Button variant="outline" size="sm" onClick={openCart}>
          Voir le panier
        </Button>
      ),
    });
  }, [
    product,
    selectedSize,
    selectedColor,
    quantity,
    storeType,
    addItem,
    openCart,
  ]);

  const toggleWishlist = useCallback(() => {
    if (!product) return;

    const storeTypeForFavorites = product.store_type === "cpcompany" ? "corner" : "main";

    if (isWishlist) {
      removeFromFavorites(product.id, storeTypeForFavorites);
      setIsWishlist(false);
      toast({
        title: "Produit retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`,
      });
    } else {
      addToFavorites(product.id, storeTypeForFavorites);
      setIsWishlist(true);
      toast({
        title: "Produit ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`,
      });
    }
  }, [product, isWishlist, addToFavorites, removeFromFavorites]);

  const handleShare = useCallback(async () => {
    if (!product) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Découvrez ${product.name} sur Reboul`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien du produit a été copié dans le presse-papiers.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  }, [product]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchProduct();
  }, [fetchProduct]);

  // Générer les breadcrumbs avec le produit
  const productBreadcrumbs = useMemo(() => {
    if (!product) return breadcrumbs;

    return [
      ...breadcrumbs,
      { label: product.name, href: `#`, current: true },
    ];
  }, [product, breadcrumbs]);

  return (
    <div className="min-h-screen bg-background">
      <ReboulPageHeader
        title={title}
        subtitle={subtitle || (product ? `${product.brand} - ${product.name}` : "")}
        backLink={backLink}
        backText={backText}
        breadcrumbs={productBreadcrumbs}
      />

      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="mt-8">
          {isLoading ? (
            <ProductDetailsSkeleton />
          ) : isError ? (
            <ErrorFallback onRetry={handleRetry} />
          ) : product ? (
            <ProductDetails
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              isWishlist={isWishlist}
              onToggleWishlist={toggleWishlist}
              onShare={handleShare}
            />
          ) : (
            <ErrorFallback onRetry={handleRetry} />
          )}
        </div>

        {!isError && !isLoading && product && (
          <div className="mt-16 sm:mt-24 space-y-12 sm:space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 sm:mb-8">
                Produits similaires
              </h2>
              <SimilarProducts currentProductId={product.id} />
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 sm:mb-8">
                Récemment consultés
              </h2>
              <RecentlyViewedProducts currentProductId={product.id} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
} 