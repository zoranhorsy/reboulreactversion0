'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Loader2, ShieldAlert, Package, ShoppingCart, Users, Settings, Home, BarChart2, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminProducts } from '@/components/admin/AdminProducts'
import { AdminOrders } from '@/components/admin/AdminOrders'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminStats } from '@/components/admin/AdminStats'
import { AdminSettings } from '@/components/admin/AdminSettings'
import { ArchiveManager } from '@/components/admin/ArchiveManager'

export default function AdminPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('dashboard')

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/admin/connexion')
        }
    }, [user, isLoading, router])

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

    if (!user) {
        return null
    }

    if (!user.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            <CardTitle>Accès Restreint</CardTitle>
                        </div>
                        <CardDescription>
                            Vous n&apos;avez pas les permissions nécessaires pour accéder à l&apos;interface d&apos;administration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push('/')}
                            className="w-full"
                        >
                            Retour à l&apos;accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const tabs = [
        { id: 'dashboard', label: 'Tableau de bord', icon: Home },
        { id: 'products', label: 'Produits', icon: Package },
        { id: 'orders', label: 'Commandes', icon: ShoppingCart },
        { id: 'users', label: 'Utilisateurs', icon: Users },
        { id: 'archives', label: 'Archives', icon: Image },
        { id: 'stats', label: 'Statistiques', icon: BarChart2 },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Administration</h1>
                </div>

                <p className="text-muted-foreground">
                    L&apos;interface d&apos;administration vous permet de gérer l&apos;ensemble de votre boutique.
                </p>
                <p className="text-muted-foreground">
                    Vous n&apos;avez pas encore d&apos;activité aujourd&apos;hui.
                </p>
                <p className="text-muted-foreground">
                    Commencez par ajouter des produits à l&apos;aide du bouton ci-dessus.
                </p>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-7 gap-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex items-center gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    <TabsContent value="dashboard">
                        <AdminDashboard />
                    </TabsContent>

                    <TabsContent value="products">
                        <AdminProducts />
                    </TabsContent>

                    <TabsContent value="orders">
                        <AdminOrders />
                    </TabsContent>

                    <TabsContent value="users">
                        <AdminUsers />
                    </TabsContent>

                    <TabsContent value="archives">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestion des archives</CardTitle>
                                <CardDescription>
                                    Gérez les photos d&apos;archives de votre boutique
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ArchiveManager />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats">
                        <AdminStats />
                    </TabsContent>

                    <TabsContent value="settings">
                        <AdminSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

