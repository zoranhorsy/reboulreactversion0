'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from '@/app/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { 
    Loader2, 
    AlertCircle,
    RefreshCcw,
    Package,
    ShoppingCart,
    Users
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Overview } from './Overview'
import { RecentSales } from './RecentSales'

interface DashboardStats {
    totalRevenue: number
    totalOrders: number
    totalProducts: number
    totalUsers: number
    recentOrders: {
        id: string
        customer: string
        total: number
        date: string
        status: string
    }[]
    weeklySales: {
        date: string
        total: number
    }[]
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app";

export function AdminDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.isAdmin) {
                router.push('/connexion')
                return
            }

            // Si on a déjà des stats et qu'on est admin, pas besoin de recharger
            if (stats && user.isAdmin) {
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('token')
                
                const response = await fetch(`${BACKEND_URL}/admin/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token')
                        router.push('/connexion')
                        return
                    }
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const data = await response.json()
                
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid data format received')
                }
                
                setStats(data)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError(error instanceof Error ? error.message : 'Erreur lors de la récupération des données')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [user?.isAdmin, router, stats]) // Dépendances optimisées

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p className="text-sm text-muted-foreground">Chargement des statistiques...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button onClick={() => router.refresh()} variant="outline">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-sm text-muted-foreground">Aucune donnée n&apos;est disponible pour le moment.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Chiffre d&apos;affaires
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {stats.totalRevenue.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Produits
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Utilisateurs
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Aperçu des ventes</CardTitle>
                        <CardDescription className="text-sm">
                            Évolution des ventes sur les 7 derniers jours
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px]">
                            <Overview data={stats.weeklySales} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Dernières commandes</CardTitle>
                        <CardDescription className="text-sm">
                            Les commandes les plus récentes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <RecentSales orders={stats.recentOrders} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

