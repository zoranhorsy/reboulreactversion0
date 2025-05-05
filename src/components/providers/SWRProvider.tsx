'use client'

import { SWRConfig } from 'swr';
import React from 'react';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Configuration globale de SWR
        revalidateOnFocus: false,     // Ne pas revalider quand l'onglet reprend le focus
        revalidateOnReconnect: true,  // Revalider quand la connexion est rétablie
        refreshInterval: 0,           // Pas de revalidation automatique par défaut
        errorRetryCount: 3,           // Nombre de tentatives en cas d'erreur
        dedupingInterval: 5000,       // Intervalle de déduplication de 5 secondes
        onError: (error, key) => {
          console.error(`Erreur SWR pour la clé ${key}:`, error);
        },
        suspense: false,              // Ne pas utiliser Suspense par défaut
      }}
    >
      {children}
    </SWRConfig>
  );
} 