'use client'

import { useState } from 'react'
import { User, Package, CreditCard, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { UserReviews } from '@/components/UserReviews'
import { LoyaltyPoints } from '@/components/LoyaltyPoints'
import { OrderDetails } from '@/components/OrderDetails'

type UserInfo = {
    name: string
    email: string
    address: string
}

type Order = {
    id: string
    date: string
    total: number
    status: string
    items: {
        id: number;
        name: string;
        quantity: number;
        price: number;
    }[]
}

export default function UserProfile() {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: "Marie Dupont",
        email: "marie.dupont@example.com",
        address: "123 Rue de la République, 13001 Marseille, France"
    })

    const [orders] = useState<Order[]>([
        {
            id: "ORD-001",
            date: "2023-05-15",
            total: 199.99,
            status: "Livré",
            items: [
                { id: 1, name: "T-shirt Stone Island", quantity: 1, price: 150 },
                { id: 2, name: "Chaussettes CP Company", quantity: 2, price: 24.99 }
            ]
        },
        {
            id: "ORD-002",
            date: "2023-06-02",
            total: 149.50,
            status: "En cours",
            items: [
                { id: 3, name: "Pantalon CP Company", quantity: 1, price: 149.50 }
            ]
        },
    ])

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Ici, vous enverriez normalement les données mises à jour à votre backend
        alert("Informations mises à jour avec succès !")
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Profil Utilisateur</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="info">Informations</TabsTrigger>
                            <TabsTrigger value="orders">Commandes</TabsTrigger>
                            <TabsTrigger value="reviews">Avis</TabsTrigger>
                            <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
                            <TabsTrigger value="settings">Paramètres</TabsTrigger>
                        </TabsList>
                        <TabsContent value="info">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" name="name" value={userInfo.name} onChange={handleInfoChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" value={userInfo.email} onChange={handleInfoChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse</Label>
                                    <Input id="address" name="address" value={userInfo.address} onChange={handleInfoChange} />
                                </div>
                                <Button type="submit">Mettre à jour</Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="orders">
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <OrderDetails key={order.id} order={order} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="reviews">
                            <UserReviews />
                        </TabsContent>
                        <TabsContent value="loyalty">
                            <LoyaltyPoints />
                        </TabsContent>
                        <TabsContent value="settings">
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full justify-start">
                                    <CreditCard className="mr-2 h-4 w-4" /> Gérer les méthodes de paiement
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Package className="mr-2 h-4 w-4" /> Adresses de livraison
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <User className="mr-2 h-4 w-4" /> Modifier le mot de passe
                                </Button>
                                <Separator />
                                <Button variant="destructive" className="w-full justify-start">
                                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

