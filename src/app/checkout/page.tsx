'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Truck, ShoppingBag } from 'lucide-react'

export default function CheckoutPage() {
    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: '',
    })
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    })
    const { items: cartItems, total, clearCart } = useCart()
    const router = useRouter()
    const { toast } = useToast()
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState("shipping")

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            router.push('/panier')
        }
    }, [cartItems, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)

        // Simuler un traitement de paiement
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Ici, vous implémenteriez la logique réelle de paiement avec Stripe
        console.log('Informations de paiement:', paymentInfo)
        console.log('Informations de livraison:', shippingInfo)

        clearCart()
        toast({
            title: "Paiement réussi",
            description: "Votre commande a été traitée avec succès.",
        })
        router.push('/confirmation-commande')
    }

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        setActiveTab("payment")
    }

    if (!cartItems || cartItems.length === 0) {
        return null // Le useEffect redirigera vers le panier
    }

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Finalisation de la commande</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="shipping">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Livraison
                                </TabsTrigger>
                                <TabsTrigger value="payment">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Paiement
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="shipping">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations de livraison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleContinue} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Adresse</Label>
                                                <Input
                                                    id="address"
                                                    value={shippingInfo.address}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Ville</Label>
                                                <Input
                                                    id="city"
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Code postal</Label>
                                                <Input
                                                    id="postalCode"
                                                    value={shippingInfo.postalCode}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Pays</Label>
                                                <Input
                                                    id="country"
                                                    value={shippingInfo.country}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">Continuer vers le paiement</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="payment">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations de paiement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Nom sur la carte</Label>
                                                <Input
                                                    id="name"
                                                    value={paymentInfo.name}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Numéro de carte</Label>
                                                <Input
                                                    id="cardNumber"
                                                    value={paymentInfo.cardNumber}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiry">Date d'expiration</Label>
                                                    <Input
                                                        id="expiry"
                                                        value={paymentInfo.expiry}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                                                        placeholder="MM/AA"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvc">CVC</Label>
                                                    <Input
                                                        id="cvc"
                                                        value={paymentInfo.cvc}
                                                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvc: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? 'Traitement en cours...' : 'Payer'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    Résumé de la commande
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-2">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                    </div>
                                ))}
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center font-bold">
                                    <span>Total</span>
                                    <span>{total.toFixed(2)} €</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <ScrollToTopButton />
        </div>
    )
}

