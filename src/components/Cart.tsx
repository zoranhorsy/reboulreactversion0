'use client'

import { ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from '@/app/contexts/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from '@/components/ui/use-toast'
import { Separator } from "@/components/ui/separator"

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, applyPromoCode, promoCode, discount } = useCart()
    const [promoInput, setPromoInput] = useState('')

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shippingCost = subtotal > 100 ? 0 : 5.99
    const totalSavings = discount + (subtotal > 100 ? 5.99 : 0)
    const total = subtotal - discount + shippingCost

    const handleApplyPromoCode = () => {
        applyPromoCode(promoInput)
        setPromoInput('')
    }

    const handleClearCart = () => {
        clearCart()
        toast({
            title: "Panier vidé",
            description: "Tous les articles ont été retirés de votre panier.",
        })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                <SheetHeader className="flex-shrink-0 border-b pb-4 mb-4">
                    <SheetTitle className="text-2xl font-semibold text-black">Panier</SheetTitle>
                    <SheetDescription className="text-base text-gray-600">
                        {cartItems.length === 0 ? "Votre panier est vide." : `${cartItems.length} article(s)`}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-grow overflow-auto space-y-4 pr-2">
                    {cartItems.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <h3 className="font-medium text-black">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.price} € - Taille: {item.size}, Couleur: {item.color}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 rounded-full p-0"
                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                >
                                    -
                                </Button>
                                <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 rounded-full p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {cartItems.length > 0 && (
                    <div className="flex-shrink-0 border-t pt-4 mt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="Code promo"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                            />
                            <Button onClick={handleApplyPromoCode}>Appliquer</Button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span>Sous-total</span>
                                <span>{subtotal.toFixed(2)} €</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span>Réduction</span>
                                    <span>-{discount.toFixed(2)} €</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span>Frais de livraison</span>
                                <span>{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} €`}</span>
                            </div>
                            {subtotal < 100 && (
                                <div className="text-sm text-gray-600">
                                    Plus que {(100 - subtotal).toFixed(2)} € pour la livraison gratuite !
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between items-center font-semibold text-lg">
                                <span>Total</span>
                                <span>{total.toFixed(2)} €</span>
                            </div>
                            {totalSavings > 0 && (
                                <div className="text-sm text-green-600">
                                    Vous économisez {totalSavings.toFixed(2)} € !
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1" onClick={handleClearCart}>
                                Vider le panier
                            </Button>
                            <Link href="/checkout" className="flex-1">
                                <Button className="w-full bg-black text-white hover:bg-gray-800">
                                    Commander
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

