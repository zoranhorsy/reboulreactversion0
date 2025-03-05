'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[AdminDashboard][${timestamp}] ${message}`, data)
  } else {
    console.log(`[AdminDashboard][${timestamp}] ${message}`)
  }
}

export default function AdminDashboardPage() {
    const { user, isLoading, isAuthenticated, isAdmin, checkAuthManually } = useAuth()
    const router = useRouter()
    
    logWithTime("AdminDashboardPage rendu", { 
        isLoading, 
        isAuthenticated, 
        isAdmin, 
        hasUser: !!user 
    })

    useEffect(() => {
        logWithTime("AdminDashboardPage useEffect", { 
            isLoading, 
            isAuthenticated, 
            isAdmin 
        })
        
        if (!isLoading) {
            if (!isAuthenticated) {
                logWithTime("Non authentifié - redirection vers /connexion")
                router.push('/connexion')
            } else if (!isAdmin) {
                logWithTime("Authentifié mais non admin - redirection vers /")
                router.push('/')
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, router])

    if (isLoading) {
        logWithTime("Affichage du chargement")
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px] shadow-none border-none bg-transparent">
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <CardDescription>Chargement du tableau de bord...</CardDescription>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isAuthenticated || !isAdmin) {
        logWithTime("Non authentifié ou non admin - affichage du message d'erreur")
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            <CardTitle>Accès Restreint</CardTitle>
                        </div>
                        <CardDescription>
                            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            Retour à l&apos;accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    logWithTime("Affichage du tableau de bord")
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
            </div>
            
            <AdminDashboard />
        </div>
    )
} 