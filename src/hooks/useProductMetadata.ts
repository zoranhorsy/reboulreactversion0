import { useState, useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Hook pour charger et mettre en cache les métadonnées des produits (marques et catégories)
 */
export function useProductMetadata() {
  const [brands, setBrands] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Chargement des marques et catégories en parallèle
    async function loadMetadata() {
      setIsLoading(true);
      try {
        const [brandsData, categoriesData] = await Promise.all([
          api.fetchBrands(),
          api.fetchCategories(),
        ]);

        // Transformer les données en map pour un accès facile par ID
        const brandsMap = brandsData.reduce(
          (acc, brand) => {
            acc[brand.id] = brand.name;
            return acc;
          },
          {} as Record<number, string>,
        );

        const categoriesMap = categoriesData.reduce(
          (acc, category) => {
            acc[category.id] = category.name;
            return acc;
          },
          {} as Record<number, string>,
        );

        setBrands(brandsMap);
        setCategories(categoriesMap);
        setError(null);
      } catch (err) {
        console.error("Error loading product metadata:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    loadMetadata();
  }, []);

  return { brands, categories, isLoading, error };
}
