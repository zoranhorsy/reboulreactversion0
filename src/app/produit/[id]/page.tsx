"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { getProductById } from "@/lib/api";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import { Viewport } from "next";
import { useCart } from "@/app/contexts/CartContext";
import { useFavorites } from "@/app/contexts/FavoritesContext";
import { toast } from "@/components/ui/use-toast";
import type { CartItem } from "@/lib/types/cart";
import { cn } from "@/lib/utils";
import { ProductDetails } from "@/components/ProductDetails";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

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

// Composant pour afficher une erreur avec option de retry
const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="grid place-items-center py-12 px-4 text-center">
    <div className="max-w-md">
      <div className="mb-6 text-red-500 flex justify-center">
        <span>⚠️</span>
      </div>
      <h2 className="text-2xl font-bold mb-4">Problème de chargement</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Nous rencontrons des difficultés pour charger ce produit. Il est
        possible que l&apos;API soit temporairement indisponible.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => (window.location.href = "/catalogue")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <span>←</span> Retour au catalogue
        </Button>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <span>🔄</span> Réessayer
        </Button>
      </div>
    </div>
  </div>
);

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

const ReboulPageHeader = dynamic(
  () =>
    import("@/components/reboul/components/ReboulPageHeader").then((mod) => ({
      default: mod.ReboulPageHeader,
    })),
  {
    ssr: true,
  },
);

export const viewport: Viewport = defaultViewport;

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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

  // Précharger la page suivante si une ressource est définie
  useEffect(() => {
    // Précharger les données du produit dès l'hydratation
    const preloadProduct = async () => {
      try {
        const data = await getProductById(id);
        if (data && data.images && data.images.length > 0) {
          // Précharger l'image principale
          const img = new Image();
          const imgSrc = data.images[0];
          if (typeof imgSrc === "string") {
            img.src = imgSrc;
          } else if (imgSrc && typeof imgSrc === "object") {
            // Utiliser une approche plus sûre avec vérification d'existence
            img.src = (imgSrc as any).url || (imgSrc as any).src || "";
          }
        }
      } catch (error) {
        // Silencieux pour le préchargement
      }
    };

    preloadProduct();
  }, [id]);

  // Mémoriser la fonction fetchProduct pour éviter les recréations
  const fetchProduct = useCallback(async () => {
    try {
      // Afficher immédiatement un état de chargement
      setIsLoading(true);
      setIsError(false);

      // Fonction de nouvelle tentative avec délai exponentiel
      const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout

          // Utiliser directement getProductById car nous utilisons uniquement des IDs numériques
          const result = await getProductById(id);

          clearTimeout(timeoutId);
          return result;
        } catch (error) {
          console.warn(`Tentative ${retryCount + 1} échouée:`, error);

          if (retryCount < maxRetries) {
            // Attendre avec un délai exponentiel (1s, puis 2s, puis 4s)
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Nouvelle tentative dans ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(retryCount + 1, maxRetries);
          }
          throw error;
        }
      };

      // Tenter de récupérer le produit avec retry
      const data = await fetchWithRetry();

      if (!data) {
        console.error("Produit non trouvé après plusieurs tentatives");
        setIsError(true);

        // Si c'est un problème persistant, rediriger vers le catalogue après un court délai
        if (retryCount > 2) {
          toast({
            title: "Produit indisponible",
            description:
              "Nous n'avons pas pu charger ce produit. Redirection vers le catalogue...",
            variant: "destructive",
          });
          setTimeout(() => {
            router.push("/catalogue");
          }, 3000);
        }
        return;
      }

      setProduct(data);
      const storeType = data.store_type === "cpcompany" ? "corner" : "main";
      setIsWishlist(isFavorite(data.id, storeType));

      // Sélectionner automatiquement la première variante disponible
      if (data.variants && data.variants.length > 0) {
        const firstAvailableVariant = data.variants.find(
          (v: any) => v.stock > 0,
        );
        if (firstAvailableVariant) {
          setSelectedSize(firstAvailableVariant.size);
          setSelectedColor(firstAvailableVariant.color);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du produit:", error);
      setIsError(true);

      // Enregistrer le nombre de tentatives
      setRetryCount((prev) => prev + 1);

      // Si c'est la première erreur, on affiche un toast
      if (retryCount === 0) {
        toast({
          title: "Erreur de chargement",
          description:
            "Impossible de charger les informations du produit. Utilisez le bouton 'Réessayer'.",
          variant: "destructive",
        });
      }

      // Rediriger vers le catalogue après plusieurs échecs
      if (retryCount >= 2) {
        toast({
          title: "Problème persistant",
          description:
            "Nous n'avons pas pu accéder à ce produit. Redirection vers le catalogue...",
          variant: "destructive",
        });
        setTimeout(() => router.push("/catalogue"), 3000);
      }
    } finally {
      // Réduire le temps d'affichage du squelette pour les chargements rapides
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Délai minimal pour éviter le flash du chargement

      return () => clearTimeout(timer);
    }
  }, [id, isFavorite, retryCount, router]);

  // Charger le produit au montage du composant
  useEffect(() => {
    fetchProduct();

    // Précharger le composant des produits similaires après le chargement initial
    const timer = setTimeout(() => {
      import("@/components/SimilarProducts");
      import("@/components/RecentlyViewedProducts");
    }, 1000);

    return () => clearTimeout(timer);
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    // Trouver la variante sélectionnée
    const selectedVariant = product.variants?.find(
      (v: any) => v.size === selectedSize && v.color === selectedColor,
    );

    if (!selectedVariant) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une taille et une couleur",
        variant: "destructive",
      });
      return;
    }

    if (selectedVariant.stock < quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Il ne reste que ${selectedVariant.stock} articles disponibles.`,
        variant: "destructive",
      });
      return;
    }

    const cartItem: CartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      quantity,
      variant: {
        size: selectedSize,
        color: selectedColor,
        colorLabel: selectedColor,
        stock: selectedVariant.stock,
      },
    };

    try {
      addItem(cartItem);

      toast({
        title: "Produit ajouté au panier",
        description: `${product.name} (${selectedColor}, ${selectedSize}) x ${quantity}`,
      });

      // Ouvrir le panier
      openCart();
    } catch (error) {
      // Gestion de l'erreur de stock insuffisant
      toast({
        title: "Stock insuffisant",
        description:
          error instanceof Error ? error.message : "Erreur d'ajout au panier",
        variant: "destructive",
      });
    }
  };

  const toggleWishlist = useCallback(() => {
    if (!product) return;

    // Déterminer le type de store basé sur les propriétés du produit
    const storeType = product.store_type === "cpcompany" ? "corner" : "main";

    if (isWishlist) {
      removeFromFavorites(product.id, storeType);
      setIsWishlist(false);
      toast({
        title: "Produit retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`,
      });
    } else {
      addToFavorites(product.id, storeType);
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

  // Génération des miettes de pain après le chargement du produit
  const breadcrumbs = useMemo(() => {
    if (!product) return [];

    return [
      { label: "Accueil", href: "/" },
      { label: "Catalogue", href: "/catalogue" },
      {
        label: product.category || "Produit",
        href: `/catalogue?category=${product.category}`,
      },
      { label: product.name, href: `#`, current: true },
    ];
  }, [product]);

  // Actions pour le header
  const actions = useMemo(() => {
    return [
      {
        icon: <span>♥</span>,
        label: isWishlist ? "Retirer des favoris" : "Ajouter aux favoris",
        onClick: toggleWishlist,
      },
      {
        icon: <span>Share2</span>,
        label: "Partager",
        onClick: handleShare,
      },
    ];
  }, [isWishlist, toggleWishlist, handleShare]);

  const handleRetry = useCallback(() => {
    fetchProduct();
  }, [fetchProduct]);

  return (
    <ClientPageWrapper>
      <div className="min-h-screen bg-background">
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
              <Suspense
                fallback={
                  <div className="h-32 animate-pulse bg-zinc-100/10 rounded-md"></div>
                }
              >
                <section>
                  <h2 className="text-2xl font-bold mb-6 sm:mb-8">
                    Produits similaires
                  </h2>
                  <SimilarProducts currentProductId={product.id} />
                </section>
              </Suspense>

              <Suspense
                fallback={
                  <div className="h-32 animate-pulse bg-zinc-100/10 rounded-md"></div>
                }
              >
                <section>
                  <h2 className="text-2xl font-bold mb-6 sm:mb-8">
                    Récemment consultés
                  </h2>
                  <RecentlyViewedProducts currentProductId={product.id} />
                </section>
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </ClientPageWrapper>
  );
}
