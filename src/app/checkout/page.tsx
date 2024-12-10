'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, ShoppingCartIcon as Paypal, Building, Apple, Bitcoin } from 'lucide-react'

type ShippingInfo = {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
}

type PaymentMethod = 'credit-card' | 'paypal' | 'bank-transfer' | 'apple-pay' | 'bitcoin'

export default function Checkout() {
    const router = useRouter()
    const { cartItems, clearCart } = useCart()
    const { toast } = useToast()
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    })
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card')
    const [errors, setErrors] = useState<Partial<ShippingInfo>>({})
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setShippingInfo(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const applyPromoCode = () => {
        // Ceci est une simulation. Dans un cas réel, vous feriez un appel à une API pour valider le code.
        if (promoCode.toLowerCase() === 'promo10') {
            setDiscount(totalPrice * 0.1);
            toast({
                title: "Code promo appliqué",
                description: "Vous avez obtenu une réduction de 10%",
            });
        } else {
            setDiscount(0);
            toast({
                title: "Code promo invalide",
                description: "Le code promo entré n'est pas valide",
                variant: "destructive",
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<ShippingInfo> = {}
        let isValid = true

        Object.entries(shippingInfo).forEach(([key, value]) => {
            if (!value.trim()) {
                newErrors[key as keyof ShippingInfo] = 'Ce champ est requis'
                isValid = false
            }
        })

        if (shippingInfo.postalCode && !/^\d{5}$/.test(shippingInfo.postalCode)) {
            newErrors.postalCode = 'Code postal invalide'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        // Simulation du processus de paiement
        setTimeout(() => {
            console.log('Informations de livraison:', shippingInfo)
            console.log('Méthode de paiement:', paymentMethod)
            console.log('Articles commandés:', cartItems)
            toast({
                title: "Commande passée avec succès",
                description: "Merci pour votre achat !",
            })
            clearCart()
            router.push('/confirmation')
        }, 2000)
    }

    const estimateDeliveryTime = (postalCode: string): string => {
        //  Implementation to estimate delivery time based on postal code.  Replace with actual logic.
        // This is a placeholder.  Replace with your actual delivery time estimation logic.
        const estimatedDays = Math.floor(Math.random() * 5) + 1; // Simulate 1-5 days
        return `${estimatedDays} jours ouvrables`;
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Finalisation de la commande</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Informations de livraison</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {Object.entries(shippingInfo).map(([key, value]) => (
                            <div key={key}>
                                <Label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                                    {key === 'fullName' ? 'Nom complet' :
                                        key === 'address' ? 'Adresse' :
                                            key === 'city' ? 'Ville' :
                                                key === 'postalCode' ? 'Code postal' :
                                                    'Pays'}
                                </Label>
                                <Input
                                    id={key}
                                    name={key}
                                    value={value}
                                    onChange={handleInputChange}
                                    className={errors[key as keyof ShippingInfo] ? 'border-red-500' : ''}
                                />
                                {errors[key as keyof ShippingInfo] && (
                                    <p className="text-red-500 text-sm mt-1">{errors[key as keyof ShippingInfo]}</p>
                                )}
                            </div>
                        ))}

                        <Separator className="my-6" />

                        <h2 className="text-xl font-semibold mb-4">Méthode de paiement</h2>
                        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="space-y-4">
                            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="credit-card" id="credit-card" className="border-black" />
                                <Label htmlFor="credit-card" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Carte de crédit</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="paypal" id="paypal" className="border-black" />
                                <Label htmlFor="paypal" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Paypal className="h-5 w-5" />
                                    <span>PayPal</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="bank-transfer" id="bank-transfer" className="border-black" />
                                <Label htmlFor="bank-transfer" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Building className="h-5 w-5" />
                                    <span>Virement bancaire</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="apple-pay" id="apple-pay" className="border-black" />
                                <Label htmlFor="apple-pay" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Apple className="h-5 w-5" />
                                    <span>Apple Pay</span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="bitcoin" id="bitcoin" className="border-black" />
                                <Label htmlFor="bitcoin" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Bitcoin className="h-5 w-5" />
                                    <span>Bitcoin</span>
                                </Label>
                            </div>
                        </RadioGroup>

                        <Button type="submit" className="w-full mt-8">Passer la commande</Button>
                    </form>
                </div>
                <div>
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">Code promotionnel</h2>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Entrez votre code promo"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <Button onClick={applyPromoCode} type="button">Appliquer</Button>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        {cartItems.map((item) => (
                            <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-center border-b py-2">
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Taille: {item.size}, Couleur: {item.color}</p>
                                    <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
                            </div>
                        ))}
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center font-semibold">
                                <span>Sous-total</span>
                                <span>{totalPrice.toFixed(2)} €</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-500 mt-2">
                                    <span>Réduction</span>
                                    <span>-{discount.toFixed(2)} €</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                <span>Frais de livraison</span>
                                <span>Gratuit</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                <span>Délai de livraison estimé</span>
                                <span>{shippingInfo.postalCode ? estimateDeliveryTime(shippingInfo.postalCode) : "À déterminer"}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg mt-4 pt-4 border-t">
                                <span>Total</span>
                                <span>{(totalPrice - discount).toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

