'use client'

import { useState, useEffect } from 'react'
import { fetchOrders, Order } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            setLoading(true)
            const fetchedOrders = await fetchOrders()
            setOrders(fetchedOrders)
        } catch (error) {
            console.error('Failed to load orders:', error)
            toast({
                title: "Erreur",
                description: "Impossible de charger les commandes.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Chargement des commandes...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Vos commandes</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p>Vous n'avez pas encore passé de commande.</p>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="mb-4 p-4 border rounded-lg">
                                <p><strong>Commande #{order.id}</strong></p>
                                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                                <p>Total : {order.total.toFixed(2)} €</p>
                                <p>Statut : {order.status}</p>
                                <details>
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                        Voir les détails
                                    </summary>
                                    <ul className="mt-2 list-disc list-inside">
                                        {order.items.map((item, index) => (
                                            <li key={index}>
                                                {item.name} - Quantité : {item.quantity} - Prix : {item.price.toFixed(2)} €
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

