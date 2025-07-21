"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import type { ApiLoginResponse } from "@/lib/types/auth";
import { type User } from "next-auth";
import type { Product } from "@/lib/types/product";

// =============================================================================
// TYPES
// =============================================================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    colorLabel: string;
    stock: number;
  };
  storeType: "adult" | "sneakers" | "kids" | "cpcompany";
}

export interface OrderDetails {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  items: CartItem[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (productId: string, storeType?: string) => Promise<void>;
  removeFromFavorites: (productId: string, storeType?: string) => Promise<void>;
  isFavorite: (productId: string, storeType?: string) => boolean;
  loading: boolean;
  error: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  totalPrice: number;
  subtotal: number;
  shipping: number;
  discount: number;
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails) => void;
  clearLastOrder: () => void;
  itemCount: number;
  openCart: () => void;
  isCartLoading: boolean;
  applyDiscountCode: (code: string) => void;
  removeDiscountCode: () => void;
  setShippingMethod: (method: "standard" | "express" | "pickup") => void;
}

// =============================================================================
// HOOKS D'HYDRATATION
// =============================================================================

/**
 * Hook pour gérer l'état d'hydratation
 * Évite les erreurs de mismatch entre serveur et client
 */
function useIsomorphicLayoutEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList,
) {
  const useLayoutEffect =
    typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
  useLayoutEffect(() => effect(), deps);
}

/**
 * Hook pour détecter si on est côté client après hydratation
 */
function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// =============================================================================
// CONTEXTS
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);
const CartContext = createContext<CartContextType | undefined>(undefined);

// =============================================================================
// AUTH PROVIDER SSR-SAFE
// =============================================================================

export const SSRSafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const isClient = useIsClient();

  // API URL
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://reboul-store-api-production.up.railway.app/api";

  // États dérivés avec valeurs par défaut sûres
  const isLoading = !isClient ? true : status === "loading";
  const isAuthenticated = isClient ? !!session?.user : false;
  const isAdmin = isClient ? session?.user?.is_admin || false : false;

  // Transformer les données de session en User avec vérification client
  const user: User | null =
    isClient && session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.username || "",
          is_admin: session.user.is_admin || false,
          token: session.user.token,
          avatar_url: session.user.avatar_url,
        }
      : null;

  const login = useCallback(
    async (email: string, password: string) => {
      if (!isClient) return;

      try {
        const apiResponse = await axios.post<ApiLoginResponse>(
          `${API_URL}/api/auth/login`,
          {
            email,
            password,
          },
        );

        const result = await signIn("credentials", {
          email,
          password,
          token: apiResponse.data.token,
          username: apiResponse.data.user.username,
          is_admin: apiResponse.data.user.is_admin,
          avatar_url: apiResponse.data.user.avatar_url,
          redirect: false,
        });

        if (result?.error) {
          toast({
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect",
            variant: "destructive",
          });
          throw new Error(result.error);
        }

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${apiResponse.data.token}`;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Reboul",
        });
      } catch (error) {
        console.error("Erreur de connexion:", error);
        toast({
          title: "Erreur de connexion",
          description: "Une erreur est survenue lors de la connexion",
          variant: "destructive",
        });
        throw error;
      }
    },
    [isClient, API_URL],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      if (!isClient) return;

      try {
        const response = await axios.post(`${API_URL}/api/auth/inscription`, {
          username,
          email,
          password,
        });

        const { user: newUser, token } = response.data;

        await signIn("credentials", {
          email,
          password,
          token,
          redirect: false,
        });

        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        });
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        toast({
          title: "Erreur d'inscription",
          description: "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        });
        throw error;
      }
    },
    [isClient, API_URL],
  );

  const logout = useCallback(async () => {
    if (!isClient) return;

    try {
      delete axios.defaults.headers.common["Authorization"];
      await signOut({ redirect: false });

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Reboul",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  }, [isClient]);

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =============================================================================
// FAVORITES PROVIDER SSR-SAFE
// =============================================================================

export const SSRSafeFavoritesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isClient = useIsClient();

  // Fonction utilitaire pour les appels API
  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      if (!isClient) return null;

      const API_URL = "https://reboul-store-api-production.up.railway.app/api";
      const token = localStorage.getItem("token");

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
    },
    [isClient],
  );

  const fetchFavorites = useCallback(async () => {
    if (!isClient) return;

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
  }, [isClient, apiCall]);

  // Charger les favoris après hydratation
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        fetchFavorites();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isClient, fetchFavorites]);

  const addToFavorites = useCallback(
    async (productId: string, storeType: string = "main") => {
      if (!isClient) return;

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour ajouter aux favoris");
        return;
      }

      try {
        await apiCall("/favorites", {
          method: "POST",
          body: JSON.stringify({
            productId,
            storeType: storeType === "corner" ? "cpcompany" : "adult",
          }),
        });

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
    },
    [isClient, apiCall],
  );

  const removeFromFavorites = useCallback(
    async (productId: string, storeType: string = "main") => {
      if (!isClient) return;

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour retirer des favoris");
        return;
      }

      try {
        await apiCall(`/favorites/${productId}`, {
          method: "DELETE",
          body: JSON.stringify({
            storeType: storeType === "corner" ? "cpcompany" : "adult",
          }),
        });

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
    },
    [isClient, apiCall],
  );

  const isFavorite = useCallback(
    (productId: string, storeType: string = "main"): boolean => {
      return favorites.some((fav) => fav.id === productId);
    },
    [favorites],
  );

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loading: isClient ? loading : false,
    error,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// =============================================================================
// CART PROVIDER SSR-SAFE
// =============================================================================

export const SSRSafeCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrderState] = useState<OrderDetails | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const isClient = useIsClient();

  // Charger les données du panier depuis localStorage après hydratation
  useEffect(() => {
    if (isClient) {
      try {
        const savedCart = localStorage.getItem("reboul-cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }
  }, [isClient]);

  // Sauvegarder le panier dans localStorage
  const saveCartToStorage = useCallback(
    (cartItems: CartItem[]) => {
      if (isClient) {
        try {
          localStorage.setItem("reboul-cart", JSON.stringify(cartItems));
        } catch (error) {
          console.error("Erreur lors de la sauvegarde du panier:", error);
        }
      }
    },
    [isClient],
  );

  const addItem = useCallback(
    (item: CartItem) => {
      setItems((prev) => {
        const existingItem = prev.find(
          (i) =>
            i.id === item.id &&
            i.variant.size === item.variant.size &&
            i.variant.color === item.variant.color,
        );

        let newItems: CartItem[];
        if (existingItem) {
          newItems = prev.map((i) =>
            i.id === item.id &&
            i.variant.size === item.variant.size &&
            i.variant.color === item.variant.color
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        } else {
          newItems = [...prev, item];
        }

        saveCartToStorage(newItems);
        return newItems;
      });
    },
    [saveCartToStorage],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const newItems = prev.filter((item) => item.id !== id);
        saveCartToStorage(newItems);
        return newItems;
      });
    },
    [saveCartToStorage],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }

      setItems((prev) => {
        const newItems = prev.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );
        saveCartToStorage(newItems);
        return newItems;
      });
    },
    [removeItem, saveCartToStorage],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (isClient) {
      localStorage.removeItem("reboul-cart");
    }
  }, [isClient]);

  const setLastOrder = useCallback((order: OrderDetails) => {
    setLastOrderState(order);
  }, []);

  const clearLastOrder = useCallback(() => {
    setLastOrderState(null);
  }, []);

  const openCart = useCallback(() => {
    // Implémentation simple - peut être étendue
    console.log("Ouverture du panier");
  }, []);

  const applyDiscountCode = useCallback((code: string) => {
    // Implémentation simple - peut être étendue
    console.log("Application du code promo:", code);
  }, []);

  const removeDiscountCode = useCallback(() => {
    // Implémentation simple - peut être étendue
    console.log("Suppression du code promo");
  }, []);

  const setShippingMethod = useCallback(
    (method: "standard" | "express" | "pickup") => {
      // Implémentation simple - peut être étendue
      console.log("Méthode de livraison:", method);
    },
    [],
  );

  // Calculs avec protection contre les valeurs NaN
  const subtotal = items.reduce(
    (sum, item) => {
      const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
      const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
      return sum + (price * quantity);
    },
    0,
  );
  const shipping = subtotal > 100 ? 0 : 5.9;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const itemCount = items.reduce((sum, item) => {
    const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
    return sum + quantity;
  }, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    totalPrice: total,
    subtotal,
    shipping,
    discount,
    lastOrder,
    setLastOrder,
    clearLastOrder,
    itemCount,
    openCart,
    isCartLoading,
    applyDiscountCode,
    removeDiscountCode,
    setShippingMethod,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// =============================================================================
// HOOKS
// =============================================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an SSRSafeAuthProvider");
  }
  return context;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error(
      "useFavorites must be used within an SSRSafeFavoritesProvider",
    );
  }
  return context;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within an SSRSafeCartProvider");
  }
  return context;
};
