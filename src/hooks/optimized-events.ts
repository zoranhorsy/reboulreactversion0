"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { debounce, throttle, rafThrottle } from "@/lib/utils";

/**
 * Hook optimisé pour détecter le défilement avec des performances améliorées
 * Utilise requestAnimationFrame pour minimiser le blocage du thread principal
 *
 * @param threshold Seuil de défilement (en pixels) pour déclencher le changement d'état
 * @returns Un objet avec des informations sur le défilement
 */
export function useOptimizedScroll(threshold = 100) {
  const [scrollData, setScrollData] = useState({
    scrollY: 0,
    isScrolled: false,
    scrollDirection: "none",
    isAtTop: true,
    isAtBottom: false,
  });

  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Utiliser rafThrottle pour synchroniser avec requestAnimationFrame
    // Évite les calculs lourds entre les frames d'animation
    const handleScroll = rafThrottle(() => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > threshold;
      const direction = currentScrollY > lastScrollY.current ? "down" : "up";
      const isAtTop = currentScrollY <= 5;

      // Calcul optimisé si l'utilisateur est en bas de page
      // Évite les calculs inutiles de scrollHeight à chaque défilement
      const isAtBottom =
        window.innerHeight + currentScrollY >=
        document.documentElement.scrollHeight - 20;

      setScrollData({
        scrollY: currentScrollY,
        isScrolled,
        scrollDirection: direction,
        isAtTop,
        isAtBottom,
      });

      lastScrollY.current = currentScrollY;
    });

    window.addEventListener("scroll", handleScroll);

    // Appel initial
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return scrollData;
}

/**
 * Hook optimisé pour les interactions de souris intensives
 * Utile pour les composants comme les sliders, drag & drop, ou visualisations
 */
export function useOptimizedMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Utiliser rafThrottle pour les mises à jour visuelles
    // Synchronisé avec le taux de rafraîchissement de l'écran
    const handleMouseMove = rafThrottle((e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

/**
 * Hook optimisé pour le redimensionnement avec différentes stratégies
 * @param strategy 'debounce' | 'throttle' | 'raf' - Stratégie d'optimisation
 * @param delay Délai pour debounce/throttle en ms
 */
export function useOptimizedResize(
  strategy: "debounce" | "throttle" | "raf" = "raf",
  delay = 200,
) {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let handleResize: (...args: any[]) => void;

    // Base handler - ce qui sera optimisé
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Choisir la stratégie d'optimisation
    switch (strategy) {
      case "debounce":
        // Meilleur pour les actions finales - attend la fin du redimensionnement
        handleResize = debounce(updateSize, delay);
        break;
      case "throttle":
        // Meilleur pour les mises à jour régulières pendant le redimensionnement
        handleResize = throttle(updateSize, delay);
        break;
      case "raf":
      default:
        // Meilleur pour les animations et mises à jour visuelles
        handleResize = rafThrottle(updateSize);
        break;
    }

    window.addEventListener("resize", handleResize);

    // Appel initial
    updateSize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [strategy, delay]);

  return size;
}
