import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  /** Seuil pour déclencher l'animation (0 à 1) */
  threshold?: number;
  /** Marge autour de la zone de déclenchement */
  rootMargin?: string;
  /** Déclencher une seule fois ou à chaque passage */
  once?: boolean;
  /** Délai avant l'animation en ms */
  delay?: number;
  /** Classes CSS à ajouter quand l'élément est visible */
  visibleClass?: string;
  /** Classes CSS à ajouter quand l'élément n'est pas visible */
  hiddenClass?: string;
}

/**
 * Hook pour gérer les animations au scroll avec Intersection Observer
 * Remplace les animations ScrollTrigger de GSAP avec une approche plus performante
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    once = true,
    delay = 0,
    visibleClass = "in-view",
    hiddenClass = "",
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Observer pour détecter quand l'élément entre dans le viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Appliquer le délai si spécifié
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                element.classList.add(visibleClass);
                if (hiddenClass) {
                  element.classList.remove(hiddenClass);
                }
              }, delay);
            } else {
              setIsVisible(true);
              element.classList.add(visibleClass);
              if (hiddenClass) {
                element.classList.remove(hiddenClass);
              }
            }

            // Si on ne veut déclencher qu'une fois, arrêter d'observer
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // Si on peut déclencher plusieurs fois, gérer la sortie du viewport
            setIsVisible(false);
            element.classList.remove(visibleClass);
            if (hiddenClass) {
              element.classList.add(hiddenClass);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    // Commencer à observer
    observer.observe(element);

    // Nettoyage
    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once, delay, visibleClass, hiddenClass]);

  return { elementRef, isVisible };
}

/**
 * Hook pour gérer les animations staggered (en cascade)
 * Remplace les animations timeline GSAP
 */
export function useStaggerReveal(
  options: ScrollRevealOptions & { staggerDelay?: number } = {},
) {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    once = true,
    staggerDelay = 100,
    visibleClass = "in-view",
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);

            // Ajouter la classe container
            container.classList.add(visibleClass);

            // Animer les enfants avec un délai en cascade
            const children = Array.from(container.children) as HTMLElement[];
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add("animated");
              }, index * staggerDelay);
            });

            if (once) {
              observer.unobserve(container);
            }
          } else if (!once) {
            setIsVisible(false);
            container.classList.remove(visibleClass);
            const children = Array.from(container.children) as HTMLElement[];
            children.forEach((child) => {
              child.classList.remove("animated");
            });
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [threshold, rootMargin, once, staggerDelay, visibleClass]);

  return { containerRef, isVisible };
}

/**
 * Hook pour gérer le parallax CSS simple
 * Remplace les effets parallax GSAP
 */
export function useParallax(speed: number = 0.5) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const updateParallax = () => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculer si l'élément est visible
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        // Calculer le pourcentage de défilement
        const scrolled =
          (windowHeight - elementTop) / (windowHeight + elementHeight);
        const parallaxValue = scrolled * speed * 100;

        element.style.transform = `translateY(${parallaxValue}px)`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Calculer la position initiale
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  return elementRef;
}

/**
 * Hook pour gérer les animations basées sur l'état visible/caché
 * Utile pour remplacer les toggles GSAP
 */
export function useToggleAnimation(
  isVisible: boolean,
  options: {
    enterClass?: string;
    exitClass?: string;
    duration?: number;
  } = {},
) {
  const {
    enterClass = "animate-fade-in-up",
    exitClass = "animate-fade-out",
    duration = 300,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isVisible) {
      element.classList.remove(exitClass);
      element.classList.add(enterClass);
    } else {
      element.classList.remove(enterClass);
      element.classList.add(exitClass);
    }

    // Nettoyer les classes après l'animation
    const cleanup = setTimeout(() => {
      if (element) {
        element.classList.remove(enterClass, exitClass);
      }
    }, duration);

    return () => clearTimeout(cleanup);
  }, [isVisible, enterClass, exitClass, duration]);

  return elementRef;
}

/**
 * Hook pour gérer les animations de performance optimisées
 * Utilise will-change et d'autres optimisations
 */
export function usePerformantAnimation() {
  const elementRef = useRef<HTMLElement>(null);

  const startAnimation = (animationClass: string, duration: number = 300) => {
    const element = elementRef.current;
    if (!element) return;

    // Optimiser les performances
    element.style.willChange = "transform, opacity";
    element.classList.add("gpu-accelerated");
    element.classList.add(animationClass);

    // Nettoyer après l'animation
    setTimeout(() => {
      if (element) {
        element.style.willChange = "auto";
        element.classList.remove("gpu-accelerated");
        element.classList.add("animation-cleanup");

        // Retirer la classe de nettoyage après un court délai
        setTimeout(() => {
          element.classList.remove("animation-cleanup", animationClass);
        }, 50);
      }
    }, duration);
  };

  return { elementRef, startAnimation };
}

/**
 * Hook pour remplacer les animations GSAP timeline complexes
 */
export function useSequenceAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const playSequence = (
    steps: Array<{
      element: HTMLElement;
      animationClass: string;
      delay: number;
      duration: number;
    }>,
  ) => {
    // Nettoyer les timeouts précédents
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.element.classList.add(step.animationClass);
        setCurrentStep(index + 1);

        // Nettoyer après la durée de l'animation
        setTimeout(() => {
          step.element.classList.remove(step.animationClass);
        }, step.duration);
      }, step.delay);

      timeoutsRef.current.push(timeout);
    });
  };

  const stopSequence = () => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
    setCurrentStep(0);
  };

  return { currentStep, playSequence, stopSequence };
}
