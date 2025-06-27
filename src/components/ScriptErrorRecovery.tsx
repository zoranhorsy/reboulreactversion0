"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ScriptErrorRecoveryProps {
  recoveryDelay?: number;
  maxRecoveryAttempts?: number;
}

export function ScriptErrorRecovery({
  recoveryDelay = 5000,
  maxRecoveryAttempts = 3,
}: ScriptErrorRecoveryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryTimer, setRecoveryTimer] = useState<number | null>(null);

  // Gérer les erreurs JavaScript globales
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignorer les erreurs de ressources (comme les images qui ne chargent pas)
      if (
        event.message?.includes("loading chunk") ||
        event.message?.includes("NetworkError") ||
        event.message?.includes("ChunkLoadError")
      ) {
        console.error(
          "Erreur de chargement de script détectée:",
          event.message,
        );

        // Mettre à jour l'état d'erreur
        setHasError(true);
        setErrorMessage(event.message);

        // Augmenter le nombre de tentatives de récupération
        setRecoveryAttempts((prev) => prev + 1);

        // Tentative de récupération automatique si nous n'avons pas atteint le maximum
        if (recoveryAttempts < maxRecoveryAttempts) {
          const timer = window.setTimeout(() => {
            recoverFromError();
          }, recoveryDelay);

          setRecoveryTimer(timer as unknown as number);
        }

        // Empêcher l'erreur de se propager pour ne pas casser complètement l'application
        event.preventDefault();
      }
    };

    // Surveiller les erreurs non gérées
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      if (recoveryTimer) {
        clearTimeout(recoveryTimer);
      }
    };
  }, [recoveryAttempts, maxRecoveryAttempts, recoveryDelay, recoveryTimer]);

  // Fonction pour tenter de récupérer
  const recoverFromError = () => {
    // Essayer de recharger les chunks JavaScript qui ont échoué
    try {
      // Nettoyer le cache des importations dynamiques
      Object.keys(require.cache || {}).forEach((key) => {
        if (key.includes("chunk") || key.includes("webpack")) {
          delete require.cache[key];
        }
      });

      // Rafraîchir la page
      window.location.reload();
    } catch (e) {
      console.error("Échec de la récupération automatique:", e);
    }
  };

  // Si aucune erreur, ne rien afficher
  if (!hasError) {
    return null;
  }

  // Bannière d'erreur avec option de récupération manuelle
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg shadow-lg z-50 backdrop-blur-sm">
      <div className="flex items-start">
        <span>⚠️</span>
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            Problème de chargement détecté
          </h3>
          <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-300">
            {errorMessage
              ? `Erreur: ${errorMessage.slice(0, 100)}${errorMessage.length > 100 ? "..." : ""}`
              : "Certaines ressources ne se sont pas chargées correctement."}
          </p>

          {recoveryAttempts < maxRecoveryAttempts ? (
            <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
              Tentative de récupération automatique en cours...
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-yellow-300 dark:border-yellow-700 bg-yellow-100/50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              onClick={recoverFromError}
            >
              Recharger la page
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
