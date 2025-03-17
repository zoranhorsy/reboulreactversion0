'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[AdminRoute][${timestamp}] ${message}`, data)
  } else {
    console.log(`[AdminRoute][${timestamp}] ${message}`)
  }
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, isAdmin, checkAuthManually } = useAuth()
    const [hasRedirected, setHasRedirected] = useState(false)
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
    const router = useRouter()

    logWithTime("AdminRoute rendu", { 
        isLoading, 
        isAuthenticated, 
        isAdmin,
        hasRedirected,
        hasCheckedAuth
    })

    // Effet pour vérifier l'authentification
    useEffect(() => {
        if (hasCheckedAuth) {
            logWithTime("Vérification déjà effectuée, ignorée")
            return
        }

        const verifyAuth = async () => {
            logWithTime("Vérification manuelle de l'authentification")
            try {
                await checkAuthManually()
                setHasCheckedAuth(true)
                logWithTime("Vérification manuelle terminée", { 
                    isAuthenticated, 
                    isAdmin 
                })
            } catch (error) {
                logWithTime("Erreur lors de la vérification manuelle", error)
            }
        }

        verifyAuth()
    }, [checkAuthManually, hasCheckedAuth, isAuthenticated, isAdmin])

    // Effet pour la redirection
    useEffect(() => {
        if (hasRedirected || !hasCheckedAuth || isLoading) {
            return
        }

        if (!isAuthenticated || !isAdmin) {
            router.push('/')
            setHasRedirected(true)
        }
    }, [hasRedirected, hasCheckedAuth, isLoading, isAuthenticated, isAdmin, router])

    if (isLoading || !hasCheckedAuth) {
        logWithTime("Affichage du chargement")
        return <div>Chargement...</div>
    }

    if (!isAuthenticated || !isAdmin) {
        logWithTime("Non authentifié ou non admin - pas de rendu")
        return null
    }

    logWithTime("Rendu final")
    return <>{children}</>
}

