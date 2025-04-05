'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { Loader2, ShieldAlert, Package, ShoppingCart, Users, Home, BarChart2, Image, ChevronRight, X, Ticket, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminProducts } from '@/components/admin/AdminProducts'
import { AdminOrders } from '@/components/admin/AdminOrders'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminStats } from '@/components/admin/AdminStats'
import { ArchiveManager } from '@/components/admin/ArchiveManager'
import { PromoManagement } from '@/components/admin/PromoManagement'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

export default function AdminPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [activeCard, setActiveCard] = useState<string | null>(null)

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

    const cards = [
        {
            id: 'products',
            title: 'Produits',
            description: 'Gérez votre catalogue de produits',
            icon: <Package className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: <AdminProducts />
        },
        {
            id: 'orders',
            title: 'Commandes',
            description: 'Suivez et gérez les commandes',
            icon: <ShoppingCart className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: <AdminOrders />
        },
        {
            id: 'users',
            title: 'Utilisateurs',
            description: 'Gérez les comptes utilisateurs',
            icon: <Users className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: <AdminUsers />
        },
        {
            id: 'archives',
            title: 'Archives',
            description: 'Gérez vos photos d\'archives',
            icon: <Archive className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: (
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
            )
        },
        {
            id: 'stats',
            title: 'Statistiques',
            description: 'Analysez les performances',
            icon: <BarChart2 className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: <AdminStats />
        },
        {
            id: 'promos',
            title: 'Codes promo',
            description: 'Gérez vos codes promo',
            icon: <Ticket className="w-6 h-6" />,
            color: 'from-primary/2 to-primary/5',
            content: <PromoManagement />
        }
    ]

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4 px-4 sm:py-6 sm:px-6 space-y-6">
                <div className="flex flex-col space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold">Administration</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gérez l&apos;ensemble de votre boutique depuis cette interface.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {cards.map(card => (
                        <button
                            key={card.id}
                            onClick={() => setActiveCard(card.id)}
                            className="group relative flex flex-col items-start p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                            <div className="relative z-10 w-full">
                                <div className="p-2.5 rounded-lg bg-primary/5 text-primary mb-3">
                                    {card.icon}
                                </div>
                                <h3 className="text-base font-medium mb-1.5 text-foreground">{card.title}</h3>
                                <p className="text-xs text-muted-foreground mb-3">{card.description}</p>
                                <div className="flex items-center text-xs text-primary/80">
                                    <span>Voir plus</span>
                                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    <AdminDashboard />
                </div>

                <Dialog open={!!activeCard} onOpenChange={() => setActiveCard(null)}>
                    <DialogContent className="max-w-[95vw] lg:max-w-[90vw] max-h-[95vh] overflow-y-auto p-0">
                        <DialogHeader className="px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl">
                                    {cards.find(card => card.id === activeCard)?.title}
                                </DialogTitle>
                                <DialogClose className="rounded-full p-2 hover:bg-accent transition-colors">
                                    <X className="h-4 w-4" />
                                </DialogClose>
                            </div>
                        </DialogHeader>
                        <div className="p-6">
                            {cards.find(card => card.id === activeCard)?.content}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

