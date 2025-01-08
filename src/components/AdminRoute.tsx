'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) {
            router.push('/admin/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <div>Chargement...</div>
    }

    return user && user.isAdmin ? <>{children}</> : null
}

