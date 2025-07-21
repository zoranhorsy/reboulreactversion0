"use client";

import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

// Forcer l'utilisation de l'URL Railway
const API_URL = "https://reboul-store-api-production.up.railway.app/api";

// Vérifier si nous sommes en mode développement
const isDev = process.env.NODE_ENV === "development";

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[ForgotPasswordPage][${timestamp}] ${message}`, data);
  } else {
    console.log(`[ForgotPasswordPage][${timestamp}] ${message}`);
  }
};

export const viewport: Viewport = defaultViewport;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Empêcher l'hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setServerError(false);
    logWithTime("Demande de réinitialisation pour l'email", { email });

    try {
      // Appel à l'API réelle de réinitialisation de mot de passe
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      logWithTime("Réponse de l'API de réinitialisation", {
        status: response.status,
        data,
      });

      if (response.status === 500) {
        // Erreur serveur détectée
        setServerError(true);
        toast({
          title: "Service temporairement indisponible",
          description:
            "Le service d'envoi d'email est momentanément indisponible. Veuillez réessayer ultérieurement.",
          variant: "destructive",
        });
      } else {
        // En cas de succès ou d'autre erreur, on affiche toujours le même message
        // pour des raisons de sécurité (ne pas divulguer quels emails sont enregistrés)
        setEmailSent(true);
        toast({
          title: "Email envoyé",
          description:
            "Si un compte existe avec cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.",
        });
      }
    } catch (error) {
      logWithTime("Erreur lors de la demande de réinitialisation", error);

      // Même en cas d'erreur réseau, on donne le même message pour ne pas divulguer d'informations
      setEmailSent(true);
      toast({
        title: "Email envoyé",
        description:
          "Si un compte existe avec cette adresse, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.",
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
    <ClientPageWrapper>
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${theme === "light" ? "bg-gray-50" : "bg-black"}`}
      >
        {/* Bouton de changement de thème */}
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            theme === "light"
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-zinc-800 text-gray-200 hover:bg-zinc-700"
          }`}
          aria-label={
            theme === "light" ? "Passer au mode sombre" : "Passer au mode clair"
          }
          title={
            theme === "light" ? "Passer au mode sombre" : "Passer au mode clair"
          }
        >
          {theme === "light" ? <span>🌙</span> : <span>☀️</span>}
        </button>

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

        {/* Formulaire ou confirmation */}
        <div
          className={`w-full max-w-md rounded-xl shadow-md p-4 sm:p-6 space-y-5 animate-fadeIn ${
            theme === "light" ? "bg-white" : "bg-black"
          }`}
          style={{ animationDelay: "0.1s" }}
        >
          {!emailSent ? (
            <>
              <div className="mb-4">
                <h1
                  className={`text-xl font-semibold mb-2 ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}
                >
                  Mot de passe oublié
                </h1>
                <p
                  className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                >
                  Entrez votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className={`block text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemple@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={`w-full h-12 text-base rounded-md ${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0"
                        : "bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0"
                    }`}
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full h-12 text-base font-medium transition-colors mt-4 ${
                    theme === "light"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Envoi en cours..."
                    : "Envoyer le lien de réinitialisation"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              {serverError ? (
                <>
                  <h2
                    className={`text-xl font-semibold mb-2 ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}
                  >
                    Service temporairement indisponible
                  </h2>

                  <p
                    className={`text-sm mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                  >
                    Le service d&apos;envoi d&apos;emails est momentanément
                    indisponible. Veuillez réessayer ultérieurement ou contacter
                    l&apos;administrateur.
                  </p>

                  <div
                    className={`mb-4 p-3 rounded text-sm ${
                      theme === "light"
                        ? "bg-blue-50 text-blue-800 border border-blue-100"
                        : "bg-blue-900/20 text-blue-300 border border-blue-900/50"
                    }`}
                  >
                    <h3 className="font-medium mb-1">
                      Vous êtes administrateur ?
                    </h3>
                    <p className="mb-2">
                      Assurez-vous que les variables SMTP suivantes sont
                      correctement configurées sur la plateforme Railway :
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>SMTP_HOST (ex: smtp.gmail.com)</li>
                      <li>SMTP_PORT (ex: 587)</li>
                      <li>SMTP_USER (votre email)</li>
                      <li>
                        SMTP_PASSWORD (mot de passe ou clé d&apos;application)
                      </li>
                      <li>SMTP_SECURE (true/false)</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setServerError(false)}
                    variant="outline"
                    className={`mb-2 ${
                      theme === "light"
                        ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        : "bg-zinc-900 text-gray-300 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    Réessayer
                  </Button>
                </>
              ) : (
                <>
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                      theme === "light" ? "bg-green-100" : "bg-green-900"
                    }`}
                  >
                    <span>✓</span>
                  </div>

                  <h2
                    className={`text-xl font-semibold mb-2 ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}
                  >
                    Email envoyé
                  </h2>

                  <p
                    className={`text-sm mb-6 ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                  >
                    Si un compte existe avec cette adresse, vous recevrez un
                    email contenant un lien pour réinitialiser votre mot de
                    passe.
                  </p>

                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className={`mb-2 ${
                      theme === "light"
                        ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        : "bg-zinc-900 text-gray-300 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    Essayer une autre adresse
                  </Button>
                </>
              )}

              <div className="mt-4">
                <Link
                  href="/connexion"
                  className={`flex items-center justify-center text-sm ${
                    theme === "light"
                      ? "text-blue-600 hover:text-blue-800"
                      : "text-gray-300 hover:text-white"
                  } transition-colors`}
                >
                  <span>←</span>
                  Retour à la connexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientPageWrapper>
  );
}
