'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Dock } from '@/components/Dock'
import { LoaderComponent } from '@/components/ui/Loader'

// Optimiser les imports dynamiques avec un meilleur code splitting et préchargement
const DynamicBodyAttributes = dynamic(() => import('@/components/DynamicBodyAttributes'), { 
    ssr: false,
    loading: () => null
})

const GsapInitializer = dynamic(() => import('@/components/GsapInitializer'), { 
    ssr: false,
    loading: () => null
})

export default function ClientWrapper() {
    const [isMounted, setIsMounted] = useState(false)
    const initialRenderRef = useRef(true)

    useEffect(() => {
        // Marquer le montage du composant pour résoudre les problèmes d'hydratation
        setIsMounted(true)
        
        // Désactiver le flag de rendu initial après le premier rendu côté client
        initialRenderRef.current = false
        
        // Précharger les ressources critiques après l'hydratation
        return () => {
            // Nettoyage pour éviter les fuites mémoire
        }
    }, [])

    // Ne rien rendre côté serveur ou pendant l'hydratation pour éviter les erreurs de mismatch
    if (!isMounted) {
        return null
    }

    return (
        <>
            <DynamicBodyAttributes />
            <LoaderComponent />
            <GsapInitializer />
            <Dock />
        </>
    )
}

