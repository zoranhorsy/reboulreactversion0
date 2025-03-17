'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[AdminLayout][${timestamp}] ${message}`, data)
  } else {
    console.log(`[AdminLayout][${timestamp}] ${message}`)
  }
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isLoading, isAuthenticated, isAdmin, checkAuthManually } = useAuth()
    const [hasRedirected, setHasRedirected] = useState(false)
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
    const router = useRouter()

    logWithTime("AdminLayout rendu", { 
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
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px] shadow-none border-none bg-transparent">
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <CardDescription>Chargement de l&apos;interface d&apos;administration...</CardDescription>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isAuthenticated || !isAdmin) {
        logWithTime("Non authentifié ou non admin - affichage du message d'erreur")
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px] shadow-none border-none bg-transparent">
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <CardDescription>
                            Vous n&apos;avez pas les permissions nécessaires pour accéder à l&apos;interface d&apos;administration.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        )
    }

    logWithTime("Rendu du contenu admin")
    return children
}

