'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/app/contexts/AuthContext'
import { NotificationCenter } from '@/components/admin/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

interface AdminClientLayoutProps {
    children: React.ReactNode
    isAuthenticated: boolean
}

export function AdminClientLayout({ children, isAuthenticated }: AdminClientLayoutProps) {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { notifications, markAsRead } = useNotifications()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated) {
                router.replace('/connexion')
            } else if (user && !user.isAdmin) {
                router.replace('/')
            }
        }
    }, [mounted, isAuthenticated, user, router])

    // Attendre le montage du composant
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Chargement...</p>
                </div>
            </div>
        )
    }

    // Si non authentifié ou non admin, ne rien afficher (la redirection sera gérée par l'effet)
    if (!isAuthenticated || !user?.isAdmin) {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="flex-1 mt-4">
                    <Link href="/admin" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                        Tableau de bord
                    </Link>
                    <Link href="/admin/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                        Gestion des produits
                    </Link>
                    <Link href="/admin/orders" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
                        Gestion des commandes
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Button
                        onClick={() => {
                            logout()
                            router.replace('/connexion')
                        }}
                        variant="outline"
                        className="w-full"
                    >
                        Déconnexion
                    </Button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">
                        {user?.email ? `Bienvenue, ${user.email}` : 'Bienvenue'}
                    </h2>
                    <NotificationCenter
                        notifications={notifications}
                        onNotificationRead={markAsRead}
                    />
                </div>
                {children}
            </main>
        </div>
    )
}

