// Breakpoints standards en pixels
export const breakpointValues = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Breakpoints en rem (divisé par 16)
export const breakpointRems = {
  xs: "20rem", // 320px
  sm: "40rem", // 640px
  md: "48rem", // 768px
  lg: "64rem", // 1024px
  xl: "80rem", // 1280px
  "2xl": "96rem", // 1536px
} as const;

// Breakpoints en format CSS
export const breakpointsPx = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Types pour les breakpoints
export type Breakpoint = keyof typeof breakpointValues;

// Utilitaires pour les media queries
export const mediaQueries = {
  up: (breakpoint: Breakpoint) =>
    `@media (min-width: ${breakpointsPx[breakpoint]})`,
  down: (breakpoint: Breakpoint) =>
    `@media (max-width: ${breakpointsPx[breakpoint]})`,
  between: (start: Breakpoint, end: Breakpoint) =>
    `@media (min-width: ${breakpointsPx[start]}) and (max-width: ${breakpointsPx[end]})`,
};

// Configuration pour Tailwind
export const tailwindBreakpoints = {
  screens: {
    xs: breakpointsPx.xs,
    sm: breakpointsPx.sm,
    md: breakpointsPx.md,
    lg: breakpointsPx.lg,
    xl: breakpointsPx.xl,
    "2xl": breakpointsPx["2xl"],
  },
};
