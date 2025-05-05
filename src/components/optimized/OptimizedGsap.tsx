'use client'

import { useEffect, useRef, useState } from 'react';
import { initGSAP } from '@/lib/gsap-config';

// Type pour le contexte GSAP
type GSAPContextType = any;

// Fonction de debounce pour limiter les appels aux fonctions
const debounce = (callback: Function, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), wait);
  };
};

// Fonction de throttle pour limiter les appels aux fonctions
const throttle = (callback: Function, limit: number) => {
  let waiting = false;
  return (...args: any[]) => {
    if (!waiting) {
      callback(...args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
};

/**
 * Hook personnalisé pour optimiser les animations GSAP
 * @param animationCallback La fonction de callback pour créer les animations
 * @param dependencies Les dépendances pour recharger les animations
 */
export function useOptimizedGsap(
  animationCallback: (gsap: any, ScrollTrigger: any) => void | (() => void),
  dependencies: any[] = []
) {
  const contextRef = useRef<GSAPContextType>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const cleanupFnRef = useRef<(() => void) | void>(undefined);
  
  // Mémoriser les dépendances pour éviter l'utilisation de l'opérateur spread dans useEffect
  const depsRef = useRef(dependencies);
  
  // Mettre à jour les dépendances quand elles changent
  useEffect(() => {
    depsRef.current = dependencies;
  }, [dependencies]);

  useEffect(() => {
    let ctx: GSAPContextType = null;
    let cleanupFn: (() => void) | void;
    let isLoading = true;

    // Empêcher l'exécution côté serveur
    if (typeof window === 'undefined') return;

    const setupGsap = async () => {
      try {
        // Importer GSAP dynamiquement
        const gsapModule = await import('gsap');
        const gsap = gsapModule.gsap;
        
        // Importer ScrollTrigger dynamiquement
        const ScrollTriggerModule = await import('gsap/ScrollTrigger');
        const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;
        
        // Enregistrer le plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Créer le contexte GSAP
        if (isLoading) {
          ctx = gsap.context(() => {
            // Exécuter le callback d'animation
            try {
              cleanupFn = animationCallback(gsap, ScrollTrigger);
              cleanupFnRef.current = cleanupFn;
            } catch (error) {
              console.error('Erreur lors de l\'exécution du callback d\'animation:', error);
            }
          });
          
          contextRef.current = ctx;
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de GSAP:', error);
      }
    };

    // Exécuter l'initialisation avec un petit délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      setupGsap();
    }, 100);

    // Cleanup lors du démontage du composant
    return () => {
      isLoading = false;
      clearTimeout(timer);
      if (ctx) ctx.revert();
      if (cleanupFnRef.current) cleanupFnRef.current();
    };
  }, [animationCallback]); // Nous avons retiré la dépendance spread ici

  return { isInitialized };
}

/**
 * Hook personnalisé pour créer un ScrollTrigger optimisé
 */
export function useOptimizedScrollTrigger() {
  // Optimiser le rafraîchissement du ScrollTrigger lors du redimensionnement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initScrollTrigger = async () => {
      try {
        const ScrollTriggerModule = await import('gsap/ScrollTrigger');
        const { ScrollTrigger } = ScrollTriggerModule;
        
        // Optimiser le rafraîchissement des ScrollTriggers lors des événements de redimensionnement
        const debouncedResize = debounce(() => {
          ScrollTrigger.refresh();
        }, 200);

        window.addEventListener('resize', debouncedResize);
        
        return () => {
          window.removeEventListener('resize', debouncedResize);
        };
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de ScrollTrigger:', error);
      }
    };
    
    initScrollTrigger();
  }, []);

  return null;
} 