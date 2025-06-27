"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LoadingFallback } from "./LoadingFallback";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  showLoadingIndicator?: boolean;
}

// Styles CSS pour les animations de transition
const transitionStyles = `
  .page-transition-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  
  .page-transition-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 400ms cubic-bezier(0.61, 1, 0.88, 1), transform 400ms cubic-bezier(0.61, 1, 0.88, 1);
  }
  
  .page-transition-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .page-transition-exit-active {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 300ms cubic-bezier(0.61, 1, 0.88, 1), transform 300ms cubic-bezier(0.61, 1, 0.88, 1);
  }
  
  .page-transition-static {
    opacity: 1;
    transform: translateY(0);
  }
`;

export function PageTransition({
  children,
  className,
  showLoadingIndicator = true,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [currentPath, setCurrentPath] = useState(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<
    "enter" | "exit" | "static"
  >("static");

  // Utiliser uniquement le chemin pour la clé unique
  const routeKey = pathname;

  // Désactiver l'animation lors du premier rendu pour éviter de pénaliser le FCP
  useEffect(() => {
    setIsFirstRender(false);

    // Injecter les styles CSS pour les animations
    const styleElement = document.createElement("style");
    styleElement.textContent = transitionStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []); // Dépendance vide - s'exécute une seule fois

  // Gérer les transitions de page
  useEffect(() => {
    if (isFirstRender || pathname === currentPath) return;

    // Commencer la transition de sortie
    setIsTransitioning(true);
    setTransitionPhase("exit");

    // Afficher l'indicateur de chargement après un court délai
    const timeout = setTimeout(() => {
      setIsLoading(true);
    }, 300);

    setLoadingTimeout(timeout);

    // Après l'animation de sortie, changer le contenu et faire l'animation d'entrée
    setTimeout(() => {
      setCurrentPath(pathname);
      setTransitionPhase("enter");

      // Une fois l'animation d'entrée terminée
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionPhase("static");
        setIsLoading(false);
      }, 400); // Durée de l'animation d'entrée
    }, 300); // Durée de l'animation de sortie

    // Nettoyage
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      setIsLoading(false);
    };
  }, [pathname, isFirstRender, currentPath]); // Retrait de loadingTimeout des dépendances pour éviter les boucles infinies

  // Classes CSS basées sur la phase de transition
  const getTransitionClass = () => {
    if (isFirstRender) return "page-transition-static";

    switch (transitionPhase) {
      case "enter":
        return "page-transition-enter page-transition-enter-active";
      case "exit":
        return "page-transition-exit page-transition-exit-active";
      default:
        return "page-transition-static";
    }
  };

  if (isFirstRender) {
    // Pas d'animation lors du premier rendu pour améliorer le FCP
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      {/* Indicateur de chargement conditionnel */}
      {isLoading && showLoadingIndicator && <LoadingFallback />}

      {/* Transition animée entre les pages */}
      <div
        key={routeKey}
        className={cn("w-full", getTransitionClass(), className)}
        onTransitionEnd={() => {
          // Une fois la transition terminée, s'assurer que l'indicateur de chargement est masqué
          if (transitionPhase === "enter") {
            setIsLoading(false);
          }
        }}
      >
        {children}
      </div>
    </>
  );
}
