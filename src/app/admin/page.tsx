'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin" />
                <span className="text-xl font-semibold">Chargement...</span>
            </div>
        )
    }

    if (!user) {
        return null
    }

    if (!user.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl mb-4">Vous n&apos;êtes pas autorisé à accéder à cette page.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retour à l&apos;accueil
                </button>
            </div>
        )
    }

    return <AdminDashboard />
}

