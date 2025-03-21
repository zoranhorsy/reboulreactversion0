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
            console.log('Réponse API complète:', response)
            
            if (response && response.data) {
                console.log('Commandes chargées:', response.data.length)
                
                // Récupérer les détails de chaque commande pour obtenir les articles (items)
                const ordersWithDetails = await Promise.all(
                    response.data.map(async (order) => {
                        try {
                            console.log(`Récupération des détails pour la commande #${order.id}`);
                            const orderDetails = await api.getOrderById(order.id.toString());
                            console.log(`Détails récupérés pour la commande #${order.id}:`, orderDetails);
                            
                            // Loguer les items pour voir leur structure
                            if (orderDetails && orderDetails.items) {
                                console.log(`Commande #${order.id} - Structure des items:`, orderDetails.items.map(item => ({
                                    id: item.id,
                                    product_name: item.product_name,
                                    product_id: item.product_id
                                })));
                                
                                // Récupérer les détails des produits pour obtenir les SKU et références
                                const itemsWithProductDetails = await Promise.all(
                                    orderDetails.items.map(async (item) => {
                                        try {
                                            // Récupérer les détails du produit
                                            const productId = item.product_id;
                                            if (productId) {
                                                console.log(`Récupération des détails du produit #${productId}`);
                                                const productDetails = await api.getProductById(productId.toString());
                                                console.log(`Détails du produit #${productId}:`, productDetails);
                                                
                                                if (productDetails) {
                                                    return {
                                                        ...item,
                                                        product_details: productDetails
                                                    };
                                                }
                                            }
                                            return item;
                                        } catch (error) {
                                            console.error(`Erreur lors de la récupération des détails du produit pour l'item #${item.id}:`, error);
                                            return item;
                                        }
                                    })
                                );
                                
                                // Mettre à jour les items avec les détails des produits
                                orderDetails.items = itemsWithProductDetails;
                            }
                            
                            return orderDetails || order;
                        } catch (error) {
                            console.error(`Erreur lors de la récupération des détails pour la commande #${order.id}:`, error);
                            return order;
                        }
                    })
                );
                
                console.log('Commandes avec détails:', ordersWithDetails);
                
                // Adapter les données pour que shipping_info soit converti en shipping_address
                // et variant_info soit converti en variant pour les items
                const adaptedOrders = ordersWithDetails.map(order => {
                    let adaptedOrder = { ...order };
                    
                    // Adapter les items pour remapper variant_info vers variant
                    if (adaptedOrder.items && adaptedOrder.items.length > 0) {
                        console.log(`Commande #${order.id} a ${adaptedOrder.items.length} articles adaptés:`, adaptedOrder.items);
                    } else {
                        console.warn(`Pas d&apos;items trouvés pour la commande #${order.id} à adapter`);
                    }
                    
                    return adaptedOrder;
                });
                
                console.log('Commandes adaptées:', adaptedOrders.length);
                console.log('Exemple de commande adaptée:', adaptedOrders[0]);
                setOrders(adaptedOrders);
                setFilteredOrders(adaptedOrders);
            } else {
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les commandes.",
                variant: "destructive",
            });
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setIsLoading(false);
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

    const validateShippingAddress = (address: any) => {
        if (!address) return false
        
        console.log('Validating address:', address)
        console.log('Address type:', typeof address)
        
        // Si l'adresse est une chaîne JSON, essayer de la parser
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address)
                console.log('Parsed address from string:', address)
            } catch (err) {
                console.error('Failed to parse address string:', err)
                return false
            }
        }
        
        // Vérifier les champs requis
        const hasRequiredFields = 
            !!address.street && 
            !!address.postal_code && 
            !!address.city && 
            !!address.country
        
        if (!hasRequiredFields) {
            console.warn('Adresse incomplète:', {
                missingFields: {
                    street: !address.street,
                    postal_code: !address.postal_code,
                    city: !address.city,
                    country: !address.country
                },
                address
            })
            return false
        }
        
        return true
    }

    const renderShippingAddress = (order: Order) => {
        console.log(`Rendu adresse pour commande #${order.id}:`, {
            hasAddress: !!order.shipping_address,
            address: order.shipping_address,
            addressType: order.shipping_address ? typeof order.shipping_address : 'undefined',
            isValid: validateShippingAddress(order.shipping_address)
        })

        if (!order.shipping_address) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Adresse manquante
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <p className="text-red-600 font-medium">Action requise</p>
                        <p className="text-muted-foreground text-xs mt-1">
                            Cette commande nécessite une adresse de livraison pour être expédiée.
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-red-50 p-2 rounded-md">
                        <p className="font-medium">Informations à compléter :</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                            <li>Adresse complète</li>
                            <li>Code postal</li>
                            <li>Ville</li>
                            <li>Pays</li>
                            <li>Numéro de téléphone</li>
                        </ul>
                    </div>
                </div>
            )
        }

        if (!validateShippingAddress(order.shipping_address)) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                            Adresse incomplète
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <p className="text-yellow-600 font-medium">Vérification requise</p>
                        <p className="text-muted-foreground text-xs mt-1">
                            Certaines informations de livraison sont manquantes.
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded-md">
                        <p className="font-medium">Champs manquants :</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {!order.shipping_address.street && <li>Adresse</li>}
                            {!order.shipping_address.postal_code && <li>Code postal</li>}
                            {!order.shipping_address.city && <li>Ville</li>}
                            {!order.shipping_address.country && <li>Pays</li>}
                        </ul>
                    </div>
                </div>
            )
        }

        // Obtenir les bonnes valeurs d'adresse, en tenant compte des deux formats possibles
        const streetAddress = order.shipping_address.street
        const postalCode = order.shipping_address.postal_code
        
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Adresse complète
                    </Badge>
                </div>
                <div className="text-sm">
                    <p className="font-medium">{streetAddress}</p>
                    <p>{postalCode} {order.shipping_address.city}</p>
                    <p className="text-muted-foreground">{order.shipping_address.country}</p>
                </div>
            </div>
        )
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {isLoading ? (
                                <div className="col-span-full text-center h-24 flex items-center justify-center">
                                    Chargement...
                                </div>
                            ) : sortedOrders.length === 0 ? (
                                <div className="col-span-full text-center h-24 flex items-center justify-center">
                                    Aucune commande trouvée
                                </div>
                            ) : (
                                sortedOrders.map((order) => (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardContent className="p-4 space-y-4">
                                            {/* En-tête avec infos principales */}
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">#{order.id}</span>
                                                        <Badge variant="secondary" className={statusColors[order.status]}>
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col text-xs text-muted-foreground">
                                                        <span>Créée le: {format(new Date(order.created_at), "Pp", { locale: fr })}</span>
                                                        {order.updated_at && order.updated_at !== order.created_at && (
                                                            <span>Modifiée le: {format(new Date(order.updated_at), "Pp", { locale: fr })}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold">
                                                        {formatAmount(order.total_amount)}
                                                    </div>
                                                    {order.shipping_cost && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Dont livraison: {formatAmount(order.shipping_cost)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informations client */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Client</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        ID: {order.user_id}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-medium">{users[order.user_id]?.name || `Client #${order.user_id}`}</p>
                                                    <p className="text-muted-foreground">{users[order.user_id]?.email || 'Email non disponible'}</p>
                                                </div>
                                            </div>

                                            {/* Produits commandés */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Produits</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {order.items?.length || 0} article{order.items?.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    {(!order.items || order.items.length === 0) ? (
                                                        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                                            <p>Aucun produit dans cette commande</p>
                                                            <p className="text-xs text-muted-foreground mt-1">La commande ne contient aucun article.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {order.items.slice(0, 3).map((item) => (
                                                                <div key={item.id || `item-${Math.random()}`} className="flex justify-between items-start text-sm py-1">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="truncate">{item.product_name}</p>
                                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                                                            <div>
                                                                                <p>Qté: {item.quantity}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p>Prix: {formatAmount(item.price)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-medium">{formatAmount(item.price * item.quantity)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {order.items.length > 3 && (
                                                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                                                                    <span>
                                                                        +{order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''} article{order.items.length - 3 > 1 ? 's' : ''}
                                                                    </span>
                                                                    <span>Total: {formatAmount(order.total_amount)}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Adresse de livraison */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">Adresse de livraison</span>
                                                    {order.shipping_address ? (
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-xs ${
                                                                validateShippingAddress(order.shipping_address)
                                                                    ? ''
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                        >
                                                            {validateShippingAddress(order.shipping_address)
                                                                ? 'Livraison standard'
                                                                : 'Incomplète'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                                            À compléter
                                                        </Badge>
                                                    )}
                                                </div>
                                                {renderShippingAddress(order)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2 border-t">
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => handleUpdateStatus(order.id, value)}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue>
                                                            <Badge variant="secondary" className={statusColors[order.status]}>
                                                                {order.status}
                                                            </Badge>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">En attente</SelectItem>
                                                        <SelectItem value="processing">En cours</SelectItem>
                                                        <SelectItem value="shipped">Expédiée</SelectItem>
                                                        <SelectItem value="delivered">Livrée</SelectItem>
                                                        <SelectItem value="cancelled">Annulée</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
                                                        </DialogHeader>
                                                        {selectedOrder && (
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="font-medium mb-2">Informations client</h4>
                                                                        <div className="space-y-1">
                                                                            <p>ID Client: {selectedOrder.user_id}</p>
                                                                            <p>Nom: {users[selectedOrder.user_id]?.name}</p>
                                                                            <p>Email: {users[selectedOrder.user_id]?.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium mb-2">Statut et dates</h4>
                                                                        <div className="space-y-1">
                                                                            <p>Statut: <Badge variant="secondary" className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge></p>
                                                                            <p>Créée le: {format(new Date(selectedOrder.created_at), "Pp", { locale: fr })}</p>
                                                                            {selectedOrder.updated_at && selectedOrder.updated_at !== selectedOrder.created_at && (
                                                                                <p>Modifiée le: {format(new Date(selectedOrder.updated_at), "Pp", { locale: fr })}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-medium mb-2">Produits commandés</h4>
                                                                    <div className="space-y-2">
                                                                        {(!selectedOrder.items || selectedOrder.items.length === 0) ? (
                                                                            <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded">
                                                                                <p className="font-medium">Aucun produit dans cette commande</p>
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    Cette commande ne contient aucun article. Cela peut indiquer un problème avec les données.
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            selectedOrder.items.map((item) => (
                                                                                <div key={item.id || `item-${Math.random()}`} className="flex justify-between items-center py-2 border-b last:border-0">
                                                                                    <div>
                                                                                        <p className="font-medium">{item.product_name}</p>
                                                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                                                                            <div>
                                                                                                <p>Qté: {item.quantity}</p>
                                                                                            </div>
                                                                                            <div>
                                                                                                <p>Prix: {formatAmount(item.price)}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="font-medium">{formatAmount(item.price * item.quantity)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <h4 className="font-medium mb-2">Adresse de livraison</h4>
                                                                        {selectedOrder.shipping_address ? (
                                                                            <div className="space-y-2">
                                                                                <div className="space-y-1">
                                                                                    <p className="font-medium">{selectedOrder.shipping_address.street}</p>
                                                                                    <p>{selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}</p>
                                                                                    <p>{selectedOrder.shipping_address.country}</p>
                                                                                </div>
                                                                                <div className="pt-2 border-t">
                                                                                    <p className="text-sm text-muted-foreground">Contact</p>
                                                                                    <p className="font-medium">-</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-2">
                                                                                <div className="p-4 bg-yellow-50 rounded-md">
                                                                                    <p className="text-sm text-yellow-800">
                                                                                        Cette commande nécessite une adresse de livraison.
                                                                                    </p>
                                                                                    <p className="text-xs text-yellow-700 mt-1">
                                                                                        Veuillez compléter les informations de livraison pour permettre l&apos;expédition.
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <p className="text-sm font-medium">Informations requises :</p>
                                                                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                                                                        <li>Adresse complète</li>
                                                                                        <li>Code postal</li>
                                                                                        <li>Ville</li>
                                                                                        <li>Pays</li>
                                                                                        <li>Numéro de téléphone</li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium mb-2">Récapitulatif</h4>
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between">
                                                                                <span>Sous-total</span>
                                                                                <span>{formatAmount(selectedOrder.total_amount - (selectedOrder.shipping_cost || 0))}</span>
                                                                            </div>
                                                                            {selectedOrder.shipping_cost && (
                                                                                <div className="flex justify-between">
                                                                                    <span>Livraison</span>
                                                                                    <span>{formatAmount(selectedOrder.shipping_cost)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between font-medium pt-1 border-t">
                                                                                <span>Total</span>
                                                                                <span>{formatAmount(selectedOrder.total_amount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 