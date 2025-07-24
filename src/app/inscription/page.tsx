"use client";

import {
  createClientPage,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTheme } from "next-themes";
import { RiMoonLine, RiSunLine, RiEyeLine, RiEyeOffLine, RiCheckLine, RiCloseLine } from '@remixicon/react';

export const viewport: Viewport = defaultViewport;

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();

  // Empêcher l'hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Vérifier la complexité du mot de passe
    const checkPasswordStrength = () => {
      // Initialiser tous les critères à false
      const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
      };

      setPasswordCriteria(criteria);

      // Calculer la force du mot de passe (0-4)
      const strengthScore = Object.values(criteria).filter(Boolean).length;
      setPasswordStrength(strengthScore);
    };

    checkPasswordStrength();
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Champs requis",
        description: "Tous les champs sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Mot de passe trop faible",
        description: "Veuillez choisir un mot de passe plus sécurisé.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });
      router.push("/connexion");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur d'inscription",
        description:
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Déterminer le logo à afficher en fonction du thème
  const logoSrc =
    !mounted || theme === "dark"
      ? "/images/logo_white.png"
      : "/images/logo_black.png";

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    setTheme(newTheme);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${theme === "light" ? "bg-gray-50" : "bg-black"}`}
    >
      {/* Logo en header */}
      <div className="w-full max-w-md mb-8 flex flex-col items-center animate-fadeIn">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          <Image
            src={logoSrc}
            alt="Logo Reboul"
            fill
            className="object-contain"
            priority
            onError={(e) => {
              console.error("Erreur de chargement du logo:", logoSrc);
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Formulaire */}
      <div
        className={`w-full max-w-md rounded-xl shadow-md p-4 sm:p-6 space-y-5 animate-fadeIn ${
          theme === "light" ? "bg-white" : "bg-black"
        }`}
        style={{ animationDelay: "0.1s" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className={`block text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            >
              Nom d&apos;utilisateur
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full h-12 text-base rounded-md ${
                theme === "light"
                  ? "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0"
                  : "bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0"
              }`}
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className={`block text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full h-12 text-base rounded-md ${
                theme === "light"
                  ? "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0"
                  : "bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0"
              }`}
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className={`block text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            >
              Mot de passe
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full h-12 text-base pr-10 rounded-md ${
                  theme === "light"
                    ? "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0"
                    : "bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <RiEyeOffLine className="w-5 h-5" /> : <RiEyeLine className="w-5 h-5" />}
              </button>
            </div>

            {/* Indicateur de force du mot de passe simplifié */}
            {password.length > 0 && (
              <div className="mt-2 space-y-2">
                <div
                  className={`w-full h-1 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-200" : "bg-zinc-800"}`}
                >
                  <div
                    className="h-full transition-all duration-300 bg-green-500"
                    style={{
                      width: `${Math.min(100, passwordStrength * 25)}%`,
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {passwordCriteria.length ? <RiCheckLine className="w-4 h-4 text-green-500" /> : <RiCloseLine className="w-4 h-4 text-red-500" />}
                    <span
                      className={
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      8 caractères minimum
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.uppercase ? (
                      <RiCheckLine className="w-4 h-4 text-green-500" />
                    ) : (
                      <RiCloseLine className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      Une majuscule
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.lowercase ? (
                      <RiCheckLine className="w-4 h-4 text-green-500" />
                    ) : (
                      <RiCloseLine className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      Une minuscule
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordCriteria.number ? <RiCheckLine className="w-4 h-4 text-green-500" /> : <RiCloseLine className="w-4 h-4 text-red-500" />}
                    <span
                      className={
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      Un chiffre
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className={`block text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
            >
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full h-12 text-base rounded-md ${
                theme === "light"
                  ? "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0"
                  : "bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0"
              }`}
              placeholder="••••••••"
            />
          </div>

          {/* Cards informatives subtiles dans le formulaire */}
          <div className="w-full flex flex-col md:flex-row gap-3 md:gap-4 mb-2 animate-fadeIn">
            <div className={`flex-1 rounded-md p-2 shadow-sm border border-accent/30 ${theme === "light" ? "bg-accent/10" : "bg-zinc-900"}`}>
              <h3 className="font-semibold mb-1 text-blue-700 dark:text-blue-300 text-xs">Sécurité & confidentialité</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">Vos informations personnelles sont protégées et ne seront jamais partagées avec des tiers. L’inscription est 100% sécurisée.</p>
            </div>
            <div className={`flex-1 rounded-md p-2 shadow-sm border border-accent/30 ${theme === "light" ? "bg-accent/10" : "bg-zinc-900"}`}>
              <h3 className="font-semibold mb-1 text-blue-700 dark:text-blue-300 text-xs">Pourquoi créer un compte&nbsp;?</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Suivi de vos commandes et accès à l&apos;historique d&apos;achats</li>
                <li>Accès rapide à vos informations de livraison</li>
                <li>Offres et avantages exclusifs réservés aux membres</li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full h-12 text-base font-medium ${isLoading ? "opacity-70" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>

        <div
          className={`text-center text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
        >
          Vous avez déjà un compte?{" "}
          <Link
            href="/connexion"
            className={`font-medium ${theme === "light" ? "text-blue-600 hover:text-blue-500" : "text-blue-400 hover:text-blue-300"}`}
          >
            Connectez-vous
          </Link>
        </div>
      </div>

      <div
        className={`mt-8 text-center text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}
      >
        &copy; {new Date().getFullYear()} Reboul Store. Tous droits réservés.
      </div>
    </div>
  );
}

// Exporter la version client du composant
export default createClientPage(RegisterPage);

// Ajoutez ce style à votre fichier global.css si ce n'est pas déjà fait
// .animate-fadeIn {
//     animation: fadeIn 0.5s ease-in-out;
// }
// @keyframes fadeIn {
//     from { opacity: 0; transform: translateY(10px); }
//     to { opacity: 1; transform: translateY(0); }
// }
