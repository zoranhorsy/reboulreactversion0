'use client'

import { useEffect } from 'react'
import { useGSAP } from './GsapProvider'

// Composant simple qui permet d'initialiser et vérifier GSAP
export function GsapInitializer() {
  const { isReady, gsap } = useGSAP()
  
  useEffect(() => {
    if (isReady && gsap) {
      // GSAP est prêt à être utilisé
      console.info('GSAP est initialisé et prêt à l\'emploi')
    }
  }, [isReady, gsap])
  
  return null
}

