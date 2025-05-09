'use client'

import { useEffect, useState, useLayoutEffect } from 'react'

// Créer un hook personnalisé pour l'hydratation
const useHasMounted = () => {
    const [hasMounted, setHasMounted] = useState(false)
    
    // useLayoutEffect s'exécute de manière synchrone après toutes les mutations DOM
    // mais avant que le navigateur n'ait eu le temps de "peindre" les changements
    useLayoutEffect(() => {
        setHasMounted(true)
    }, [])
    
    return hasMounted
}

export default function ClientOnly({ 
    children,
    fallback = null 
}: { 
    children: React.ReactNode
    fallback?: React.ReactNode 
}) {
    const hasMounted = useHasMounted()

    // Retourner un fallback jusqu'à ce que le montage soit confirmé
    if (!hasMounted) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

