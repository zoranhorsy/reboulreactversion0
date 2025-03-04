'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useEffect, useState } from 'react'

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
    }, [checkAuthManually, hasCheckedAuth])

    // Effet pour la redirection
    useEffect(() => {
        if (hasRedirected || !hasCheckedAuth || isLoading) {
            return
        }

        if (!isAuthenticated) {
            logWithTime("Non authentifié - redirection vers /connexion")
            setHasRedirected(true)
            window.location.href = '/connexion'
        } else if (!isAdmin) {
            logWithTime("Authentifié mais non admin - redirection vers /")
            setHasRedirected(true)
            window.location.href = '/'
        } else {
            logWithTime("Authentifié et admin - accès autorisé")
        }
    }, [isAuthenticated, isAdmin, isLoading, hasRedirected, hasCheckedAuth])

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

