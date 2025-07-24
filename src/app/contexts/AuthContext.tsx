"use client";

import React, { createContext, useContext, useCallback } from "react";
import dynamic from "next/dynamic";
import { type User } from "next-auth";

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider interne avec les hooks
const AuthProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Import dynamique des hooks pour éviter SSR
  const { useSession, signIn, signOut } = require("next-auth/react");
  const { useToast } = require("@/components/ui/use-toast");
  const axios = require("axios");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app/api";
  
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // États dérivés
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.is_admin || false;

  // Transformer les données de session en User
  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || "",
        username: session.user.username || "",
        is_admin: session.user.is_admin || false,
        token: session.user.token,
        avatar_url: session.user.avatar_url,
      }
    : null;

  // Synchronise le token dans le localStorage dès que user change
  React.useEffect(() => {
    if (user && (user as any).token) {
      localStorage.setItem("token", (user as any).token);
    }
  }, [user]);

  // Fonction pour se connecter
  const login = useCallback(async (email: string, password: string) => {
    try {
      const apiResponse = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
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

      axios.defaults.headers.common["Authorization"] = `Bearer ${apiResponse.data.token}`;
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
  }, [API_URL, axios, signIn, toast]);

  // Fonction pour s'inscrire
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const response = await axios.post(`${API_URL}/api/auth/inscription`, {
          username,
          email,
          password,
        });

        const { token } = response.data;

        await signIn("credentials", {
          email,
          password,
          token,
          redirect: false,
        });

        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.\nPour retrouver vos anciennes commandes, utilisez le même email que lors de vos achats.",
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
    [API_URL, axios, signIn, toast]
  );

  // Fonction pour se déconnecter
  const logout = useCallback(async (redirect: boolean = false) => {
    try {
      delete axios.defaults.headers.common["Authorization"];
      await signOut({ redirect: false });
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Reboul",
      });
      if (redirect) {
        window.location.href = '/connexion';
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  }, [axios, signOut, toast]);

  // Gestion du timer d'inactivité et déconnexion automatique
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const EXPIRATION_MINUTES = 30;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      const expiryTimestamp = Date.now() + EXPIRATION_MINUTES * 60 * 1000;
      localStorage.setItem("token_expiry", expiryTimestamp.toString());
      timer = setTimeout(() => {
        logout(true).catch(() => {});
      }, EXPIRATION_MINUTES * 60 * 1000);
    };

    // Initialisation du timer à la connexion
    resetTimer();

    // Réinitialise le timer à chaque action utilisateur
    const events: (keyof WindowEventMap)[] = [
      "click",
      "keydown",
      "scroll",
      "mousemove",
      "touchstart",
    ];
    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    // Vérifie l'expiration au chargement
    const expiry = localStorage.getItem("token_expiry");
    if (expiry && Date.now() > Number(expiry)) {
      logout(true).catch(() => {});
    }

    // Nettoyage à la déconnexion ou démontage du composant
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [isAuthenticated, logout]);

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

// Version sans SSR de l'AuthProvider
const DynamicAuthProvider = dynamic(
  () => Promise.resolve(AuthProviderInternal),
  { 
    ssr: false,
    loading: () => (
      <AuthContext.Provider value={{
        user: null,
        login: async () => {},
        logout: async () => {},
        register: async () => {},
        isLoading: true,
        isAuthenticated: false,
        isAdmin: false,
      }}>
        <div />
      </AuthContext.Provider>
    )
  }
);

// Export du AuthProvider principal
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <DynamicAuthProvider>{children}</DynamicAuthProvider>;
};
