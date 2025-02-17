'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UserReviews } from '@/components/UserReviews'
import { ShippingAddresses } from '@/components/ShippingAddresses'
import { UserOrders } from '@/components/UserOrders'
import { ChangePassword } from '@/components/ChangePassword'
import { useAuth } from '@/app/contexts/AuthContext'
import { updateUserInfo, UserInfo } from '@/lib/api'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function UserProfile() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { toast } = useToast()
    const [userInfo, setUserInfo] = useState<UserInfo>({
        id: parseInt(user?.id || "0", 10),
        name: user?.username || "",
        email: user?.email || ""
    })
    const [updating, setUpdating] = useState(false)
    const [notifications, setNotifications] = useState({
        email: true,
        push: false
    })

    useEffect(() => {
        if (user) {
            setUserInfo({
                id: parseInt(user.id || "0", 10),
                name: user.username || "",
                email: user.email || ""
            })
        }
    }, [user])

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const updatedInfo = await updateUserInfo({
                id: String(userInfo.id),
                name: userInfo.name,
                email: userInfo.email
            })
            if (updatedInfo) {
                setUserInfo({
                    id: parseInt(updatedInfo.id || "0", 10),
                    name: updatedInfo.name || "",
                    email: updatedInfo.email || ""
                })
                toast({
                    title: "Profil mis à jour",
                    description: "Vos informations ont été mises à jour avec succès.",
                })
            }
        } catch (err) {
            console.error(err)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la mise à jour de vos informations.",
                variant: "destructive",
            })
        } finally {
            setUpdating(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (err) {
            console.error(err)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la déconnexion.",
                variant: "destructive",
            })
        }
    }

    // Log user information for debugging
    console.log('User object:', user);
    console.log('Is admin:', user?.isAdmin);

    return (
        <div className="container mx-auto px-4 py-16">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Profil Utilisateur</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="info">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="info">Informations</TabsTrigger>
                            <TabsTrigger value="orders">Commandes</TabsTrigger>
                            <TabsTrigger value="addresses">Adresses</TabsTrigger>
                            <TabsTrigger value="reviews">Avis</TabsTrigger>
                            <TabsTrigger value="settings">Paramètres</TabsTrigger>
                            {user?.isAdmin && (
                                <TabsTrigger value="admin">Admin</TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="info">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl">
                                            {userInfo.name?.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" name="name" value={userInfo.name} onChange={handleInfoChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" value={userInfo.email} onChange={handleInfoChange} />
                                </div>
                                <Button type="submit" disabled={updating}>
                                    {updating ? 'Mise à jour...' : 'Mettre à jour'}
                                </Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="orders">
                            <UserOrders />
                        </TabsContent>
                        <TabsContent value="addresses">
                            <ShippingAddresses />
                        </TabsContent>
                        <TabsContent value="reviews">
                            <UserReviews />
                        </TabsContent>
                        <TabsContent value="settings">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Changer le mot de passe</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ChangePassword />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Préférences de notification</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="email-notifications">Notifications par email</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Recevoir des notifications par email
                                                    </p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    id="email-notifications"
                                                    checked={notifications.email}
                                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="push-notifications">Notifications push</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Recevoir des notifications push sur votre appareil
                                                    </p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    id="push-notifications"
                                                    checked={notifications.push}
                                                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                                </Button>
                            </div>
                        </TabsContent>
                        {user?.isAdmin && (
                            <TabsContent value="admin">
                                <AdminDashboard />
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

