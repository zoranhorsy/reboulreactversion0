"use client"

import { useState, useCallback, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/app/contexts/CartContext"
import { CartItem } from "./CartItem"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ShoppingCart, X, Minus, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'

interface CartSheetProps {
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function CartSheet({ children, isOpen, onOpenChange }: CartSheetProps) {
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart()
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.99 // Fixed shipping cost
  const discount = 0 // To be calculated based on promo code
  const total = subtotal + shipping - discount

  // Handle apply promo code
  const handleApplyPromoCode = useCallback(() => {
    if (!promoCode) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code promo",
        variant: "destructive",
      })
      return
    }

    setIsApplyingPromo(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsApplyingPromo(false)
      
      // Mock promo code validation
      if (promoCode.toLowerCase() === "welcome10") {
        toast({
          title: "Code promo appliqué",
          description: "10% de réduction sur votre commande",
        })
      } else {
        toast({
          title: "Code promo invalide",
          description: "Le code promo saisi n'est pas valide",
          variant: "destructive",
        })
      }
    }, 1000)
  }, [promoCode, toast])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <SheetHeader className="text-left mb-0">
            <SheetTitle className="text-xl">Votre panier</SheetTitle>
          </SheetHeader>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center mb-6">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">Votre panier est vide</p>
              <p className="text-sm text-muted-foreground mb-6">Ajoutez des articles à votre panier pour les retrouver ici</p>
            </div>
            <Button asChild onClick={() => onOpenChange(false)} className="w-full">
              <Link href="/catalogue">Continuer mes achats</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-auto px-4">
              <div className="py-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b">
                    {/* Product image */}
                    <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0 bg-accent/10">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        className="object-cover"
                        fill
                        sizes="80px"
                      />
                    </div>
                    
                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        {item.variant.size && (
                          <p>Taille: <span className="font-medium text-foreground">{item.variant.size}</span></p>
                        )}
                        {item.variant.color && (
                          <p>Couleur: <span className="font-medium text-foreground">{item.variant.colorLabel || item.variant.color}</span></p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cart Summary and Actions */}
            <div className="border-t p-4 space-y-4 mt-auto">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction</span>
                    <span>
                      -{new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(discount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(total)}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo}
                    className="flex-shrink-0"
                  >
                    {isApplyingPromo ? "..." : "Appliquer"}
                  </Button>
                </div>
                
                <Button className="w-full mb-2" asChild>
                  <Link href="/checkout">Passer à la caisse</Link>
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Continuer
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      clearCart()
                      toast({
                        title: "Panier vidé",
                        description: "Tous les articles ont été supprimés de votre panier",
                      })
                    }}
                  >
                    Vider le panier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

