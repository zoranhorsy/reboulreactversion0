'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from '@/app/contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchDashboardStats, fetchRecentOrders, fetchTopProducts, fetchWeeklySales, DashboardStats, Order, Product, SalesData } from '@/app/api/admin/api'
import { useNotifications } from '@/hooks/useNotifications'

export function AdminDashboard() {
    const router = useRouter()
    const { user, logout, isLoading: authLoading } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [topProducts, setTopProducts] = useState<Product[]>([])
    const [salesData, setSalesData] = useState<SalesData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { addNotification } = useNotifications()

    useEffect(() => {
        const checkAuth = async () => {
            if (!authLoading && !user) {
                router.replace('/admin/login')
            }
        }
        checkAuth()
    }, [user, authLoading, router])

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const [statsData, ordersData, productsData, salesData] = await Promise.all([
                    fetchDashboardStats(),
                    fetchRecentOrders(),
                    fetchTopProducts(),
                    fetchWeeklySales()
                ])
                setStats(statsData)
                setRecentOrders(ordersData)
                setTopProducts(productsData)
                setSalesData(salesData)

                // Ajouter des notifications d'exemple
                addNotification("Nouvelle commande reçue : #1234", "info")
                addNotification("Stock faible pour le produit XYZ", "warning")
                addNotification("Erreur de paiement pour la commande #5678", "error")
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError('Une erreur est survenue lors du chargement des données. Veuillez réessayer.')
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchDashboardData()
        }
    }, [user, addNotification])

    const handleLogout = () => {
        logout()
        router.replace('/admin/login')
    }

    if (authLoading || isLoading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>
    }

    if (!user || !stats) {
        return null
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
                <Button onClick={handleLogout}>Se déconnecter</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Ventes Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalSales.toLocaleString()} €</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Commandes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalProducts}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Ventes de la semaine</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>KPIs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Valeur moyenne des commandes</p>
                                <p className="text-2xl font-bold">{stats.averageOrderValue.toFixed(2)} €</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Taux de conversion</p>
                                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(2)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Dernières commandes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>{order.total.toFixed(2)} €</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>{order.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Produits les plus vendus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead>Prix</TableHead>
                                    <TableHead>Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.price.toFixed(2)} €</TableCell>
                                        <TableCell>{product.variants.reduce((total, variant) => total + variant.stock, 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Gérez votre catalogue de produits</p>
                        <Link href="/admin/products">
                            <Button>Accéder aux produits</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Gestion des commandes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Suivez et gérez les commandes</p>
                        <Link href="/admin/orders">
                            <Button>Accéder aux commandes</Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Statistiques détaillées</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Consultez les statistiques avancées</p>
                        <Link href="/admin/stats">
                            <Button>Voir les statistiques</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

