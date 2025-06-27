/**
 * Stratégies de chargement dynamique pour optimiser les bundles JavaScript
 *
 * Ce fichier contient des utilitaires et patterns pour implémenter le chargement
 * dynamique de composants et bibliothèques volumineuses, réduisant ainsi la taille
 * initiale du bundle JavaScript.
 */

import React, { ComponentType, useState, useEffect, ReactNode } from "react";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

// Types
interface DynamicImportOptions {
  /** Composant à afficher pendant le chargement */
  loadingComponent?: React.ReactNode;
  /** Activer/désactiver le SSR */
  ssr?: boolean;
  /** Déclencher un préchargement */
  preload?: boolean;
  /** Délai avant préchargement (ms) */
  preloadDelay?: number;
  /** Priorité d'import (impact sur l'ordre de chargement) */
  priority?: "high" | "medium" | "low";
}

interface ViewportLoadOptions extends DynamicImportOptions {
  /** Seuil de visibilité pour déclencher le chargement (0-1) */
  threshold?: number;
  /** Marge autour de l'élément pour pré-charger (ex: "200px") */
  rootMargin?: string;
  /** Déclencher une seule fois */
  triggerOnce?: boolean;
}

/**
 * Crée un composant qui se charge dynamiquement uniquement lorsqu'il devient visible
 *
 * @example
 * ```tsx
 * const LazyChart = createViewportLoadedComponent(() => import('@/components/Chart'));
 *
 * // Usage
 *
 * ```
 */
export function createViewportLoadedComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: ViewportLoadOptions = {},
) {
  const {
    loadingComponent = null,
    ssr = false,
    threshold = 0.1,
    rootMargin = "200px",
    triggerOnce = true,
    preload = false,
    preloadDelay = 2000,
    priority = "medium",
  } = options;

  // Précharger les composants haute priorité après un délai
  if (preload && priority === "high" && typeof window !== "undefined") {
    setTimeout(() => {
      importFn().catch(() => {
        /* Ignorer silencieusement */
      });
    }, preloadDelay);
  }

  return function ViewportLoadedComponent(props: P & { children?: ReactNode }) {
    const [Component, setComponent] = useState<ComponentType<P> | null>(null);
    const { ref, inView } = useInView({
      threshold,
      rootMargin,
      triggerOnce,
    });

    useEffect(() => {
      if (inView && !Component) {
        importFn()
          .then((module) => {
            setComponent(() => module.default);
          })
          .catch((err) => {
            console.error("Erreur lors du chargement dynamique:", err);
          });
      }
    }, [inView, Component]);

    if (!Component) {
      return React.createElement("div", { ref }, loadingComponent);
    }

    return React.createElement(Component, props);
  };
}

/**
 * Crée un composant avec chargement dynamique basé sur une condition
 *
 * @example
 * ```tsx
 * const DynamicAdminPanel = createConditionalComponent(
 *   () => import('@/components/AdminPanel'),
 *   () => user && user.role === 'admin'
 * );
 * ```
 */
export function createConditionalComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  condition: () => boolean,
  options: DynamicImportOptions = {},
) {
  const { loadingComponent = null, ssr = false } = options;

  return function ConditionalComponent(props: P & { children?: ReactNode }) {
    const [Component, setComponent] = useState<ComponentType<P> | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    // Vérifier la condition
    useEffect(() => {
      const isConditionMet = condition();
      setShouldLoad(isConditionMet);

      if (isConditionMet && !Component) {
        importFn()
          .then((module) => {
            setComponent(() => module.default);
          })
          .catch((err) => {
            console.error("Erreur lors du chargement conditionnel:", err);
          });
      }
    }, [Component]);

    if (!shouldLoad) {
      return null;
    }

    if (!Component) {
      return React.createElement(React.Fragment, null, loadingComponent);
    }

    return React.createElement(Component, props);
  };
}

/**
 * Crée un composant qui se charge en fonction d'une interaction utilisateur
 *
 * @example
 * ```tsx
 * const HeavyEditor = createInteractionLoadedComponent(
 *   () => import('@/components/Editor'),
 *   'hover'
 * );
 * ```
 */
export function createInteractionLoadedComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  interactionType: "hover" | "click" | "focus" = "hover",
  options: DynamicImportOptions = {},
) {
  const { loadingComponent = null, ssr = false } = options;

  return function InteractionLoadedComponent(
    props: P & { children?: ReactNode },
  ) {
    const [Component, setComponent] = useState<ComponentType<P> | null>(null);
    const [triggered, setTriggered] = useState(false);
    const [loading, setLoading] = useState(false);

    // Gestionnaires d'événements
    const handleInteraction = () => {
      if (!triggered && !loading) {
        setLoading(true);
        setTriggered(true);

        importFn()
          .then((module) => {
            setComponent(() => module.default);
          })
          .catch((err) => {
            console.error("Erreur lors du chargement par interaction:", err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    // Déterminer les handlers d'événements selon le type d'interaction
    const interactionProps = {
      ...(interactionType === "hover" && { onMouseEnter: handleInteraction }),
      ...(interactionType === "click" && { onClick: handleInteraction }),
      ...(interactionType === "focus" && { onFocus: handleInteraction }),
    };

    if (!Component) {
      return React.createElement(
        "div",
        interactionProps,
        loading ? loadingComponent : props.children || loadingComponent,
      );
    }

    return React.createElement(Component, props);
  };
}

/**
 * Charge dynamiquement une bibliothèque JavaScript (non-React)
 *
 * @example
 * ```ts
 * // Usage dans un composant
 * const Chart = async () => {
 *   const chartLib = await loadLibraryDynamically(() => import('chart.js'));
 *   // Utiliser chartLib...
 * }
 * ```
 */
export function loadLibraryDynamically<T>(
  importFn: () => Promise<T>,
  options: { cache?: boolean } = {},
): Promise<T> {
  const { cache = true } = options;

  // Cache des bibliothèques chargées
  const cacheStore: Record<string, T> = {};
  const cacheKey = importFn.toString();

  // Retourner depuis le cache si disponible
  if (cache && cacheStore[cacheKey]) {
    return Promise.resolve(cacheStore[cacheKey]);
  }

  // Sinon charger et mettre en cache
  return importFn().then((lib) => {
    if (cache) {
      cacheStore[cacheKey] = lib;
    }
    return lib;
  });
}

/**
 * Précharge les bibliothèques essentielles pendant les périodes d'inactivité
 *
 * @example
 * ```ts
 * // Utiliser dans le layout ou un composant global
 * useIdlePreload([
 *   { fn: () => import('@/components/HeavyComponent'), priority: 'high' },
 *   { fn: () => import('three'), priority: 'medium' }
 * ]);
 * ```
 */
export function useIdlePreload(
  imports: Array<{
    fn: () => Promise<any>;
    priority: "high" | "medium" | "low";
  }>,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Vérifier si requestIdleCallback est disponible
    const requestIdle =
      (window as any).requestIdleCallback ||
      ((cb: (deadline?: IdleDeadline) => void) => setTimeout(cb, 1000));

    // Créer une file d'imports triée par priorité
    const queue = [...imports].sort((a, b) => {
      const priorityWeight: Record<string, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });

    // Fonction qui traite les imports pendant les périodes d'inactivité
    const processQueue = (deadline?: IdleDeadline) => {
      // S'il reste du temps d'inactivité ou si deadline n'est pas fourni
      if (!deadline || deadline.timeRemaining() > 0) {
        const nextImport = queue.shift();
        if (nextImport) {
          nextImport
            .fn()
            .catch(() => {
              /* Ignorer silencieusement */
            })
            .finally(() => {
              // Si la file n'est pas vide, continuer pendant la prochaine période d'inactivité
              if (queue.length > 0) {
                requestIdle(processQueue);
              }
            });
        }
      } else if (queue.length > 0) {
        // S'il n'y a plus de temps mais qu'il reste des imports, reprogrammer
        requestIdle(processQueue);
      }
    };

    // Démarrer le traitement des imports
    if (queue.length > 0) {
      requestIdle(processQueue);
    }

    // Nettoyer si nécessaire
    return () => {
      // Rien à faire pour l'instant
    };
  }, [imports]);
}

// Types pour requestIdleCallback
interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}

interface Window {
  requestIdleCallback: (
    callback: (deadline: IdleDeadline) => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback: (handle: number) => void;
}
