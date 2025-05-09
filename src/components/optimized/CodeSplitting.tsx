'use client'

import React, { ComponentType, ReactNode, useEffect, Suspense } from 'react'
import dynamic, { DynamicOptionsLoadingProps } from 'next/dynamic'

// Type pour les options de chargement
type LoadingOptions = {
  priority?: boolean
  skeleton?: ReactNode
  delay?: number
  ssr?: boolean
}

/**
 * Charge un composant de manière optimisée avec gestion intelligente du code splitting
 *
 * @param importFunc - Fonction d'import dynamique
 * @param options - Options de chargement
 * @returns - Composant dynamique optimisé
 */
export function smartLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LoadingOptions = {}
) {
  const {
    priority = false,
    skeleton = null,
    delay = 0,
    ssr = false,
  } = options

  // Définir le comportement de chargement
  const loadingComponent = (_loadingProps: DynamicOptionsLoadingProps): React.ReactElement | null => {
    if (!skeleton) return null
    return React.isValidElement(skeleton) ? skeleton : <div>{skeleton}</div>
  }

  // Créer le composant dynamique
  const DynamicComponent = dynamic(importFunc, {
    loading: loadingComponent,
    ssr,
  })

  // Précharger si prioritaire
  if (priority && typeof window !== 'undefined') {
    setTimeout(() => {
      importFunc().catch(() => {
        // Ignorer les erreurs silencieusement
      })
    }, delay)
  }

  return DynamicComponent
}

/**
 * Wrapper pour le chargement optimisé avec Suspense
 */
interface OptimizedLoadProps {
  children: ReactNode
  fallback?: ReactNode
}

export function OptimizedLoad({ children, fallback = null }: OptimizedLoadProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

/**
 * Hook pour précharger une liste de modules en arrière-plan
 * @param modules - Liste des fonctions d'import des modules à précharger
 * @param delay - Délai avant le préchargement (en ms)
 */
export function usePreloadModules(modules: Array<() => Promise<any>>, delay = 1000) {
  useEffect(() => {
    // Ne précharger qu'après l'hydratation complète
    const timer = setTimeout(() => {
      modules.forEach((moduleLoader) => {
        moduleLoader().catch(() => {
          // Ignorer les erreurs silencieusement
        })
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [modules, delay])
} 