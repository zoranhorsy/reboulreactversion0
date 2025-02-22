'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type Order, fetchUsers } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, Search, ArrowUp, ArrowDown } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortConfig = {
    key: keyof Order
    direction: "ascending" | "descending"
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
}

export function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [users, setUsers] = useState<Record<string, { name: string, email: string }>>({})
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: "created_at",
        direction: "descending",
    })
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const { toast } = useToast()

    const loadUsers = useCallback(async () => {
        try {
            const users = await fetchUsers()
            const usersMap: Record<string, { name: string, email: string }> = {}
            users.forEach((user) => {
                usersMap[user.id] = { name: user.name, email: user.email }
            })
            setUsers(usersMap)
        } catch (error) {
            console.error('Error loading users:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les informations des utilisateurs.",
                variant: "destructive",
            })
        }
    }, [toast])

    const loadOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await api.fetchOrders()
            if (response && response.data) {
                setOrders(response.data)
                setFilteredOrders(response.data)
            } else {
                setOrders([])
                setFilteredOrders([])
            }
        } catch (error) {
            console.error('Error loading orders:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les commandes.",
                variant: "destructive",
            })
            setOrders([])
            setFilteredOrders([])
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        loadOrders()
        loadUsers()
    }, [loadOrders, loadUsers])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        filterOrders(value, statusFilter)
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status)
        filterOrders(searchTerm, status)
    }

    const filterOrders = (search: string, status: string) => {
        let filtered = [...orders]

        // Filtre par recherche
        if (search) {
            filtered = filtered.filter((order) =>
                order.id.toString().includes(search) ||
                order.user_id.toString().includes(search)
            )
        }

        // Filtre par statut
        if (status !== "all") {
            filtered = filtered.filter((order) => order.status === status)
        }

        setFilteredOrders(filtered)
    }

    const handleSort = (key: keyof Order) => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key && current.direction === "ascending"
                    ? "descending"
                    : "ascending",
        }))
    }

    const getSortIcon = (key: keyof Order) => {
        if (sortConfig.key !== key) return null
        return sortConfig.direction === "ascending" ? (
            <ArrowUp className="h-4 w-4" />
        ) : (
            <ArrowDown className="h-4 w-4" />
        )
    }

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortConfig.key === "created_at") {
            const dateA = new Date(a[sortConfig.key]).getTime()
            const dateB = new Date(b[sortConfig.key]).getTime()
            return sortConfig.direction === "ascending"
                ? dateA - dateB
                : dateB - dateA
        }

        const valueA = a[sortConfig.key]
        const valueB = b[sortConfig.key]

        if (valueA === undefined && valueB === undefined) return 0
        if (valueA === undefined) return 1
        if (valueB === undefined) return -1

        if (valueA < valueB) {
            return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (valueA > valueB) {
            return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
    })

    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            await api.updateOrderStatus(orderId, newStatus)
            toast({
                title: "Succès",
                description: "Le statut de la commande a été mis à jour.",
            })
            loadOrders()
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut de la commande.",
                variant: "destructive",
            })
        }
    }

    const formatAmount = (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null) return '0.00 €'
        return `${Number(amount).toFixed(2)} €`
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion des commandes</CardTitle>
                    <CardDescription>
                        Gérez et suivez toutes les commandes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une commande..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={handleStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="processing">En cours</SelectItem>
                                <SelectItem value="shipped">Expédiée</SelectItem>
                                <SelectItem value="delivered">Livrée</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("id")}
                                    >
                                        <div className="flex items-center gap-2">
                                            ID {getSortIcon("id")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("user_id")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Client {getSortIcon("user_id")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("total_amount")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Total {getSortIcon("total_amount")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("status")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Statut {getSortIcon("status")}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        <div className="flex items-center gap-2">
                                            Date {getSortIcon("created_at")}
                                        </div>
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center h-24"
                                        >
                                            Chargement...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center h-24"
                                        >
                                            Aucune commande trouvée
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                #{order.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {users[order.user_id]?.name || `Client #${order.user_id}`}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {users[order.user_id]?.email || 'Email non disponible'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatAmount(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) =>
                                                        handleUpdateStatus(
                                                            order.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue>
                                                            <Badge
                                                                variant="secondary"
                                                                className={
                                                                    statusColors[
                                                                        order.status
                                                                    ]
                                                                }
                                                            >
                                                                {order.status}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">
                                                            En attente
                                                        </SelectItem>
                                                        <SelectItem value="processing">
                                                            En cours
                                                        </SelectItem>
                                                        <SelectItem value="shipped">
                                                            Expédiée
                                                        </SelectItem>
                                                        <SelectItem value="delivered">
                                                            Livrée
                                                        </SelectItem>
                                                        <SelectItem value="cancelled">
                                                            Annulée
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {format(
                                                    new Date(order.created_at),
                                                    "Pp",
                                                    { locale: fr }
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedOrder(order)
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Détails
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Détails de la commande #{order.id}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        {selectedOrder && (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="font-medium mb-2">
                                                                        Informations client
                                                                    </h4>
                                                                    <p>ID Client: {selectedOrder.user_id}</p>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium mb-2">
                                                                        Produits commandés
                                                                    </h4>
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Produit</TableHead>
                                                                                <TableHead>Quantité</TableHead>
                                                                                <TableHead>Prix</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {selectedOrder.items?.map((item) => (
                                                                                <TableRow key={item.id}>
                                                                                    <TableCell>{item.product_name}</TableCell>
                                                                                    <TableCell>{item.quantity}</TableCell>
                                                                                    <TableCell>{item.price} €</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium mb-2">
                                                                        Adresse de livraison
                                                                    </h4>
                                                                    {selectedOrder.shipping_address ? (
                                                                        <p>
                                                                            {selectedOrder.shipping_address.street}
                                                                            <br />
                                                                            {selectedOrder.shipping_address.postal_code}{" "}
                                                                            {selectedOrder.shipping_address.city}
                                                                            <br />
                                                                            {selectedOrder.shipping_address.country}
                                                                        </p>
                                                                    ) : (
                                                                        <p>Adresse non disponible</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
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