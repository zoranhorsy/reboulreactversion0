'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription } from '@/components/ui/card'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

    if (!user || !user.isAdmin) {
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

    return children
}

