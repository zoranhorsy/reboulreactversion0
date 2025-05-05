'use client'

import useSWR, { SWRConfiguration } from 'swr';
import { api } from '@/lib/api';

/**
 * Hook pour récupérer les données des produits avec SWR
 * @param params Les paramètres pour la requête
 * @param config La configuration SWR
 */
export function useProducts(params?: Record<string, string>, config?: SWRConfiguration) {
  const cacheKey = params ? `products-${JSON.stringify(params)}` : 'products';
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    cacheKey,
    async () => {
      try {
        const result = await api.fetchProducts(params);
        return result;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false, // Ne pas revalider automatiquement au focus
      revalidateIfStale: true,  // Revalider si les données sont périmées
      ...config
    }
  );

  return {
    products: data?.products || [],
    totalCount: data?.total || 0,
    error,
    isLoading,
    isValidating,
    mutate
  };
}

/**
 * Hook pour récupérer un produit spécifique avec SWR
 * @param id L'identifiant du produit
 * @param config La configuration SWR
 */
export function useProduct(id?: string, config?: SWRConfiguration) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    id ? `product-${id}` : null, // Si l'ID est absent, n'exécute pas la requête
    async () => {
      try {
        const result = await api.getProductById(id as string);
        return result;
      } catch (error) {
        console.error(`Erreur lors de la récupération du produit ${id}:`, error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      ...config
    }
  );

  return {
    product: data,
    error,
    isLoading,
    isValidating,
    mutate
  };
}

/**
 * Hook pour récupérer les catégories avec SWR
 */
export function useCategories() {
  const { data, error, isLoading } = useSWR(
    'categories',
    async () => {
      try {
        return await api.fetchCategories();
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false, // Les catégories changent rarement
      dedupingInterval: 3600000, // Déduplication pendant 1 heure
    }
  );

  return {
    categories: data || [],
    error,
    isLoading
  };
}

/**
 * Hook pour récupérer les marques avec SWR
 */
export function useBrands() {
  const { data, error, isLoading } = useSWR(
    'brands',
    async () => {
      try {
        return await api.fetchBrands();
      } catch (error) {
        console.error('Erreur lors de la récupération des marques:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false, // Les marques changent rarement
      dedupingInterval: 3600000, // Déduplication pendant 1 heure
    }
  );

  return {
    brands: data || [],
    error,
    isLoading
  };
}

/**
 * Hook pour récupérer les commandes d'un utilisateur
 */
export function useUserOrders() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-orders',
    async () => {
      try {
        return await api.fetchUserOrders();
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        throw error;
      }
    },
    {
      revalidateOnFocus: true,
    }
  );

  return {
    orders: data || [],
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook pour récupérer les favoris d'un utilisateur
 */
export function useUserFavorites() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-favorites',
    async () => {
      try {
        return await api.getFavorites();
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        throw error;
      }
    }
  );

  return {
    favorites: data || [],
    error,
    isLoading,
    mutate
  };
}

/**
 * Hook générique pour toute requête API
 */
export function useApiRequest<T>(key: string | null, fetcher: () => Promise<T>, config?: SWRConfiguration) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    fetcher,
    config
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate
  };
} 