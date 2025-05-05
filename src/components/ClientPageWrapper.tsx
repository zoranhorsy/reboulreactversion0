'use client'

import React, { ReactNode, Suspense } from 'react'
import { LoadingIndicator } from './LoadingIndicator'
import ClientOnly from './ClientOnly'

interface ClientPageWrapperProps {
  children: ReactNode
}

/**
 * Composant wrapper qui combine ClientOnly et Suspense pour résoudre les problèmes
 * liés à useSearchParams() et autres fonctionnalités qui nécessitent un Suspense boundary
 */
export function ClientPageWrapper({ 
  children
}: ClientPageWrapperProps) {
  return (
    <ClientOnly>
      <Suspense fallback={<LoadingIndicator />}>
        {children}
      </Suspense>
    </ClientOnly>
  )
}

/**
 * Configuration viewport recommandée pour les pages Next.js
 * À utiliser avec: export const viewport = defaultViewport
 */
export const defaultViewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
} 