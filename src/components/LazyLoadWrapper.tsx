"use client";

import React, { Suspense, ReactNode, useState, useEffect } from "react";

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

/**
 * Composant qui permet de charger paresseusement d'autres composants
 * avec un fallback personnalisable pendant le chargement
 */
export function LazyLoadWrapper({
  children,
  fallback = null,
  delay = 200,
}: LazyLoadWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  // Détection du client-side
  useEffect(() => {
    setIsClient(true);

    // Appliquer un délai minimal pour éviter le flash du fallback
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Côté serveur ou pendant le délai initial, afficher le fallback
  if (!isClient || showFallback) {
    return <>{fallback}</>;
  }

  // Utiliser Suspense pour gérer le chargement asynchrone
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
