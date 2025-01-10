'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/app/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Truck, ShoppingBag, Lock } from 'lucide-react'
import { StripeProvider } from '@/components/StripeProvider'
import { CheckoutForm } from '@/components/CheckoutForm'

const shippingSchema = z.object({
    address: z.string().min(1, "L'adresse est requise"),
    city: z.string().min(1, "La ville est requise"),
    postalCode: z.string().regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres"),
    country: z.string().min(1, "Le pays est requis"),
})

type ShippingFormData = z.infer<typeof shippingSchema>

export default function CheckoutPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
        resolver: zodResolver(shippingSchema)
    })
    const { items: cartItems, total } = useCart()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("shipping")

    useEffect(() => {
        console.log('CheckoutPage mounted, cartItems:', cartItems);
        if (!cartItems || cartItems.length === 0) {
            console.log('Cart is empty, redirecting to /');
            router.push('/')
        }
    }, [cartItems, router])

    const onSubmitShipping = (data: ShippingFormData) => {
        console.log('Shipping data submitted:', data);
        setActiveTab("payment")
    }

    if (!cartItems || cartItems.length === 0) {
        console.log('Cart is empty, rendering null and redirecting to /');
        return null
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
                                        <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Adresse</Label>
                                                <Input
                                                    id="address"
                                                    {...register('address')}
                                                    aria-invalid={errors.address ? 'true' : 'false'}
                                                />
                                                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Ville</Label>
                                                <Input
                                                    id="city"
                                                    {...register('city')}
                                                    aria-invalid={errors.city ? 'true' : 'false'}
                                                />
                                                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Code postal</Label>
                                                <Input
                                                    id="postalCode"
                                                    {...register('postalCode')}
                                                    aria-invalid={errors.postalCode ? 'true' : 'false'}
                                                />
                                                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Pays</Label>
                                                <Input
                                                    id="country"
                                                    {...register('country')}
                                                    aria-invalid={errors.country ? 'true' : 'false'}
                                                />
                                                {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
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
                                        <StripeProvider>
                                            <CheckoutForm />
                                        </StripeProvider>
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
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Lock className="mr-2 h-5 w-5" />
                                    Paiement sécurisé
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Vos informations de paiement sont sécurisées. Nous utilisons le cryptage SSL pour protéger vos données.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <ScrollToTopButton />
        </div>
    )
}

