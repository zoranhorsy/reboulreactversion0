"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
interface LoadingFallbackProps {
  className?: string;
  delay?: number;
  spinnerSize?: number;
  fullPage?: boolean;
  message?: string;
  showProgressBar?: boolean;
}

export function LoadingFallback({
  className,
  delay = 300,
  spinnerSize = 24,
  fullPage = false,
  message = "Chargement...",
  showProgressBar = true,
}: LoadingFallbackProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [progress, setProgress] = useState(0);

  // Afficher seulement après le délai spécifié pour éviter les flashs de chargement
  useEffect(() => {
    if (delay === 0) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Simuler une progression pour donner une indication visuelle
  useEffect(() => {
    if (!visible || !showProgressBar) return;

    // Pour éviter que la barre reste à 99% trop longtemps
    const incrementSize = [1, 2, 3, 5, 8, 13];
    let currentIncrement = 0;

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Calculer la nouvelle valeur avec une progression qui ralentit
        const increment =
          incrementSize[Math.min(currentIncrement, incrementSize.length - 1)];
        currentIncrement++;

        const newValue = prev + (100 - prev) * (increment / 100);

        // Ne jamais atteindre 100% (sera atteint quand le contenu charge réellement)
        return Math.min(newValue, 95);
      });
    }, 500);

    return () => clearInterval(timer);
  }, [visible, showProgressBar]);

  if (!visible) return null;

  // Contenu de chargement
  const loadingContent = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullPage ? "min-h-[50vh]" : "p-6",
        className,
      )}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
      {message && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      )}
      {showProgressBar && (
        <div className="w-48 h-1 mt-4 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  // Si c'est une page complète, ajouter des styles supplémentaires
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
}
