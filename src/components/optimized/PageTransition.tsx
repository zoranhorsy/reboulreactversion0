'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { cn } from '@/lib/utils'
import { LoadingFallback } from './LoadingFallback'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  showLoadingIndicator?: boolean
}

export function PageTransition({ 
  children, 
  className,
  showLoadingIndicator = true
}: PageTransitionProps) {
  const pathname = usePathname()
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Utiliser uniquement le chemin pour la clé unique
  const routeKey = pathname

  // Désactiver l'animation lors du premier rendu pour éviter de pénaliser le FCP
  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  // Gérer l'état de chargement
  useEffect(() => {
    if (isFirstRender) return

    // Afficher l'indicateur de chargement après un court délai
    const timeout = setTimeout(() => {
      setIsLoading(true)
    }, 300) // Délai avant d'afficher le loader pour éviter les flashs sur les navigations rapides
    
    setLoadingTimeout(timeout)

    // Masquer l'indicateur de chargement lorsque la page est chargée
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
      setIsLoading(false)
    }
  }, [pathname, isFirstRender, loadingTimeout])

  // Variants d'animation
  const variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.61, 1, 0.88, 1],
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.61, 1, 0.88, 1],
      },
    },
  }

  if (isFirstRender) {
    // Pas d'animation lors du premier rendu pour améliorer le FCP
    return <div className={className}>{children}</div>
  }

  return (
    <>
      {/* Indicateur de chargement conditionnel */}
      {isLoading && showLoadingIndicator && (
        <LoadingFallback 
          fullPage 
          delay={0} 
          message="Chargement de la page..."
        />
      )}
      
      {/* Transition animée entre les pages */}
      <AnimatePresence mode="wait">
        <motion.div
          key={routeKey}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={variants}
          className={cn("w-full", className)}
          onAnimationComplete={() => {
            // Une fois l'animation terminée, s'assurer que l'indicateur de chargement est masqué
            setIsLoading(false)
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
} 