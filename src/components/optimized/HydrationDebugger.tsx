"use client";

import React, { useEffect, useState, useRef } from "react";
import config from "@/config";

type HydrationDebuggerProps = {
  componentName: string;
  children: React.ReactNode;
  verbose?: boolean;
};

/**
 * HydrationDebugger - Composant pour détecter et résoudre les problèmes d'hydratation
 *
 * Utilisation:
 *
 *
 * </HydrationDebugger>
 */
export function HydrationDebugger({
  componentName,
  children,
  verbose = false,
}: HydrationDebuggerProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const timeRef = useRef(Date.now());
  const hydrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Marquer comme hydraté avec timestamp
    const hydrationTime = Date.now() - timeRef.current;
    setIsHydrated(true);

    // Log uniquement en mode debug
    if (config.debug) {
      if (verbose) {
        console.log(
          `🔄 Hydratation de ${componentName} terminée en ${hydrationTime}ms`,
          { component: componentName, timeMs: hydrationTime },
        );
      }

      // Ajouter un attribut data pour faciliter l'inspection
      if (hydrationRef.current) {
        hydrationRef.current.setAttribute(
          "data-hydration-time-ms",
          hydrationTime.toString(),
        );
      }
    }

    // Cleanup
    return () => {
      if (config.debug && verbose) {
        console.log(`💫 Nettoyage du composant ${componentName}`);
      }
    };
  }, [componentName, verbose]);

  // Ajouter des attributs data pour identifier le composant et son état d'hydratation
  return (
    <div
      ref={hydrationRef}
      data-hydration-component={componentName}
      data-hydrated={isHydrated}
      data-client-render={typeof window !== "undefined"}
      style={{ display: "contents" }} // N'affecte pas le rendu visuel
    >
      {children}
    </div>
  );
}

/**
 * withHydrationDebugging - HOC pour envelopper des composants avec le débogueur d'hydratation
 */
export function withHydrationDebugging<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  debugOptions: { componentName: string; verbose?: boolean } = {
    componentName:
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      "UnknownComponent",
    verbose: false,
  },
) {
  const WithHydrationDebugging = (props: P) => (
    <HydrationDebugger
      componentName={debugOptions.componentName}
      verbose={debugOptions.verbose}
    >
      <WrappedComponent {...props} />
    </HydrationDebugger>
  );

  WithHydrationDebugging.displayName = `WithHydrationDebugging(${debugOptions.componentName})`;

  return WithHydrationDebugging;
}
