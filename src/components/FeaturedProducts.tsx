"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { DefinitiveProductCard } from "./DefinitiveProductCard";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Récupération des produits de tous les stores en parallèle
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔍 Récupération des produits featured pour tous les stores...");

      // Appels parallèles pour chaque store
      const [adultRes, kidsRes, sneakersRes] = await Promise.all([
        api.fetchProducts({ featured: "true", store_type: "adult", limit: "8" }),
        api.fetchProducts({ featured: "true", store_type: "kids", limit: "8" }),
        api.fetchProducts({ featured: "true", store_type: "sneakers", limit: "8" }),
      ]);

      // Fusionner les produits (en supprimant les doublons éventuels par id)
      const allProducts = [
        ...(adultRes.products || []),
        ...(kidsRes.products || []),
        ...(sneakersRes.products || []),
      ];
      const uniqueProducts = Array.from(
        new Map(allProducts.map((p) => [p.id, p])).values()
      );

      if (uniqueProducts.length > 0) {
        setProducts(uniqueProducts.slice(0, 8));
        console.log("✅ Produits featured chargés:", uniqueProducts.length);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return (
      <section className="w-full py-12 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Produits en vedette
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-200 dark:bg-zinc-800 rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Produits en vedette
            </h2>
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchProducts}>Réessayer</Button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full py-12 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Produits en vedette
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-primary/60 to-primary/40"></div>
            <span className="text-2xl">📈</span>
            <div className="h-[2px] w-16 bg-gradient-to-l from-transparent via-primary/60 to-primary/40"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
            Produits en vedette
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Découvrez notre sélection exclusive des pièces les plus tendance du
            moment
          </p>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.slice(0, 8).map((product, index) => (
            <DefinitiveProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Bouton voir plus */}
        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-zinc-200 dark:border-zinc-700 bg-background hover:bg-accent hover:text-accent-foreground dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground"
          >
            <Link href="/catalogue" className="flex items-center gap-2">
              Voir tout le catalogue
              <span className="text-sm">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
