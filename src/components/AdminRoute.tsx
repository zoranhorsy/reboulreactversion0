'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Si l'utilisateur n'est pas connecté et n'est pas déjà sur la page de connexion
                if (pathname !== '/connexion') {
                    window.location.href = '/connexion'
                }
            } else if (!user.isAdmin) {
                window.location.href = '/'
            }
        }
    }, [user, isLoading, pathname])

    if (isLoading) {
        return <div>Chargement...</div>
    }

    return user && user.isAdmin ? <>{children}</> : null
}

