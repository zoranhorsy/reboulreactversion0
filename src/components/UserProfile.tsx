'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Camera, Bell, BellOff, MapPin, ShoppingBag, Star, Settings, Shield, Heart, Package, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from '@/app/contexts/AuthContext'
import { updateUserInfo, uploadUserAvatar, deleteAccount, updateNotificationSettings, fetchNotificationSettings, type NotificationSettings, changePassword } from '@/lib/api'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { UserOrders } from '@/components/UserOrders'
import { ShippingAddresses } from '@/components/ShippingAddresses'
import { UserReviews } from '@/components/UserReviews'
import { FavoritesSection } from "@/components/profile/FavoritesSection"
import OrderHistory from "@/components/OrderHistory"

// Types
interface UserInfo {
    id: number
    name: string
    email: string
    avatar_url?: string
    phone?: string
}

interface PasswordForm {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export default function UserProfile() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const { toast } = useToast()
    
    // États
    const [userInfo, setUserInfo] = useState<UserInfo>({
        id: parseInt(user?.id || "0", 10),
        name: user?.username || "",
        email: user?.email || "",
        avatar_url: user?.avatar_url || "",
        phone: ""
    })
    const [updating, setUpdating] = useState(false)
    const [notifications, setNotifications] = useState<NotificationSettings>({
        email: true,
        push: false,
        marketing: false,
        security: true
    })
    const [activeTab, setActiveTab] = useState('info')
    const [isAvatarLoading, setIsAvatarLoading] = useState(false)
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(true)
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [changingPassword, setChangingPassword] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const loadNotificationSettings = useCallback(async () => {
        try {
            const settings = await fetchNotificationSettings()
            setNotifications(settings)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les paramètres de notification.",
                variant: "destructive",
            })
        } finally {
            setIsNotificationsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        if (user) {
            setUserInfo({
                id: parseInt(user.id || "0", 10),
                name: user.username || "",
                email: user.email || "",
                avatar_url: user.avatar_url || "",
                phone: user.phone || ""
            })
            loadNotificationSettings()
        }
    }, [user, loadNotificationSettings])

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Vérification de la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Erreur",
                description: "L'image ne doit pas dépasser 5MB.",
                variant: "destructive"
            })
            return
        }

        // Vérification du type de fichier
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Erreur",
                description: "Le fichier doit être une image.",
                variant: "destructive"
            })
            return
        }

        setIsAvatarLoading(true)
        try {
            const avatarUrl = await uploadUserAvatar(file)
            
            setUserInfo(prev => ({ ...prev, avatar_url: avatarUrl }))
            
            toast({
                title: "Avatar mis à jour",
                description: "Votre photo de profil a été mise à jour avec succès."
            })
        } catch (error) {
            console.error('Error uploading avatar:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la mise à jour de votre photo de profil.",
                variant: "destructive"
            })
        } finally {
            setIsAvatarLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const updatedInfo = await updateUserInfo({
                id: String(userInfo.id),
                name: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone
            })
            if (updatedInfo) {
                setUserInfo(prev => ({
                    ...prev,
                    name: updatedInfo.name,
                    email: updatedInfo.email,
                    avatar_url: updatedInfo.avatar_url,
                    phone: updatedInfo.phone
                }))
                // Recharger la page pour mettre à jour les informations
                window.location.reload()
                toast({
                    title: "Profil mis à jour",
                    description: "Vos informations ont été mises à jour avec succès."
                })
            }
        } catch (error) {
            console.error('Error updating user info:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la mise à jour de vos informations.",
                variant: "destructive"
            })
        } finally {
            setUpdating(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            console.error('Error during logout:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la déconnexion.",
                variant: "destructive"
            })
        }
    }

    const handleNotificationChange = async (key: keyof NotificationSettings) => {
        const newSettings = { ...notifications, [key]: !notifications[key] }
        try {
            await updateNotificationSettings(newSettings)
            setNotifications(newSettings)
            toast({
                title: "Préférences mises à jour",
                description: "Vos préférences de notification ont été mises à jour."
            })
        } catch (error) {
            console.error('Error updating notification settings:', error)
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour vos préférences de notification.",
                variant: "destructive"
            })
        }
    }

    const handleDeleteAccount = async () => {
        try {
            const success = await deleteAccount()
            if (success) {
                await logout()
                toast({
                    title: "Compte supprimé",
                    description: "Votre compte a été supprimé avec succès."
                })
                router.push('/')
            }
        } catch (error) {
            console.error('Error deleting account:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la suppression de votre compte.",
                variant: "destructive"
            })
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas",
                variant: "destructive"
            })
            return
        }
        
        setChangingPassword(true)
        try {
            const response = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
            if (response.success) {
                toast({
                    title: "Succès",
                    description: "Votre mot de passe a été mis à jour"
                })
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                toast({
                    title: "Erreur",
                    description: response.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du changement de mot de passe",
                variant: "destructive"
            })
        } finally {
            setChangingPassword(false)
        }
    }

    const tabs = [
        { id: 'info', label: 'Profil', icon: <Settings className="w-4 h-4" /> },
        { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'addresses', label: 'Adresses', icon: <MapPin className="w-4 h-4" /> },
        { id: 'reviews', label: 'Avis', icon: <Star className="w-4 h-4" /> },
        { id: 'favorites', label: 'Favoris', icon: <Heart className="w-4 h-4" /> },
        ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> }] : [])
    ]

    return (
        <div className="container max-w-6xl mx-auto px-4 py-16">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                {isAvatarLoading ? (
                                    <Skeleton className="w-24 h-24 rounded-full" />
                                ) : (
                                    <>
                                        <AvatarImage src={userInfo.avatar_url} />
                                        <AvatarFallback className="text-2xl">
                                            {userInfo.name?.charAt(0)}
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <label 
                                htmlFor="avatar-upload" 
                                className="absolute bottom-0 right-0 p-2 bg-background rounded-full border cursor-pointer
                                    hover:bg-primary/5 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-light">{userInfo.name}</CardTitle>
                            <CardDescription className="text-lg">{userInfo.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="mt-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto mb-6">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 
                                        data-[state=active]:border-primary rounded-none"
                                >
                                    {tab.icon}
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="info" className="mt-6">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations personnelles</CardTitle>
                                        <CardDescription>
                                            Gérez vos informations personnelles et vos préférences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">Prénom</Label>
                                                    <Input
                                                        id="firstName"
                                                        name="firstName"
                                                        value={userInfo.name.split(' ')[0]}
                                                        onChange={handleInfoChange}
                                                        placeholder="Votre prénom"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Nom</Label>
                                                    <Input
                                                        id="lastName"
                                                        name="lastName"
                                                        value={userInfo.name.split(' ')[1]}
                                                        onChange={handleInfoChange}
                                                        placeholder="Votre nom"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={userInfo.email}
                                                        onChange={handleInfoChange}
                                                        placeholder="votre@email.com"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Téléphone</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        value={userInfo.phone}
                                                        onChange={handleInfoChange}
                                                        placeholder="Votre numéro de téléphone"
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-4">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsEditing(false)}
                                                            type="button"
                                                        >
                                                            Annuler
                                                        </Button>
                                                        <Button type="submit">Enregistrer</Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditing(true)}
                                                        type="button"
                                                    >
                                                        Modifier
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Changer le mot de passe</CardTitle>
                                        <CardDescription>
                                            Mettez à jour votre mot de passe
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="bg-background"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                                <Input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="bg-background"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="bg-background"
                                                />
                                            </div>
                                            <Button type="submit" disabled={changingPassword}>
                                                {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>
                                            Gérez vos préférences de notifications
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isNotificationsLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-48" />
                                                        </div>
                                                        <Skeleton className="h-6 w-10" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Notifications par email</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Recevez des notifications par email
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.email}
                                                        onCheckedChange={() => handleNotificationChange('email')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Notifications push</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Recevez des notifications sur votre navigateur
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.push}
                                                        onCheckedChange={() => handleNotificationChange('push')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Offres marketing</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Recevez des offres promotionnelles
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.marketing}
                                                        onCheckedChange={() => handleNotificationChange('marketing')}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Alertes de sécurité</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Recevez des alertes de sécurité importantes
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={notifications.security}
                                                        onCheckedChange={() => handleNotificationChange('security')}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders">
                            <OrderHistory />
                        </TabsContent>

                        <TabsContent value="addresses">
                            <ShippingAddresses />
                        </TabsContent>

                        <TabsContent value="reviews">
                            <UserReviews />
                        </TabsContent>

                        <TabsContent value="favorites">
                            <FavoritesSection />
                        </TabsContent>

                        {user?.isAdmin && (
                            <TabsContent value="admin">
                                <AdminDashboard />
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleLogout} className="gap-2">
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Shield className="w-4 h-4" />
                                    Supprimer le compte
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer votre compte ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Supprimer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 