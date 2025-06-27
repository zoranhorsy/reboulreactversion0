import { useState, useEffect } from "react";

// Définition des breakpoints standards
export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Vérifier si window est disponible (côté client)
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // Mettre à jour l'état initial
    setMatches(media.matches);

    // Gestionnaire d'événements pour les changements
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Utiliser addEventlistener au lieu de addListener (déprécié)
    media.addEventListener("change", listener);

    // Nettoyage
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Hook utilitaire pour les breakpoints prédéfinis
export function useBreakpoint(
  breakpoint: Breakpoint,
  type: "min" | "max" = "min",
): boolean {
  const query =
    type === "min"
      ? `(min-width: ${breakpoints[breakpoint]})`
      : `(max-width: ${breakpoints[breakpoint]})`;

  return useMediaQuery(query);
}

// Hook pour détecter si on est sur mobile
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.md})`);
}

// Hook pour détecter si on est sur tablette
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  );
}

// Hook pour détecter si on est sur desktop
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`);
}
