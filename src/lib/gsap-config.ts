import { gsap } from 'gsap'

// Type pour ScrollTrigger
type ScrollTriggerType = any

// Type pour GSAP
type GSAPInstance = typeof gsap

// Résultat de l'initialisation GSAP
interface GSAPInitResult {
  gsap: GSAPInstance
  ScrollTrigger?: ScrollTriggerType
}

// Importation conditionnelle pour éviter les erreurs côté serveur
// Les plugins seront importés uniquement côté client
export const initGSAP = async (): Promise<GSAPInitResult> => {
  if (typeof window !== 'undefined') {
    try {
      // Importation dynamique du plugin ScrollTrigger
      const ScrollTriggerModule = await import('gsap/ScrollTrigger')
      
      // Extraction du plugin
      const { ScrollTrigger } = ScrollTriggerModule
      
      // Enregistrement du plugin
      gsap.registerPlugin(ScrollTrigger)
      
      return {
        gsap,
        ScrollTrigger
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de GSAP:', error)
      return { gsap }
    }
  }
  
  return { gsap }
}

// Fonction utilitaire pour créer des animations d'entrée
export const createFadeInAnimation = (
  gsapInstance: GSAPInstance, 
  element: HTMLElement | string, 
  options?: {
    y?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    stagger?: number;
    onComplete?: () => void;
  }
) => {
  const defaults = {
    y: 30,
    duration: 0.7,
    delay: 0,
    ease: 'power2.out',
    stagger: 0,
  }
  
  const config = { ...defaults, ...options }
  
  return gsapInstance.fromTo(
    element,
    { opacity: 0, y: config.y },
    { 
      opacity: 1, 
      y: 0, 
      duration: config.duration, 
      delay: config.delay,
      ease: config.ease,
      stagger: config.stagger,
      onComplete: config.onComplete,
      clearProps: 'transform'
    }
  )
}

// Fonction utilitaire pour créer des animations parallaxes
export const createParallaxEffect = (
  gsapInstance: GSAPInstance,
  ScrollTrigger: ScrollTriggerType,
  element: HTMLElement | string,
  options?: {
    speed?: number;
    direction?: 'vertical' | 'horizontal';
    scrub?: boolean | number;
  }
) => {
  const defaults = {
    speed: 0.5,
    direction: 'vertical',
    scrub: 0.5
  }
  
  const config = { ...defaults, ...options }
  const triggerElement = element instanceof HTMLElement 
    ? element.parentElement || element
    : null
  
  if (!triggerElement && typeof element === 'string') {
    console.error('Élément parent introuvable pour le parallaxe')
    return null
  }
  
  const movement = config.direction === 'vertical' 
    ? { y: `-${20 * config.speed}%` } 
    : { x: `-${15 * config.speed}%` }
  
  return gsapInstance.fromTo(
    element,
    { y: 0, x: 0 },
    { 
      ...movement,
      ease: 'none',
      scrollTrigger: {
        trigger: triggerElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: config.scrub,
        invalidateOnRefresh: true
      }
    }
  )
}

// Pour usage dans les composants:
// import { initGSAP, createFadeInAnimation, createParallaxEffect } from '@/lib/gsap-config'
// 
// useEffect(() => {
//   const setupGSAP = async () => {
//     const { gsap, ScrollTrigger } = await initGSAP()
//     
//     // Utiliser gsap et ScrollTrigger ici
//   }
//   
//   setupGSAP()
// }, []) 