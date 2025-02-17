"use client"

import { useState, useCallback, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/app/contexts/CartContext"
import { CartItem } from "./CartItem"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface CartSheetProps {
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function CartSheet({ children, isOpen, onOpenChange }: CartSheetProps) {
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart()
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState("")
  const { toast } = useToast()

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingCost = subtotal > 100 ? 0 : 5.99
  const finalTotal = subtotal - discount + shippingCost

  const applyPromoCode = useCallback(() => {
    if (promoCode.toLowerCase() === "reboul10") {
      const newDiscount = subtotal * 0.1
      setDiscount(newDiscount)
      toast({
        title: "Code promo appliqué",
        description: `Vous avez économisé ${newDiscount.toFixed(2)} €`,
      })
    } else {
      toast({
        title: "Code promo invalide",
        description: "Le code promo entré n'est pas valide.",
        variant: "destructive",
      })
    }
    setPromoCode("")
  }, [promoCode, subtotal, toast])

  useEffect(() => {
    if (cartItems.length === 0) {
      setDiscount(0)
    }
  }, [cartItems])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Votre panier</SheetTitle>
        </SheetHeader>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-center mb-4">Votre panier est vide</p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/catalogue">Continuer mes achats</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-auto space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  _id={Number(item.id)}
                  {...item}
                  onRemove={() => removeItem(item.id)}
                  onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                />
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison:</span>
                  <span>{shippingCost.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction:</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total:</span>
                  <span>{finalTotal.toFixed(2)} €</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    aria-label="Code promo"
                  />
                  <Button onClick={applyPromoCode}>Appliquer</Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button className="w-full" asChild onClick={() => onOpenChange(false)}>
                  <Link href="/checkout">Passer à la caisse</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearCart()
                    onOpenChange(false)
                  }}
                >
                  Vider le panier
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

