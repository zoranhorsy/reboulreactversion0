'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, ChevronDown, ChevronUp, Download, Printer } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"
import { CSVLink } from "react-csv"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { ReturnForm } from '@/components/admin/ReturnForm'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant: {
        size: string;
        color: string;
    };
}

interface Order {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    returnDate?: string;
    returnReason?: string;
}

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-200 text-yellow-800',
    processing: 'bg-blue-200 text-blue-800',
    shipped: 'bg-purple-200 text-purple-800',
    delivered: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800',
    returned: 'bg-red-500 text-white'
}

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'ascending' | 'descending' } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
    const [dateFilter, setDateFilter] = useState<Date | null>(null)
    const [minTotalFilter, setMinTotalFilter] = useState('')
    const [maxTotalFilter, setMaxTotalFilter] = useState('')

    const { toast } = useToast()

    const fetchOrders = useCallback(async () => {
        setIsLoading(true)
        try {
            console.log('Fetching orders...');
            const response = await fetch('/api/admin/orders')
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch orders')
            }
            const data = await response.json()
            console.log('Fetched orders data:', data)
            setOrders(data)
            setFilteredOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les commandes. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        console.log('useEffect running, calling fetchOrders');
        fetchOrders()
        const intervalId = setInterval(fetchOrders, 30000)
        return () => clearInterval(intervalId)
    }, [fetchOrders])

    useEffect(() => {
        const filtered = orders.filter(order =>
            (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'all' || order.status === statusFilter) &&
            (!dateFilter || new Date(order.date).toDateString() === dateFilter.toDateString()) &&
            (!minTotalFilter || order.total >= parseFloat(minTotalFilter)) &&
            (!maxTotalFilter || order.total <= parseFloat(maxTotalFilter))
        )
        setFilteredOrders(filtered)
    }, [searchTerm, orders, statusFilter, dateFilter, minTotalFilter, maxTotalFilter])

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const response = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            const updatedOrder = await response.json();
            setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
            setFilteredOrders(filteredOrders.map(order => order.id === orderId ? updatedOrder : order));

            toast({
                title: "Statut mis à jour",
                description: `La commande ${orderId} est maintenant ${newStatus}.`,
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour le statut de la commande.",
                variant: "destructive",
            });
        }
    }

    const handleSort = (key: keyof Order) => {
        let direction: 'ascending' | 'descending' = 'ascending'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })

        const sortedOrders = [...filteredOrders].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1
            return 0
        })

        setFilteredOrders(sortedOrders)
    }

    const openOrderDetails = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsDialogOpen(true);
        } else {
            toast({
                title: "Erreur",
                description: "Impossible de trouver les détails de la commande.",
                variant: "destructive",
            });
        }
    }

    const openReturnDialog = (order: Order) => {
        setSelectedOrder(order)
        setIsReturnDialogOpen(true)
    }

    const handleReturnProcessed = (updatedOrder: Order) => {
        setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order))
        setFilteredOrders(filteredOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order))
        setIsReturnDialogOpen(false)
    }

    const exportToCSV = () => {
        return filteredOrders.map(order => ({
            ID: order.id,
            Date: order.date,
            Client: order.customer,
            Total: order.total,
            Statut: order.status
        }))
    }

    const generatePDF = (order: Order) => {
        const doc = new jsPDF()
        doc.text(`Facture - Commande ${order.id}`, 20, 20)
        doc.text(`Client: ${order.customer}`, 20, 30)
        doc.text(`Date: ${order.date}`, 20, 40)
        doc.text(`Statut: ${order.status}`, 20, 50)
        doc.text(`Total: ${order.total} €`, 20, 60)

        const tableColumn = ["Produit", "Quantité", "Prix unitaire", "Total"]
        const tableRows = order.items.map(item => [
            item.name,
            item.quantity,
            `${item.price} €`,
            `${item.quantity * item.price} €`
        ])

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70
        })

        doc.save(`facture_${order.id}.pdf`)
    }

    console.log('Rendering OrderManagement, orders:', orders, 'filteredOrders:', filteredOrders);

    if (isLoading) {
        return <div>Chargement des commandes...</div>
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Gestion des commandes</h1>
            <Button onClick={fetchOrders} className="mb-4">
                Rafraîchir les commandes
            </Button>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Résumé des commandes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total des commandes</p>
                            <p className="text-2xl font-bold">{orders.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Commandes en attente</p>
                            <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Commandes expédiées</p>
                            <p className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Commandes retournées</p>
                            <p className="text-2xl font-bold">{orders.filter(o => o.status === 'returned').length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="processing">En traitement</SelectItem>
                        <SelectItem value="shipped">Expédié</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                        <SelectItem value="returned">Retourné</SelectItem>
                    </SelectContent>
                </Select>
                <DatePicker
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    placeholderText="Filtrer par date"
                />
                <Input
                    type="number"
                    placeholder="Total min"
                    value={minTotalFilter}
                    onChange={(e) => setMinTotalFilter(e.target.value)}
                    className="w-full md:w-[120px]"
                />
                <Input
                    type="number"
                    placeholder="Total max"
                    value={maxTotalFilter}
                    onChange={(e) => setMaxTotalFilter(e.target.value)}
                    className="w-full md:w-[120px]"
                />
                <CSVLink
                    data={exportToCSV()}
                    filename={"commandes.csv"}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Exporter CSV
                </CSVLink>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                            ID Commande
                            {sortConfig?.key === 'id' && (
                                sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                            )}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                            Date
                            {sortConfig?.key === 'date' && (
                                sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                            )}
                        </TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('total')}>
                            Total
                            {sortConfig?.key === 'total' && (
                                sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                            )}
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.total} €</TableCell>
                            <TableCell>
                                <Select
                                    value={order.status}
                                    onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <Badge className={statusColors.pending}>En attente</Badge>
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            <Badge className={statusColors.processing}>En traitement</Badge>
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                            <Badge className={statusColors.shipped}>Expédié</Badge>
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                            <Badge className={statusColors.delivered}>Livré</Badge>
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            <Badge className={statusColors.cancelled}>Annulé</Badge>
                                        </SelectItem>
                                        <SelectItem value="returned">
                                            <Badge className={statusColors.returned}>Retourné</Badge>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openOrderDetails(order.id)}>
                                        Détails
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => generatePDF(order)}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        Imprimer facture
                                    </Button>
                                    {order.status !== 'returned' && (
                                        <Button variant="outline" size="sm" onClick={() => openReturnDialog(order)}>
                                            Retour
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Détails de la commande {selectedOrder?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div>
                            <p><strong>Client:</strong> {selectedOrder.customer}</p>
                            <p><strong>Date:</strong> {selectedOrder.date}</p>
                            <p><strong>Statut:</strong> {selectedOrder.status}</p>
                            <p><strong>Total:</strong> {selectedOrder.total} €</p>
                            <h3 className="font-bold mt-4 mb-2">Articles commandés:</h3>
                            <ul>
                                {selectedOrder.items.map((item, index) => (
                                    <li key={index}>
                                        {item.name} - Quantité: {item.quantity} - Prix: {item.price} €
                                    </li>
                                ))}
                            </ul>
                            {selectedOrder.status === 'returned' && (
                                <div className="mt-4">
                                    <h3 className="font-bold mb-2">Informations de retour:</h3>
                                    <p><strong>Date de retour:</strong> {selectedOrder.returnDate}</p>
                                    <p><strong>Raison du retour:</strong> {selectedOrder.returnReason}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Traiter le retour pour la commande {selectedOrder?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <ReturnForm order={selectedOrder} onReturnProcessed={handleReturnProcessed} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

