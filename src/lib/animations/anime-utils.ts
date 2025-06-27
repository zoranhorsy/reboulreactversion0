import anime from "animejs";

/**
 * Utilitaires AnimeJS pour remplacer les animations Framer-Motion
 * Plus léger (8KB vs 120KB) et tout aussi efficace
 */

// Types pour les animations
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
}

export interface FadeInConfig extends AnimationConfig {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export interface ScaleConfig extends AnimationConfig {
  from?: number;
  to?: number;
}

export interface StaggerConfig extends AnimationConfig {
  staggerDelay?: number;
}

/**
 * FadeIn - Remplace motion.div avec initial/animate opacity
 */
export const fadeIn = (
  element: string | HTMLElement | HTMLElement[],
  config: FadeInConfig = {},
) => {
  const {
    duration = 600,
    delay = 0,
    easing = "easeOutQuad",
    direction = "up",
    distance = 20,
  } = config;

  // Définir les transformations selon la direction
  const transforms: any = {
    opacity: [0, 1],
  };

  switch (direction) {
    case "up":
      transforms.translateY = [distance, 0];
      break;
    case "down":
      transforms.translateY = [-distance, 0];
      break;
    case "left":
      transforms.translateX = [distance, 0];
      break;
    case "right":
      transforms.translateX = [-distance, 0];
      break;
  }

  return anime({
    targets: element,
    duration,
    delay,
    easing,
    ...transforms,
  });
};

/**
 * ScaleIn - Remplace motion.div avec scale animations
 */
export const scaleIn = (
  element: string | HTMLElement | HTMLElement[],
  config: ScaleConfig = {},
) => {
  const {
    duration = 400,
    delay = 0,
    easing = "easeOutBack",
    from = 0.8,
    to = 1,
  } = config;

  return anime({
    targets: element,
    scale: [from, to],
    opacity: [0, 1],
    duration,
    delay,
    easing,
  });
};

/**
 * SlideIn - Pour les galeries et carousels
 */
export const slideIn = (
  element: string | HTMLElement | HTMLElement[],
  config: FadeInConfig = {},
) => {
  const {
    duration = 500,
    delay = 0,
    easing = "easeOutCubic",
    direction = "left",
    distance = 100,
  } = config;

  const transforms: any = {
    opacity: [0, 1],
  };

  if (direction === "left" || direction === "right") {
    transforms.translateX =
      direction === "left" ? [-distance, 0] : [distance, 0];
  } else {
    transforms.translateY = direction === "up" ? [distance, 0] : [-distance, 0];
  }

  return anime({
    targets: element,
    duration,
    delay,
    easing,
    ...transforms,
  });
};

/**
 * StaggerAnimation - Remplace les animations staggered de Framer-Motion
 */
export const staggerAnimation = (
  elements: string | HTMLElement[],
  config: StaggerConfig = {},
) => {
  const {
    duration = 600,
    delay = 0,
    easing = "easeOutQuad",
    staggerDelay = 100,
  } = config;

  return anime({
    targets: elements,
    translateY: [20, 0],
    opacity: [0, 1],
    duration,
    delay: anime.stagger(staggerDelay, { start: delay }),
    easing,
  });
};

/**
 * HoverScale - Remplace whileHover de Framer-Motion
 */
export const createHoverEffect = (
  element: HTMLElement,
  config: { scale?: number; duration?: number } = {},
) => {
  const { scale = 1.05, duration = 200 } = config;

  const handleMouseEnter = () => {
    anime({
      targets: element,
      scale: scale,
      duration: duration,
      easing: "easeOutQuad",
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: element,
      scale: 1,
      duration: duration,
      easing: "easeOutQuad",
    });
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  // Retourner une fonction de cleanup
  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
};

/**
 * AnimatePresence equivalent - Pour les modales et popups
 */
export const fadeInOut = {
  enter: (element: HTMLElement, config: AnimationConfig = {}) => {
    const { duration = 300, easing = "easeOutQuad" } = config;

    return anime({
      targets: element,
      opacity: [0, 1],
      scale: [0.9, 1],
      duration,
      easing,
    });
  },

  exit: (element: HTMLElement, config: AnimationConfig = {}) => {
    const { duration = 200, easing = "easeInQuad" } = config;

    return anime({
      targets: element,
      opacity: [1, 0],
      scale: [1, 0.9],
      duration,
      easing,
    });
  },
};

/**
 * Hook React pour utiliser facilement les animations
 */
export const useAnimeAnimation = () => {
  return {
    fadeIn,
    scaleIn,
    slideIn,
    staggerAnimation,
    createHoverEffect,
    fadeInOut,
  };
};

// Export des easings couramment utilisés
export const easings = {
  easeOutQuad: "easeOutQuad",
  easeOutCubic: "easeOutCubic",
  easeOutBack: "easeOutBack",
  easeInOut: "easeInOutQuad",
  elastic: "easeOutElastic",
};
