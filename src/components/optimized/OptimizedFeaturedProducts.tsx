"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/lib/api/products";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

// Composant de chargement optimisé avec skeletons
const LoadingComponent = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
      >
        <div className="p-4">
          <div className="aspect-square bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
));
LoadingComponent.displayName = "LoadingComponent";

// Hook personnalisé pour la gestion des animations optimisées
const useStaggeredAnimation = (delay: number = 100) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const trigger = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isVisible, trigger };
};

// Fonction utilitaire pour récupérer les produits featured de chaque store via /api/products
async function fetchAllStoresFeaturedProducts() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app/api";
  const endpoints = [
    `${API_URL}/products?store_type=adult&featured=true&limit=8`,
    `${API_URL}/products?store_type=sneakers&featured=true&limit=8`,
    `${API_URL}/products?store_type=kids&featured=true&limit=8`,
  ];
  const results = await Promise.all(
    endpoints.map(async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return [];
      const data = await response.json();
      // Compatibilité avec le backend : data.products ou data.data
      return data.products || data.data || [];
    })
  );
  // Fusionner et dédupliquer par id
  const allProducts = results.flat();
  const uniqueProducts = Array.from(new Map(allProducts.map((p: any) => [p.id, p])).values());
  return uniqueProducts;
}

// Hook personnalisé pour la gestion des produits avec pagination
const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Un seul appel comme sur /catalogue
      const result = await api.fetchProducts({ featured: "true", limit: "8" });
      setProducts(result.products || []);
    } catch (err) {
      setError("Impossible de charger les produits pour le moment.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    products,
    isLoading,
    error,
    hasMore: false,
    loadMore: () => {},
    refetch: fetchFeatured,
  };
};

const createTestProducts = (): Product[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `test-${i}`,
    name: `Produit Test ${i + 1}`,
    description: `Description du produit test ${i + 1}`,
    price: 129 + i * 15,
    category_id: (i % 4) + 1,
    category: "Test",
    brand_id: (i % 4) + 1,
    brand: "Test",
    image_url: `https://picsum.photos/800/1000?random=${i + 20}&blur=0`,
    image: `https://picsum.photos/800/1000?random=${i + 20}&blur=0`,
    images: [`https://picsum.photos/800/1000?random=${i + 20}&blur=0`],
    variants: [{ id: i * 3, size: "M", color: "Noir", stock: 10 }],
    tags: ["test"],
    details: ["test"],
    reviews: [],
    questions: [],
    faqs: [],
    size_chart: [],
    store_type: "sneakers" as const,
    featured: true,
    created_at: new Date().toISOString(),
    rating: 4.5,
    reviews_count: 10,
    is_corner_product: false,
    active: true,
    new: i < 3,
  }));
};

export default function OptimizedFeaturedProducts() {
  const { products, isLoading, error, hasMore, loadMore, refetch } =
    useProducts();

  // Animations échelonnées
  const titleAnimation = useStaggeredAnimation(0);
  const cardsAnimation = useStaggeredAnimation(300);
  const buttonAnimation = useStaggeredAnimation(600);

  // Intersection Observer pour le lazy loading
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Observer pour le chargement infini
  const { ref: loadMoreRef, inView: shouldLoadMore } = useInView({
    threshold: 0.5,
  });

  // Déclencher les animations quand la section est visible
  useEffect(() => {
    if (inView && !isLoading) {
      titleAnimation.trigger();
      cardsAnimation.trigger();
      buttonAnimation.trigger();
    }
  }, [inView, isLoading, titleAnimation, cardsAnimation, buttonAnimation]);

  // Chargement automatique quand on arrive en bas
  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading) {
      loadMore();
    }
  }, [shouldLoadMore, hasMore, isLoading, loadMore]);

  // Retry button en cas d'erreur
  const RetryButton = React.memo(() => (
    <Button onClick={() => refetch()} variant="default" className="mt-4">
      Réessayer
    </Button>
  ));
  RetryButton.displayName = "RetryButton";

  if (isLoading && products.length === 0) {
    return <LoadingComponent />;
  }

  return (
    <section ref={sectionRef} className="py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {error && products.length === 0 ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <RetryButton />
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center justify-between mb-8 opacity-0 transition-opacity duration-500",
                titleAnimation.isVisible && "opacity-100",
              )}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Produits en vedette
              </h2>
              <Link
                href="/catalogue"
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                )}
              >
                Voir tout
              </Link>
            </div>

            <div
              className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-0 transition-opacity duration-500",
                cardsAnimation.isVisible && "opacity-100",
              )}
            >
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Indicateur de chargement pour l'infinite scroll */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 text-center">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-md mx-auto"></div>
                  </div>
                ) : (
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    className="opacity-0"
                  >
                    Charger plus
                  </Button>
                )}
              </div>
            )}

            <div
              className={cn(
                "mt-12 text-center opacity-0 transition-opacity duration-500",
                buttonAnimation.isVisible && "opacity-100",
              )}
            >
              <Link
                href="/catalogue"
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8",
                  "dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                )}
              >
                Découvrir la collection
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
