'use client'

import React, { useEffect, createContext, useContext, useState } from 'react'
import { initGSAP } from '@/lib/gsap-config'

// Type pour le contexte GSAP
interface GSAPContextType {
  gsap: any
  ScrollTrigger?: any
  isReady: boolean
}

// Création du contexte avec des valeurs par défaut
const GSAPContext = createContext<GSAPContextType>({
  gsap: null,
  ScrollTrigger: null,
  isReady: false
})

// Hook personnalisé pour utiliser GSAP dans les composants
export const useGSAP = () => useContext(GSAPContext)

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const [gsapState, setGsapState] = useState<GSAPContextType>({
    gsap: null,
    ScrollTrigger: null,
    isReady: false
  })

  useEffect(() => {
    // Initialiser GSAP uniquement côté client
    const setupGSAP = async () => {
      try {
        const { gsap, ScrollTrigger } = await initGSAP()
        
        // Configurer les settings globaux de GSAP
        gsap.config({
          autoSleep: 60,
          nullTargetWarn: false
        })
        
        setGsapState({
          gsap,
          ScrollTrigger,
          isReady: true
        })
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du provider GSAP:', error)
      }
    }

    setupGSAP()
  }, [])

  return (
    <GSAPContext.Provider value={gsapState}>
      {children}
    </GSAPContext.Provider>
  )
}

export default GSAPProvider 