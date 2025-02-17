'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchDashboardStats, fetchRecentOrders, fetchTopProducts, fetchWeeklySales, DashboardStats, Order, TopProduct, WeeklySales } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, BarChart2, Package, ShoppingCart, Settings, Home, Users, LogOut } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Importez chaque composant de la barre latérale individuellement
import { Sidebar } from "@/components/ui/sidebar"
import { SidebarContent } from "@/components/ui/sidebar"
import { SidebarHeader } from "@/components/ui/sidebar"
import { SidebarMenu } from "@/components/ui/sidebar"
import { SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"

const cleanData = <T extends object, U extends T>(data: T | null | undefined, defaultValue: U): U => {
    if (!data) return defaultValue;

    return (Object.keys(defaultValue) as Array<keyof U>).reduce((acc, key) => {
        const value = data[key as keyof T];
        if (typeof defaultValue[key] === 'number') {
            acc[key] = (typeof value === 'number' && !isNaN(value)) ? (value as U[keyof U]) : defaultValue[key];
        } else {
            acc[key] = (value !== null && value !== undefined) ? (value as U[keyof U]) : defaultValue[key];
        }
        return acc;
    }, { ...defaultValue });
};

export function AdminDashboard() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentOrders, setRecentOrders] = useState<Order[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [salesData, setSalesData] = useState<WeeklySales[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const fetchDashboardData = async () => {
            console.log('Fetching dashboard data...');
            console.log('User:', user);
            if (!user || !user.isAdmin) {
                router.push('/admin/login')
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                console.log('Fetching data from API...');
                const [statsData, ordersData, productsData, salesData] = await Promise.all([
                    fetchDashboardStats().catch(error => {
                        console.error('Error fetching stats:', error);
                        return null;
                    }),
                    fetchRecentOrders().catch(error => {
                        console.error('Error fetching orders:', error);
                        return [];
                    }),
                    fetchTopProducts().catch(error => {
                        console.error('Error fetching top products:', error);
                        return [];
                    }),
                    fetchWeeklySales().catch(error => {
                        console.error('Error fetching weekly sales:', error);
                        return [];
                    })
                ]);

                console.log('Raw stats data:', statsData);
                console.log('Raw orders data:', ordersData);
                console.log('Raw products data:', productsData);
                console.log('Raw sales data:', salesData);

                const cleanedStats = cleanData<DashboardStats, DashboardStats>(statsData, {
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalProducts: 0,
                    totalUsers: 0
                });

                const cleanedOrders = (ordersData || []).map(order => cleanData<Order, Order>(order, {
                    id: 0,
                    user_id: 0,
                    total_amount: 0,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }));

                console.log('Cleaned stats data:', JSON.stringify(cleanedStats, null, 2));
                console.log('Cleaned orders data:', JSON.stringify(cleanedOrders, null, 2));

                const cleanedProducts = (productsData || []).map(product => cleanData<TopProduct, TopProduct>(product, {
                    id: 0, // Changed from '' to 0
                    name: '',
                    totalSold: 0
                }));

                const cleanedSalesData = (salesData || []).map(sale => cleanData<WeeklySales, WeeklySales>(sale, {
                    date: '',
                    total: 0
                }));

                setStats(cleanedStats)
                setRecentOrders(cleanedOrders)
                setTopProducts(cleanedProducts)
                setSalesData(cleanedSalesData)

            } catch (err: unknown) {
                console.error('Error fetching dashboard data:', err)
                setError('Une erreur est survenue lors du chargement des données.')
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les données du tableau de bord.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [user, router, toast])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="mr-2 h-16 w-16 animate-spin" />
                <span className="text-xl font-semibold">Chargement du tableau de bord...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 text-xl mb-4">{error}</p>
                <Button onClick={() => router.refresh()}>Réessayer</Button>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl mb-4">Aucune donnée disponible pour le tableau de bord.</p>
                <Button onClick={() => router.refresh()}>Rafraîchir</Button>
            </div>
        )
    }

    const navigationItems = [
        {
            href: '/admin/dashboard',
            icon: <Home className="h-5 w-5" />,
            title: 'Tableau de bord',
            isActive: true
        },
        {
            href: '/admin/products',
            icon: <Package className="h-5 w-5" />,
            title: 'Produits'
        },
        {
            href: '/admin/orders',
            icon: <ShoppingCart className="h-5 w-5" />,
            title: 'Commandes'
        },
        {
            href: '/admin/users',
            icon: <Users className="h-5 w-5" />,
            title: 'Utilisateurs'
        },
        {
            href: '/admin/stats',
            icon: <BarChart2 className="h-5 w-5" />,
            title: 'Statistiques'
        },
        {
            href: '/admin/settings',
            icon: <Settings className="h-5 w-5" />,
            title: 'Paramètres'
        }
    ]

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 p-4">
                            <Package className="h-6 w-6" />
                            <span className="font-semibold text-lg">Reboul Store</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={item.isActive}>
                                        <Link href={item.href} className="flex items-center gap-2">
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => {
                                        logout()
                                        router.replace('/admin/login')
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Se déconnecter</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <div className="border-b">
                        <div className="flex h-16 items-center gap-4 px-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-semibold">Tableau de bord administrateur</h1>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ventes Totales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">
                                        {stats.totalRevenue != null
                                            ? `${stats.totalRevenue.toLocaleString()} €`
                                            : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Commandes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">
                                        {stats.totalOrders != null ? stats.totalOrders.toLocaleString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Produits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">
                                        {stats.totalProducts != null ? stats.totalProducts.toLocaleString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Utilisateurs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">
                                        {stats.totalUsers != null ? stats.totalUsers.toLocaleString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ventes hebdomadaires</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={salesData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="total"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dernières commandes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentOrders.length > 0 ? (
                                                recentOrders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell>{order.id}</TableCell>
                                                        <TableCell>
                                                            {order.total_amount != null
                                                                ? `${order.total_amount.toFixed(2)} €`
                                                                : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>{order.status || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {order.created_at
                                                                ? new Date(order.created_at).toLocaleDateString()
                                                                : 'N/A'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center">
                                                        Aucune commande récente
                                                    </TableCell>
                                                </TableRow>
                                            )}
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
                                                <TableHead>Total vendu</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topProducts.length > 0 ? (
                                                topProducts.map((product) => (
                                                    <TableRow key={product.id}>
                                                        <TableCell>{product.name}</TableCell>
                                                        <TableCell>{product.totalSold}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center">
                                                        Aucun produit populaire
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}

