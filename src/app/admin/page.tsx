'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function AdminPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/admin/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return null
    }

    return <AdminDashboard />
}

