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

const API_URL = '/api/admin/dashboard/stats';

export function AdminDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            console.log('AdminDashboard - Starting data fetch');
            console.log('AdminDashboard - User:', user);

            if (!user?.isAdmin) {
                console.log('AdminDashboard - User is not admin, redirecting...');
                router.push('/connexion')
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    console.log('AdminDashboard - No token found');
                    throw new Error('Token non trouvé')
                }

                console.log('AdminDashboard - Token found, fetching stats...');
                console.log('AdminDashboard - API URL:', API_URL);

                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })

                console.log('AdminDashboard - Response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    console.error('AdminDashboard - Response error:', {
                        status: response.status,
                        statusText: response.statusText,
                        data: errorData
                    })
                    throw new Error(errorData.error || 'Erreur lors de la récupération des données')
                }

                const data = await response.json()
                console.log('AdminDashboard - Data received:', data)

                if (!data || typeof data.totalRevenue === 'undefined') {
                    console.error('AdminDashboard - Invalid data format:', data);
                    throw new Error('Format de données invalide')
                }

                console.log('AdminDashboard - Setting stats:', data);
                setStats(data)
            } catch (error) {
                console.error('AdminDashboard - Error:', error)
                setError('Une erreur est survenue lors du chargement des données.')
                toast({
                    title: "Erreur",
                    description: error instanceof Error ? error.message : "Impossible de charger les données",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [user, router, toast])

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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Chiffre d&apos;affaires
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalRevenue.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
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
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
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
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
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
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <Overview data={stats.weeklySales} />
                </Card>
                <Card className="col-span-3">
                    <RecentSales orders={stats.recentOrders} />
                </Card>
            </div>
        </div>
    )
}

