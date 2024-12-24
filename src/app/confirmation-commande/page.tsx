'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Truck, Package, ShoppingBag, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"

interface OrderDetails {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: string;
    items: Array<{ id: number; name: string; price: number; quantity: number }>;
    shippingAddress?: {
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
    };
    estimatedDelivery?: string;
}

export default function ConfirmationPage() {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { lastOrder, clearLastOrder } = useCart()
    const { toast } = useToast()

    useEffect(() => {
        console.log('ConfirmationPage mounted, lastOrder:', lastOrder);
        const fetchOrderDetails = () => {
            try {
                setIsLoading(true)

                if (lastOrder) {
                    console.log('Using last order details from context');
                    setOrderDetails(lastOrder);
                } else {
                    console.log('No last order found in context, checking localStorage');
                    const storedOrder = localStorage.getItem('lastOrder');
                    if (storedOrder) {
                        const parsedOrder = JSON.parse(storedOrder);
                        setOrderDetails(parsedOrder);
                        console.log('Retrieved order from localStorage:', parsedOrder);
                    } else {
                        console.log('No order found in localStorage');
                        setError("Aucune commande n'a été trouvée");
                    }
                }
            } catch (err) {
                console.error('Error fetching order details:', err)
                setError(err instanceof Error ? err.message : "Une erreur est survenue")
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrderDetails()
    }, [lastOrder])

    useEffect(() => {
        if (orderDetails) {
            toast({
                title: "Commande confirmée",
                description: "Votre commande a été traitée avec succès.",
            })
        }
    }, [orderDetails, toast])

    useEffect(() => {
        return () => {
            if (orderDetails) {
                console.log('ConfirmationPage unmounting, clearing lastOrder');
                clearLastOrder();
                localStorage.removeItem('lastOrder');
            }
        }
    }, [orderDetails, clearLastOrder])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Chargement des détails de la commande...</div>
    }

    if (error || !orderDetails) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
                <p className="text-lg mb-4">{error || "Aucune commande trouvée"}</p>
                <p className="text-md mb-4">Veuillez effectuer une commande pour voir les détails de confirmation.</p>
                <Button asChild>
                    <Link href="/catalogue">Voir le catalogue</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl font-bold text-green-600">
                        <CheckCircle className="mr-2 h-6 w-6" />
                        Commande confirmée
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg mb-4">
                        Merci pour votre commande ! Votre numéro de commande est <strong>{orderDetails.id}</strong>.
                    </p>
                    <p>
                        Un e-mail de confirmation a été envoyé à votre adresse e-mail.
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Détails de la commande
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orderDetails.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2">
                                <span>{item.name} x {item.quantity}</span>
                                <span>{(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                        ))}
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span>{orderDetails.total.toFixed(2)} €</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Truck className="mr-2 h-5 w-5" />
                            Informations de livraison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orderDetails.shippingAddress ? (
                            <>
                                <p>{orderDetails.shippingAddress.address || 'Adresse non spécifiée'}</p>
                                <p>{orderDetails.shippingAddress.city || 'Ville non spécifiée'}, {orderDetails.shippingAddress.postalCode || 'Code postal non spécifié'}</p>
                                <p>{orderDetails.shippingAddress.country || 'Pays non spécifié'}</p>
                            </>
                        ) : (
                            <p>Informations de livraison non disponibles</p>
                        )}
                        <Separator className="my-4" />
                        <div className="flex items-center">
                            <Package className="mr-2 h-5 w-5" />
                            <span>Livraison estimée : {orderDetails.estimatedDelivery || 'Date non spécifiée'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 text-center">
                <Button asChild>
                    <Link href="/catalogue">
                        Continuer mes achats
                    </Link>
                </Button>
            </div>
        </div>
    )
}

