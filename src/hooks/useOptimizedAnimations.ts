import { useEffect, useRef, useCallback, useMemo } from "react";

interface OptimizedAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
  staggerDelay?: number;
  animationType?: "fade" | "slide" | "scale" | "stagger";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  easing?: string;
}

/**
 * Hook ultra-optimisé pour toutes les animations
 * Remplace tous les hooks d'animation existants par une solution unifiée
 */
export function useOptimizedAnimation(options: OptimizedAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "50px",
    once = true,
    delay = 0,
    staggerDelay = 100,
    animationType = "fade",
    direction = "up",
    duration = 500,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mémoriser les styles CSS pour éviter les recalculs
  const animationStyles = useMemo(() => {
    const baseTransition = `all ${duration}ms ${easing}`;

    switch (animationType) {
      case "slide":
        return {
          initial: {
            opacity: "0",
            transform: `translate${direction === "left" || direction === "right" ? "X" : "Y"}(${
              direction === "left"
                ? "-30px"
                : direction === "right"
                  ? "30px"
                  : direction === "up"
                    ? "30px"
                    : "-30px"
            })`,
            transition: baseTransition,
          },
          visible: {
            opacity: "1",
            transform: "translate(0, 0)",
            transition: baseTransition,
          },
        };
      case "scale":
        return {
          initial: {
            opacity: "0",
            transform: "scale(0.9)",
            transition: baseTransition,
          },
          visible: {
            opacity: "1",
            transform: "scale(1)",
            transition: baseTransition,
          },
        };
      default: // fade
        return {
          initial: {
            opacity: "0",
            transform: "none",
            transition: baseTransition,
          },
          visible: {
            opacity: "1",
            transform: "none",
            transition: baseTransition,
          },
        };
    }
  }, [animationType, direction, duration, easing]);

  // Fonction optimisée pour appliquer les styles
  const applyStyles = useCallback(
    (element: HTMLElement, styles: Record<string, string>) => {
      // Utiliser une seule opération de style pour éviter les reflows multiples
      const styleString = Object.entries(styles)
        .map(
          ([key, value]) =>
            `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`,
        )
        .join("; ");

      element.style.cssText += "; " + styleString;
    },
    [],
  );

  // Animation staggered optimisée
  const animateStaggered = useCallback(
    (element: HTMLElement) => {
      const children = Array.from(element.children) as HTMLElement[];

      children.forEach((child, index) => {
        // Appliquer les styles initiaux immédiatement
        applyStyles(child, animationStyles.initial);

        // Programmer l'animation avec un délai
        setTimeout(
          () => {
            applyStyles(child, animationStyles.visible);
          },
          delay + index * staggerDelay,
        );
      });
    },
    [animationStyles, delay, staggerDelay, applyStyles],
  );

  // Animation simple optimisée
  const animateElement = useCallback(
    (element: HTMLElement) => {
      applyStyles(element, animationStyles.initial);

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          applyStyles(element, animationStyles.visible);
        }, delay);
      } else {
        // Utiliser requestAnimationFrame pour la fluidité
        requestAnimationFrame(() => {
          applyStyles(element, animationStyles.visible);
        });
      }
    },
    [animationStyles, delay, applyStyles],
  );

  // Observer optimisé avec debouncing
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Nettoyer l'observer précédent
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (animationType === "stagger") {
              animateStaggered(entry.target as HTMLElement);
            } else {
              animateElement(entry.target as HTMLElement);
            }

            if (once) {
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    threshold,
    rootMargin,
    once,
    animationType,
    animateStaggered,
    animateElement,
  ]);

  return { elementRef };
}

/**
 * Hook spécialisé pour les animations de hover optimisées
 */
export function useOptimizedHover(
  options: {
    scale?: number;
    translateY?: number;
    duration?: number;
    easing?: string;
  } = {},
) {
  const {
    scale = 1.05,
    translateY = -8,
    duration = 200,
    easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Optimiser avec will-change au début
    element.style.willChange = "transform";
    element.style.transition = `transform ${duration}ms ${easing}`;

    const handleMouseEnter = () => {
      element.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = "scale(1) translateY(0)";
    };

    element.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    element.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.style.willChange = "auto";
    };
  }, [scale, translateY, duration, easing]);

  return { elementRef };
}

/**
 * Hook pour les animations de marquee optimisées
 */
export function useOptimizedMarquee(
  options: {
    speed?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
  } = {},
) {
  const { speed = 50, direction = "left", pauseOnHover = true } = options;

  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Créer l'animation CSS dynamiquement
    const animationName = `marquee-${direction}-${speed}`;
    const keyframes = `
      @keyframes ${animationName} {
        0% { transform: translateX(${direction === "left" ? "100%" : "-100%"}); }
        100% { transform: translateX(${direction === "left" ? "-100%" : "100%"}); }
      }
    `;

    // Injecter les keyframes
    const style = document.createElement("style");
    style.textContent = keyframes;
    document.head.appendChild(style);

    // Appliquer l'animation
    container.style.animation = `${animationName} ${speed}s linear infinite`;

    if (pauseOnHover) {
      const handleMouseEnter = () => {
        container.style.animationPlayState = "paused";
      };

      const handleMouseLeave = () => {
        container.style.animationPlayState = "running";
      };

      container.addEventListener("mouseenter", handleMouseEnter, {
        passive: true,
      });
      container.addEventListener("mouseleave", handleMouseLeave, {
        passive: true,
      });

      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
        document.head.removeChild(style);
      };
    }

    return () => {
      document.head.removeChild(style);
    };
  }, [speed, direction, pauseOnHover]);

  return { containerRef };
}
