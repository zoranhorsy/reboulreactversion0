"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClientPage } from "@/components/ClientPageWrapper";
import { useAuth } from "@/app/contexts/AuthContext";
import { Logo } from "@/components/Logo";

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[LoginPage][${timestamp}] ${message}`, data);
  } else {
    console.log(`[LoginPage][${timestamp}] ${message}`);
  }
};

// Forcer l'utilisation de l'URL Railway
const API_URL = "https://reboul-store-api-production.up.railway.app/api";

// Fonction pour décoder un token JWT
const decodeToken = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { error: "Format de token invalide" };
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    return { error: "Erreur lors du décodage du token" };
  }
};

function LoginFormContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // Utiliser le contexte d'authentification NextAuth
  const { login, isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      if (user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/profil");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      
      // Attendre un petit délai pour que la session soit mise à jour
      setTimeout(() => {
        if (user?.is_admin) {
          router.push("/admin");
        } else {
          router.push("/profil");
        }
      }, 1000);
      
    } catch (error) {
      console.error("Erreur de connexion:", error);
      // Le toast d'erreur est déjà géré dans le contexte d'authentification
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${theme === "light" ? "bg-gray-50" : "bg-black"}`}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <span>🌙</span> : <span>☀️</span>}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="mb-8">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              <Logo className="w-full h-full" />
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ou{" "}
            <Link
              href="/inscription"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              inscrivez-vous gratuitement
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="exemple@email.com"
              />
            </div>

            <div className="relative">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <span>👁️</span> : <span>👁️</span>}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/mot-de-passe-oublie"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Exporter le composant enveloppé avec createClientPage comme export par défaut
export default createClientPage(LoginFormContent);
