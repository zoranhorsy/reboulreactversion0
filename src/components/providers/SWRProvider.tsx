"use client";

import { SWRConfig } from "swr";
import React from "react";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        onError: (error, key) => {
          console.error(`Erreur SWR pour la clé ${key}:`, error);
        },
        suspense: false, // Ne pas utiliser Suspense par défaut
      }}
    >
      {children}
    </SWRConfig>
  );
}
