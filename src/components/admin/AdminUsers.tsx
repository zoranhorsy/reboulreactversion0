'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type User, createUser } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns/format'
import { fr } from "date-fns/locale"
import { Search, ArrowUp, ArrowDown, Shield, ShieldOff, UserPlus, Pencil, X } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortConfig = {
    key: keyof User
    direction: "ascending" | "descending"
}

export function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: "created_at",
        direction: "descending",
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
        isAdmin: false
    })
    const { toast } = useToast()

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await api.fetchUsers()
            setUsers(response)
            setFilteredUsers(response)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les utilisateurs.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    const handleCreateUser = async () => {
        try {
            if (!newUser.username || !newUser.email || !newUser.password) {
                toast({
                    title: "Erreur",
                    description: "Tous les champs sont requis.",
                    variant: "destructive",
                })
                return
            }

            const createdUser = await createUser({
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                isAdmin: newUser.isAdmin
            })

            if (createdUser) {
                toast({
                    title: "Succès",
                    description: "L'utilisateur a été créé avec succès.",
                })
                setIsDialogOpen(false)
                setNewUser({
                    username: "",
                    email: "",
                    password: "",
                    isAdmin: false
                })
                loadUsers()
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de créer l'utilisateur.",
                variant: "destructive",
            })
        }
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(value.toLowerCase()) ||
            user.email.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredUsers(filtered)
    }

    const handleSort = (key: keyof User) => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key && current.direction === "ascending"
                    ? "descending"
                    : "ascending",
        }))
    }

    const getSortIcon = (key: keyof User) => {
        if (sortConfig.key !== key) return null
        return sortConfig.direction === "ascending" ? (
            <ArrowUp className="h-4 w-4" />
        ) : (
            <ArrowDown className="h-4 w-4" />
        )
    }

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortConfig.key === "created_at") {
            const dateA = new Date(a[sortConfig.key]).getTime()
            const dateB = new Date(b[sortConfig.key]).getTime()
            return sortConfig.direction === "ascending"
                ? dateA - dateB
                : dateB - dateA
        }

        const valueA = a[sortConfig.key]
        const valueB = b[sortConfig.key]

        // Handle undefined values
        if (valueA === undefined && valueB === undefined) return 0
        if (valueA === undefined) return 1
        if (valueB === undefined) return -1

        // Safe comparison after undefined checks
        if (String(valueA) < String(valueB)) {
            return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (String(valueA) > String(valueB)) {
            return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
    })

    const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
        try {
            toast({
                title: "En cours...",
                description: `Modification des droits d'administration en cours`,
            })
            
            await api.updateUserRole(userId, !isCurrentlyAdmin)
            
            toast({
                title: "Succès",
                description: `Les droits d'administrateur ont été ${isCurrentlyAdmin ? 'retirés' : 'accordés'}.`,
            })
            
            loadUsers()
        } catch (error) {
            console.error("Erreur lors de la modification des droits:", error)
            toast({
                title: "Erreur",
                description: "Impossible de modifier les droits d'administrateur.",
                variant: "destructive",
            })
        }
    }

    const handleDeleteUser = async (userId: string) => {
        try {
            await api.deleteUser(userId)
            toast({
                title: "Succès",
                description: "L'utilisateur a été supprimé avec succès.",
            })
            loadUsers()
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer l'utilisateur.",
                variant: "destructive",
            })
        }
    }

    const handleStatusChange = async (userId: string, status: string) => {
        try {
            await api.updateUserStatus(userId, status)
            toast({
                title: "Succès",
                description: `Le statut de l'utilisateur a été mis à jour à ${status}.`,
            })
            loadUsers()
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut de l'utilisateur.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden">
                <CardHeader className="p-4">
                    <div className="flex flex-col gap-3">
                        <div>
                            <CardTitle className="text-lg">Gestion des utilisateurs</CardTitle>
                            <CardDescription className="text-sm">
                                Gérez les comptes et leurs droits
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8 bg-background h-9"
                                />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full sm:w-auto h-9">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        <span>Ajouter</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[calc(100%-32px)] sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Créer un utilisateur</DialogTitle>
                                        <DialogDescription>
                                            Créer un nouveau compte utilisateur
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 py-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                                            <Input
                                                id="username"
                                                value={newUser.username}
                                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="password">Mot de passe</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="admin"
                                                checked={newUser.isAdmin}
                                                onCheckedChange={(checked) => setNewUser({ ...newUser, isAdmin: checked })}
                                            />
                                            <Label htmlFor="admin">Administrateur</Label>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button onClick={handleCreateUser}>
                                            Créer
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table className="min-w-full border-collapse">
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead
                                        className="cursor-pointer whitespace-nowrap py-2 px-3 text-xs font-medium"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Nom {getSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hidden sm:table-cell whitespace-nowrap py-2 px-3 text-xs font-medium"
                                        onClick={() => handleSort("email")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Email {getSortIcon("email")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hidden md:table-cell whitespace-nowrap py-2 px-3 text-xs font-medium"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Inscription {getSortIcon("created_at")}
                                        </div>
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell whitespace-nowrap py-2 px-3 text-xs font-medium">
                                        Rôle
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap py-2 px-3 text-xs font-medium text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-12 text-sm text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                                <span>Chargement...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : sortedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-12 text-sm text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <Search className="h-6 w-6" />
                                                <span>Aucun utilisateur trouvé</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedUsers.map((user) => (
                                        <TableRow key={user.id} className="border-b hover:bg-muted/20">
                                            <TableCell className="py-2 px-3">
                                                <div className="min-w-[100px]">
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="sm:hidden text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                                                        {user.email}
                                                    </div>
                                                    <div className="sm:hidden mt-1">
                                                        <Badge
                                                            variant={user.isAdmin ? "default" : "secondary"}
                                                            className="text-[10px] px-1 py-0 h-4"
                                                        >
                                                            {user.isAdmin ? "Admin" : "User"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell py-2 px-3 text-sm">
                                                {user.email}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell py-2 px-3 text-sm whitespace-nowrap">
                                                {format(
                                                    new Date(user.created_at),
                                                    "dd/MM/yyyy",
                                                    { locale: fr }
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell py-2 px-3">
                                                <Badge
                                                    variant={user.isAdmin ? "default" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {user.isAdmin ? "Admin" : "Utilisateur"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-2 px-2 text-right">
                                                <div className="flex flex-wrap gap-1 justify-end items-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                                        className="h-7 w-7"
                                                        title={user.isAdmin ? "Retirer les droits admin" : "Rendre administrateur"}
                                                    >
                                                        {user.isAdmin ? (
                                                            <ShieldOff className="h-4 w-4 text-destructive" />
                                                        ) : (
                                                            <Shield className="h-4 w-4 text-primary" />
                                                        )}
                                                    </Button>
                                                    
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                title="Modifier l'utilisateur"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="w-[calc(100%-32px)] sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
                                                                <DialogDescription>
                                                                    {user.name} ({user.email})
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-3 py-3">
                                                                <div className="space-y-1">
                                                                    <Label>Statut de l&apos;utilisateur</Label>
                                                                    <Select
                                                                        value={user.status || 'active'}
                                                                        onValueChange={(value) => handleStatusChange(user.id, value)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Sélectionner un statut" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="active">Actif</SelectItem>
                                                                            <SelectItem value="suspended">Suspendu</SelectItem>
                                                                            <SelectItem value="banned">Banni</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                                                <Button variant="outline" className="mt-0">
                                                                    Annuler
                                                                </Button>
                                                                <Button>
                                                                    Enregistrer
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                title="Supprimer l'utilisateur"
                                                            >
                                                                <X className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="w-[calc(100%-32px)] sm:max-w-lg">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Cette action est irréversible. Toutes les données de {user.name} seront supprimées.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                                                <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 