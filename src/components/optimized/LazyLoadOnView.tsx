'use client'

import React, { ComponentType, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'

interface LazyLoadOnViewProps<T = any> {
  /** Fonction d'import du composant à charger */
  importFn: () => Promise<{ default: ComponentType<T> }>
  /** Props à passer au composant chargé */
  componentProps?: T
  /** Composant à afficher pendant le chargement */
  fallback?: React.ReactNode
  /** Seuil de visibilité pour déclencher le chargement (0-1) */
  threshold?: number
  /** Marge autour de l'élément pour pré-charger (ex: "200px") */
  rootMargin?: string
  /** Déclencher une seule fois */
  triggerOnce?: boolean
  /** Activer le débogage */
  debug?: boolean
  /** Classe CSS du conteneur */
  className?: string
}

/**
 * Charge un composant dynamiquement uniquement lorsqu'il devient visible
 * dans le viewport, ce qui permet de réduire le bundle initial.
 * 
 * @example
 * ```jsx
 * <LazyLoadOnView
 *   importFn={() => import('@/components/HeavyComponent')}
 *   fallback={<div className="h-64 w-full animate-pulse bg-zinc-100/10 rounded-md" />}
 * />
 * ```
 */
export function LazyLoadOnView<T extends JSX.IntrinsicAttributes>({
  importFn,
  componentProps = {} as T,
  fallback = null,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
  debug = false,
  className = '',
}: LazyLoadOnViewProps<T>) {
  const [Component, setComponent] = useState<ComponentType<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  })
  
  useEffect(() => {
    if (inView && !Component && !loading) {
      setLoading(true)
      
      // Chargement du composant une fois visible
      importFn()
        .then((module) => {
          setComponent(() => module.default)
          if (debug) console.log('LazyLoadOnView: Composant chargé avec succès')
        })
        .catch((err) => {
          setError(err)
          if (debug) console.error('LazyLoadOnView: Erreur lors du chargement', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [inView, Component, loading, importFn, debug])
  
  if (error) {
    return (
      <div className={`text-red-500 p-4 border border-red-200 rounded-md ${className}`}>
        Erreur lors du chargement du composant.
      </div>
    )
  }
  
  if (!Component) {
    return <div ref={ref} className={className}>{fallback}</div>
  }
  
  return <Component {...componentProps} />
}

/**
 * Crée un composant lazy-loadable avec import dynamique et chargement à la vue
 * 
 * @example
 * ```jsx
 * const LazyHeavyComponent = createLazyComponent(() => import('@/components/HeavyComponent'));
 * 
 * // Utilisation
 * <LazyHeavyComponent additionalProp="value" />
 * ```
 */
export function createLazyComponent<T extends JSX.IntrinsicAttributes>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: Omit<LazyLoadOnViewProps<T>, 'importFn' | 'componentProps'> = {}
) {
  return function LazyComponent(props: T) {
    return (
      <LazyLoadOnView<T>
        importFn={importFn}
        componentProps={props}
        {...options}
      />
    )
  }
} 