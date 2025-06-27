"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "@/components/ui/use-toast";

// Import direct des types sans passer par l'API
import type { Product } from "@/lib/types/product";

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (productId: string, storeType?: string) => Promise<void>;
  removeFromFavorites: (productId: string, storeType?: string) => Promise<void>;
  isFavorite: (productId: string, storeType?: string) => boolean;
  loading: boolean;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

// Fonction utilitaire pour faire des appels API sans import circulaire
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const API_URL = "https://reboul-store-api-production.up.railway.app/api";

  // Récupérer le token côté client uniquement
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    // Vérifier si nous sommes côté client et si un token existe
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiCall("/favorites");
      setFavorites(data || []);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des favoris");
      console.error(
        "FavoritesContext - Erreur lors du chargement des favoris:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Différer le chargement initial pour éviter les problèmes SSR
    const timer = setTimeout(() => {
      fetchFavorites();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchFavorites]);

  const addToFavorites = async (
    productId: string,
    storeType: string = "main",
  ) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour ajouter aux favoris");
      return;
    }

    try {
      console.log("FavoritesContext - Ajout aux favoris:", {
        productId,
        storeType,
      });

      await apiCall("/favorites", {
        method: "POST",
        body: JSON.stringify({
          productId,
          storeType: storeType === "corner" ? "cpcompany" : "adult",
        }),
      });

      console.log("FavoritesContext - Produit ajouté aux favoris");

      // Créer un objet Product temporaire avec les champs obligatoires
      const tempProduct: Product = {
        id: productId,
        store_type: storeType === "corner" ? "cpcompany" : "adult",
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        category: "",
        brand_id: 0,
        brand: "",
        image_url: "",
        images: [],
        image: "",
        variants: [],
        tags: [],
        details: [],
        reviews: [],
        questions: [],
        faqs: [],
        size_chart: [],
        featured: false,
        created_at: new Date().toISOString(),
      };

      setFavorites((prev) => [...prev, tempProduct]);
      setError(null);

      toast({
        title: "Succès",
        description: "Produit ajouté aux favoris",
      });
    } catch (err) {
      setError("Erreur lors de l'ajout aux favoris");
      console.error(
        "FavoritesContext - Erreur lors de l'ajout aux favoris:",
        err,
      );

      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = async (
    productId: string,
    storeType: string = "main",
  ) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour retirer des favoris");
      return;
    }

    try {
      console.log("FavoritesContext - Suppression des favoris:", {
        productId,
        storeType,
      });

      await apiCall(`/favorites/${productId}`, {
        method: "DELETE",
        body: JSON.stringify({
          storeType: storeType === "corner" ? "cpcompany" : "adult",
        }),
      });

      console.log("FavoritesContext - Produit retiré des favoris");
      setFavorites((prev) => prev.filter((fav) => fav.id !== productId));
      setError(null);

      toast({
        title: "Succès",
        description: "Produit retiré des favoris",
      });
    } catch (err) {
      setError("Erreur lors de la suppression des favoris");
      console.error(
        "FavoritesContext - Erreur lors de la suppression des favoris:",
        err,
      );

      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (
    productId: string,
    storeType: string = "main",
  ): boolean => {
    return favorites.some((fav) => fav.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loading,
        error,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
