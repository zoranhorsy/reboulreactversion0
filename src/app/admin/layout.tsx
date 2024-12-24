'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/app/contexts/AuthContext'
import { NotificationCenter } from '@/components/admin/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const { notifications, addNotification, markAsRead } = useNotifications()

    useEffect(() => {
        if (!user && pathname !== '/admin/login') {
            router.push('/admin/login')
        }
    }, [user, router, pathname])

    // Si on est sur la page de login, on affiche directement le contenu
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    // Si l'utilisateur n'est pas connecté, on n'affiche rien (la redirection se fera via le useEffect)
    if (!user) {
        return null
    }

    // Layout normal pour les utilisateurs connectés
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-4">
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
                <div className="mt-auto p-4">
                    <Button onClick={logout} variant="outline" className="w-full">
                        Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Bienvenue, {user.email}</h2>
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

