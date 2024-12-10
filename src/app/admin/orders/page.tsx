'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

type Order = {
    id: string
    date: string
    customer: string
    total: number
    status: OrderStatus
}

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([
        { id: "ORD-001", date: "2023-05-15", customer: "John Doe", total: 550, status: "pending" },
        { id: "ORD-002", date: "2023-05-16", customer: "Jane Smith", total: 250, status: "processing" },
        { id: "ORD-003", date: "2023-05-17", customer: "Bob Johnson", total: 450, status: "shipped" },
        { id: "ORD-004", date: "2023-05-18", customer: "Alice Brown", total: 300, status: "delivered" },
    ])

    const { toast } = useToast()

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order))
        toast({
            title: "Statut mis à jour",
            description: `La commande ${orderId} est maintenant ${newStatus}.`,
        })
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gestion des commandes</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Commande</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
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
                                            <Badge variant="default">En attente</Badge>
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            <Badge variant="secondary">En traitement</Badge>
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                            <Badge variant="default">Expédié</Badge>
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                            <Badge variant="success">Livré</Badge>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

