'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Imports dynamiques des composants volumineux avec paramètres optimisés de code splitting
export const DynamicProductVariantModal = dynamic(
  () => import('./ProductVariantModal').then(mod => ({ default: mod.ProductVariantModal })),
  { ssr: false, loading: () => null }
)

export const DynamicUserProfile = dynamic(
  () => import('./UserProfile'),
  { ssr: false, loading: () => null }
)

export const DynamicOrderHistory = dynamic(
  () => import('./OrderHistory'),
  { ssr: false, loading: () => null }
)

export const DynamicLatestCollections = dynamic(
  () => import('./LatestCollections').then(mod => ({ default: mod.LatestCollections })),
  { ssr: false, loading: () => null }
)

export const DynamicStoreSelection = dynamic(
  () => import('./StoreSelection').then(mod => ({ default: mod.StoreSelection })),
  { ssr: false, loading: () => null }
)

// Fonction pour précharger des modules spécifiques
export function preloadComponent(
  importFn: () => Promise<any>
) {
  if (typeof window !== 'undefined') {
    // Précharger après l'hydratation pour améliorer la performance perçue
    setTimeout(() => {
      importFn().catch(() => {
        // Ignorer les erreurs de préchargement silencieusement
      })
    }, 0)
  }
}

// Précharger les composants importants lors de l'hydratation initiale
if (typeof window !== 'undefined') {
  // Utilisation d'un délai minimal pour donner la priorité à l'hydratation
  setTimeout(() => {
    preloadComponent(() => import('./ProductVariantModal'))
    preloadComponent(() => import('./UserProfile'))
  }, 2000) // Délai pour permettre l'hydratation complète d'abord
} 