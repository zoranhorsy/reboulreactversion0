'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type User, createUser } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Search, ArrowUp, ArrowDown, Shield, ShieldOff, UserPlus, Pencil } from "lucide-react"
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
            await api.updateUserRole(userId, !isCurrentlyAdmin)
            toast({
                title: "Succès",
                description: `Les droits d'administrateur ont été ${isCurrentlyAdmin ? 'retirés' : 'accordés'}.`,
            })
            loadUsers()
        } catch (error) {
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Gestion des utilisateurs</CardTitle>
                            <CardDescription>
                                Gérez les comptes utilisateurs et leurs droits
                            </CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Nouvel utilisateur
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                                    <DialogDescription>
                                        Remplissez les informations pour créer un nouveau compte utilisateur.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                                        <Input
                                            id="username"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
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
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleCreateUser}>
                                        Créer l&apos;utilisateur
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Nom {getSortIcon("name")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("email")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Email {getSortIcon("email")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Date d&apos;inscription {getSortIcon("created_at")}
                                        </div>
                                    </TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24"
                                        >
                                            Chargement...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24"
                                        >
                                            Aucun utilisateur trouvé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(user.created_at),
                                                    "Pp",
                                                    { locale: fr }
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.isAdmin ? "default" : "secondary"}
                                                >
                                                    {user.isAdmin ? "Administrateur" : "Utilisateur"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                                    >
                                                        {user.isAdmin ? (
                                                            <>
                                                                <ShieldOff className="h-4 w-4 mr-2" />
                                                                Retirer admin
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Rendre admin
                                                            </>
                                                        )}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                            >
                                                                Supprimer
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Supprimer l&apos;utilisateur ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Cette action est irréversible. Toutes les données de l&apos;utilisateur seront supprimées.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Modifier
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
                                                                <DialogDescription>
                                                                    Modifiez les informations de l&apos;utilisateur ici.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
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
                                                        </DialogContent>
                                                    </Dialog>
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