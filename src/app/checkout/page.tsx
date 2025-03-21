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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Truck, ShoppingBag, Lock, AlertCircle } from 'lucide-react'
import { StripeProvider } from '@/components/StripeProvider'
import { CheckoutForm } from '@/components/CheckoutForm'
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const shippingSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, "Numéro de téléphone invalide"),
    address: z.string().min(5, "L'adresse est requise (min. 5 caractères)"),
    city: z.string().min(2, "La ville est requise"),
    postalCode: z.string().regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres"),
    country: z.string().min(2, "Le pays est requis"),
})

type ShippingFormData = z.infer<typeof shippingSchema>

const TEST_MODE = process.env.NODE_ENV === 'development'

export default function CheckoutPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
        resolver: zodResolver(shippingSchema)
    })
    const { items, total, clearCart } = useCart()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("shipping")
    const [isProcessing, setIsProcessing] = useState(false)
    const [shippingData, setShippingData] = useState<ShippingFormData | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (items.length === 0) {
            router.push('/')
            toast({
                title: "Panier vide",
                description: "Votre panier est vide. Redirection vers la page d'accueil.",
                variant: "destructive"
            })
        }
    }, [items, router, toast])

    const onSubmitShipping = async (data: ShippingFormData) => {
        try {
            setIsProcessing(true)
            
            // Simuler une vérification d'adresse
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setShippingData(data)
            setActiveTab("payment")
            
            toast({
                title: "Adresse validée",
                description: "Vous pouvez maintenant procéder au paiement.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la validation de l'adresse.",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleTestCheckout = async () => {
        if (!TEST_MODE) return

        try {
            setIsProcessing(true)
            
            if (!shippingData) {
                throw new Error('Données de livraison manquantes')
            }

            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('Vous devez être connecté pour passer une commande')
            }

            // Vérifier le token
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]))
                console.log('Token data:', tokenData)
            } catch (e) {
                console.error('Token invalide:', e)
                throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
            }

            // Vérifier que tous les items ont des variants valides
            const invalidItems = items.filter(item => !item.variant || !item.variant.size || !item.variant.color);
            if (invalidItems.length > 0) {
                const invalidNames = invalidItems.map(item => item.name).join(", ");
                throw new Error(`Les articles suivants n'ont pas de variantes valides : ${invalidNames}. Veuillez retourner au panier pour les sélectionner.`);
            }

            // Vérifier le format des IDs de produits
            for (const item of items) {
                const productId = parseInt(String(item.id).split('-')[0], 10);
                console.log(`Vérification du produit ${item.name}:`, {
                    id: item.id,
                    parsedId: productId,
                    variant: item.variant
                });
            }

            // Créer l'objet de commande
            const orderData = {
                shipping_info: {
                    first_name: shippingData.firstName,
                    last_name: shippingData.lastName,
                    email: shippingData.email,
                    phone: shippingData.phone,
                    address: shippingData.address,
                    city: shippingData.city,
                    postal_code: shippingData.postalCode,
                    country: shippingData.country
                },
                items: items.map(item => {
                    // S'assurer que l'ID est un nombre entier positif
                    const productId = parseInt(String(item.id).split('-')[0], 10);
                    if (isNaN(productId) || productId <= 0) {
                        throw new Error(`ID de produit invalide pour l'article : ${item.name}`);
                    }
                    
                    if (!item.variant || !item.variant.size || !item.variant.color) {
                        throw new Error(`Variants manquants pour l'article : ${item.name}`);
                    }

                    return {
                        product_id: productId,
                        quantity: Math.max(1, Math.floor(Number(item.quantity))),
                        price: Number(parseFloat(item.price.toString()).toFixed(2)),
                        variant: {
                            size: item.variant.size,
                            color: item.variant.color
                        }
                    };
                }),
                total_amount: Number(parseFloat(total.toString()).toFixed(2)),
                status: 'pending',
                payment_status: 'completed'
            }

            // Vérification des données avant envoi
            console.log('Données de livraison:', shippingData)
            console.log('Items du panier:', items)
            console.log('Envoi de la commande:', JSON.stringify(orderData, null, 2))
            console.log('URL de l\'API:', `${process.env.NEXT_PUBLIC_API_URL}/orders`)
            console.log('Token:', token ? 'Présent' : 'Manquant')

            // Envoyer la commande à l'API backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            })

            // Log de la réponse brute pour debug
            const responseText = await response.text()
            console.log('Réponse brute:', responseText)

            let responseData
            try {
                responseData = JSON.parse(responseText)
            } catch (e) {
                console.error('Erreur de parsing JSON:', e)
                throw new Error('La réponse du serveur n\'est pas au format JSON valide')
            }

            if (!response.ok) {
                console.error('Détails de la réponse:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    data: responseData
                })

                // Tenter de parser le message d'erreur s'il est au format JSON
                let errorMessage = 'Erreur lors de la création de la commande'
                if (typeof responseData === 'string') {
                    try {
                        const parsedError = JSON.parse(responseData)
                        errorMessage = Object.values(parsedError[0])[0] as string
                    } catch (e) {
                        errorMessage = responseData
                    }
                } else if (responseData.message) {
                    errorMessage = responseData.message
                } else if (responseData.error) {
                    errorMessage = responseData.error
                }

                // Gestion spécifique des erreurs de stock et de variants
                if (errorMessage.includes('Stock insuffisant')) {
                    throw new Error('Désolé, certains articles ne sont plus disponibles en stock. Veuillez ajuster votre panier.')
                } else if (errorMessage.includes('Variant non trouvé')) {
                    throw new Error('Certains articles ne sont plus disponibles dans la taille ou la couleur sélectionnée. Veuillez ajuster votre panier.')
                } else if (errorMessage.includes('Produit non trouvé')) {
                    throw new Error('Certains articles ne sont plus disponibles. Veuillez ajuster votre panier.')
                }

                throw new Error(errorMessage)
            }

            // Sauvegarder les informations de la dernière commande
            localStorage.setItem('lastOrder', JSON.stringify({
                orderNumber: responseData.order_number || responseData.id,
                total: total,
                items: items.length
            }))
            
            clearCart()
            toast({
                title: "Commande réussie !",
                description: `Commande n°${responseData.order_number || responseData.id} créée avec succès.`,
            })
            
            // Redirection avec un délai pour laisser le temps au toast de s'afficher
            setTimeout(() => {
                window.location.href = '/success'
            }, 1000)
        } catch (error) {
            console.error('Erreur lors du checkout:', error)
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue lors du paiement.",
                variant: "destructive"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (items.length === 0) {
        return null
    }

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Finalisation de la commande</h1>

                {TEST_MODE && (
                    <Alert className="mb-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Mode Test</AlertTitle>
                        <AlertDescription>
                            Le paiement est en mode test. Aucune transaction réelle ne sera effectuée.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="shipping" disabled={isProcessing}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Livraison
                                </TabsTrigger>
                                <TabsTrigger value="payment" disabled={!shippingData || isProcessing}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Paiement
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="shipping">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations de livraison</CardTitle>
                                        <CardDescription>
                                            Remplissez vos informations de livraison
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit(onSubmitShipping)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">Prénom</Label>
                                                    <Input
                                                        id="firstName"
                                                        {...register('firstName')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.firstName && (
                                                        <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Nom</Label>
                                                    <Input
                                                        id="lastName"
                                                        {...register('lastName')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.lastName && (
                                                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        {...register('email')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Téléphone</Label>
                                                    <Input
                                                        id="phone"
                                                        {...register('phone')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-red-500 text-sm">{errors.phone.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">Adresse</Label>
                                                <Input
                                                    id="address"
                                                    {...register('address')}
                                                    disabled={isProcessing}
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">Ville</Label>
                                                    <Input
                                                        id="city"
                                                        {...register('city')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.city && (
                                                        <p className="text-red-500 text-sm">{errors.city.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="postalCode">Code postal</Label>
                                                    <Input
                                                        id="postalCode"
                                                        {...register('postalCode')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.postalCode && (
                                                        <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="country">Pays</Label>
                                                    <Input
                                                        id="country"
                                                        {...register('country')}
                                                        disabled={isProcessing}
                                                    />
                                                    {errors.country && (
                                                        <p className="text-red-500 text-sm">{errors.country.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <Button 
                                                type="submit" 
                                                className="w-full"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Validation..." : "Continuer vers le paiement"}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="payment">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations de paiement</CardTitle>
                                        <CardDescription>
                                            {TEST_MODE 
                                                ? "Mode test : Aucune transaction réelle ne sera effectuée"
                                                : "Paiement sécurisé par Stripe"
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {TEST_MODE ? (
                                            <Button 
                                                onClick={handleTestCheckout}
                                                className="w-full"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Traitement..." : "Simuler un paiement réussi"}
                                            </Button>
                                        ) : (
                                            <StripeProvider>
                                                <CheckoutForm shippingData={shippingData} />
                                            </StripeProvider>
                                        )}
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
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-2">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                                        </div>
                                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                    </div>
                                ))}
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Sous-total</span>
                                        <span>{total.toFixed(2)} €</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Livraison</span>
                                        <span>Gratuite</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Total</span>
                                        <span>{total.toFixed(2)} €</span>
                                    </div>
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
                                <p className="text-sm text-muted-foreground">
                                    Vos informations de paiement sont sécurisées. Nous utilisons le cryptage SSL 
                                    pour protéger vos données.
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

