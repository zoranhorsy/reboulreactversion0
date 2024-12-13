'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/app/contexts/AuthContext'

export function AdminDashboard() {
    const router = useRouter()
    const { user, logout, isLoading } = useAuth()

    useEffect(() => {
        const checkAuth = async () => {
            if (!isLoading && !user) {
                // L'utilisateur n'est pas authentifié, rediriger vers la page de connexion
                router.replace('/admin/login')
            }
        }
        checkAuth()
    }, [user, isLoading, router])

    const handleLogout = () => {
        logout()
        router.replace('/admin/login')
    }

    if (isLoading) {
        return <div>Chargement...</div>
    }

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Tableau de bord administrateur</h1>
            <p className="mb-4">Bienvenue sur le tableau de bord administrateur de Reboul Store, {user.email}.</p>
            <Button onClick={handleLogout}>Se déconnecter</Button>
        </div>
    )
}

