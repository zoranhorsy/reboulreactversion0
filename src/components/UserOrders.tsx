import React, { useState, useEffect, useCallback } from 'react';
import { api, Order } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedOrders = await api.fetchOrders();
            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les commandes.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleViewDetails = async (orderId: string) => {
        try {
            const orderDetails = await api.getOrderById(orderId);
            // Handle displaying order details (e.g., open a modal or navigate to a details page)
            console.log('Order details:', orderDetails);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les détails de la commande.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <div>Chargement des commandes...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Vos commandes</h2>
            {orders.length > 0 ? (
                orders.map((order) => (
                    <Card key={order.id}>
                        <CardContent className="p-4">
                            <p>Commande #{order.id}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Total: {order.totalAmount.toFixed(2)} €</p>
                            <p>Statut: {order.status}</p>
                            <Button onClick={() => handleViewDetails(order.id)} className="mt-2">
                                Voir les détails
                            </Button>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <p>Vous n&apos;avez pas encore de commandes.</p>
            )}
        </div>
    );
}

