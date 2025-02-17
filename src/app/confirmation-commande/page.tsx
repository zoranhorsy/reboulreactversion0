'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { OrderDetails } from '@/app/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function ConfirmationPage() {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
    const { lastOrder, clearLastOrder } = useCart()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (lastOrder) {
                console.log('Using last order details from context');
                setOrderDetails(lastOrder);
            } else {
                console.log('No last order found in context, checking localStorage');
                const storedOrder = localStorage.getItem('lastOrder');
                if (storedOrder) {
                    console.log('Found order in localStorage');
                    setOrderDetails(JSON.parse(storedOrder));
                } else {
                    console.log('No order found in localStorage');
                }
            }
        }
    }, [lastOrder])

    useEffect(() => {
        return () => {
            clearLastOrder()
        }
    }, [clearLastOrder])

    if (!orderDetails) {
        return <div>Aucune commande trouvée.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Confirmation de commande</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-lg font-semibold">Merci pour votre commande, {orderDetails.customer.name}&nbsp;!</p>
                        <p>Votre numéro de commande est : <span className="font-semibold">{orderDetails.id}</span></p>
                        <p>Date de la commande : {new Date(orderDetails.date).toLocaleDateString()}</p>
                        <p>Statut : <span className="font-semibold">{orderDetails.status}</span></p>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Détails de la commande :</h3>
                            <ul className="list-disc list-inside space-y-2">
                                {orderDetails.items.map((item, index) => (
                                    <li key={index}>
                                        {item.name} - Quantité : {item.quantity} - Prix : {item.price.toFixed(2)}€
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="text-lg font-semibold">Total : {orderDetails.total.toFixed(2)}€</p>
                        <p>Un e-mail de confirmation a été envoyé à {orderDetails.customer.email}</p>
                    </div>
                    <div className="mt-8 text-center">
                        <Link href="/">
                            <Button>Retour à l&apos;accueil</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

