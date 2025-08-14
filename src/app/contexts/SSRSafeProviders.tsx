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
// Suppression du CartContext et de tout ce qui concerne le panier

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
          `${API_URL}/auth/login`,
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
        const response = await axios.post(`${API_URL}/auth/inscription`, {
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

// Suppression du CART PROVIDER SSR-SAFE
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

// Suppression du useCart
