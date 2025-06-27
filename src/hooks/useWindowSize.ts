"use client";

import { useEffect, useState } from "react";
import { rafThrottle } from "@/lib/utils";

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize() {
  // Initialiser avec des valeurs par défaut pour éviter les erreurs côté serveur
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // S'assurer que le code s'exécute uniquement dans le navigateur
    if (typeof window === "undefined") {
      return;
    }

    // Fonction pour mettre à jour la taille de la fenêtre - version originale
    // function handleResize() {
    //   setWindowSize({
    //     width: window.innerWidth,
    //     height: window.innerHeight,
    //   });
    // }

    // Version optimisée avec rafThrottle pour éviter les mises à jour trop fréquentes
    // et le blocage du thread principal pendant les redimensionnements
    const handleResize = rafThrottle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });

    // Ajouter un écouteur d'événement pour détecter les changements de taille
    window.addEventListener("resize", handleResize);

    // Appel initial pour définir la taille
    handleResize();

    // Nettoyer l'écouteur d'événement lors du démontage
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
