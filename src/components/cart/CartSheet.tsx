"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/app/contexts/CartContext"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ShoppingCart, X, Minus, Plus, GripVertical } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { usePromo } from "@/app/contexts/PromoContext"
import Draggable from 'react-draggable'
import '@/styles/cart.css'

interface CartSheetProps {
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function CartSheet({ children, isOpen, onOpenChange }: CartSheetProps) {
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart()
  const { appliedPromo, applyPromoCode, removePromoCode } = usePromo()
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth <= 768) {
        const dockHeight = 80; // Hauteur approximative du dock
        const cartHeight = 600; // Hauteur du panier
        const margin = 20; // Marge par rapport au dock
        setPosition({
          x: 20,
          y: window.innerHeight - dockHeight - cartHeight - margin
        });
      } else {
        // Sur desktop, positionner au centre
        setPosition({
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 - 300
        });
      }
      setWindowWidth(window.innerWidth);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.99 // Fixed shipping cost
  const discount = appliedPromo?.discountAmount || 0
  const total = subtotal + shipping - discount

  // Handle apply promo code
  const handleApplyPromoCode = useCallback(async () => {
    if (!promoCode) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code promo",
        variant: "destructive",
      })
      return
    }

    setIsApplyingPromo(true)
    
    try {
      const success = await applyPromoCode(promoCode, subtotal)
      
      if (success) {
        toast({
          title: "Code promo appliqué",
          description: appliedPromo?.description || "Réduction appliquée à votre commande",
        })
      } else {
        toast({
          title: "Code promo invalide",
          description: "Le code promo saisi n'est pas valide ou ne peut pas être appliqué",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'application du code promo",
        variant: "destructive",
      })
    } finally {
      setIsApplyingPromo(false)
    }
  }, [promoCode, subtotal, applyPromoCode, appliedPromo, toast])

  const content = (
    <Card className="border border-white/5 bg-background/50 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="px-3 py-2 sm:px-4 sm:py-3 border-b border-border/20 flex-shrink-0">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="drag-handle flex items-center p-1 rounded hover:bg-accent/10 cursor-move">
              <GripVertical className="h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <span className="select-none pointer-events-none">Votre panier</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-60 hover:opacity-100" onClick={() => onOpenChange(false)}>
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
    
      {cartItems.length === 0 ? (
        <CardContent className="p-4 sm:p-6 text-center">
          <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4 opacity-15" />
          <p className="text-sm sm:text-base font-medium mb-1">Votre panier est vide</p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Ajoutez des articles pour les retrouver ici</p>
          <Button asChild onClick={() => onOpenChange(false)} className="w-full text-xs sm:text-sm" size="sm">
            <Link href="/catalogue">Continuer mes achats</Link>
          </Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="cart-items flex-1 min-h-0 overflow-auto px-3 py-2 sm:px-4 sm:py-3">
            <div className="space-y-2 sm:space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-border/20 last:border-b-0">
                  {/* Product image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-md overflow-hidden flex-shrink-0 bg-accent/5">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      className="object-cover"
                      fill
                      sizes="(max-width: 640px) 56px, 64px"
                    />
                  </div>
                  
                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-xs sm:text-sm truncate">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-foreground ml-1 sm:ml-2 flex-shrink-0 opacity-60 hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                    
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 space-y-0">
                      {item.variant.size && (
                        <p>Taille: <span className="font-medium text-foreground/80">{item.variant.size}</span></p>
                      )}
                      {item.variant.color && (
                        <p>Couleur: <span className="font-medium text-foreground/80">{item.variant.colorLabel || item.variant.color}</span></p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-4.5 w-4.5 sm:h-5 sm:w-5 bg-background/50"
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        >
                          <Minus className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        </Button>
                        <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-4.5 w-4.5 sm:h-5 sm:w-5 bg-background/50"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        </Button>
                      </div>
                      <div className="font-medium text-[10px] sm:text-sm">
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
          </CardContent>
          
          {/* Cart Summary and Actions */}
          <CardFooter className="border-t border-border/20 p-3 sm:p-4 space-y-3 sm:space-y-4 flex flex-col flex-shrink-0">
            <div className="space-y-1.5 sm:space-y-2 w-full">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600/80">
                  <span>Réduction</span>
                  <span>
                    -{new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(discount)}
                  </span>
                </div>
              )}
              <Separator className="bg-border/20" />
              <div className="flex justify-between text-sm sm:text-base font-medium">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(total)}
                </span>
              </div>
            </div>
            
            <div className="pt-1 sm:pt-2 w-full">
              {!appliedPromo ? (
                <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <Input
                    placeholder="Code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 h-7 sm:h-8 text-xs bg-background/50"
                  />
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={isApplyingPromo}
                    className="flex-shrink-0 h-7 sm:h-8 text-[10px] sm:text-xs bg-primary/80 hover:bg-primary/90"
                    size="sm"
                  >
                    {isApplyingPromo ? "..." : "Appliquer"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-2 sm:mb-3 p-2 bg-primary/5 rounded-md">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium">{appliedPromo.code}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{appliedPromo.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    onClick={() => {
                      removePromoCode()
                      setPromoCode("")
                      toast({
                        title: "Code promo retiré",
                        description: "Le code promo a été retiré de votre commande",
                      })
                    }}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              )}
              
              <Button className="w-full mb-2 text-xs sm:text-sm h-7 sm:h-9 bg-primary/80 hover:bg-primary/90" asChild>
                <Link href="/checkout" onClick={() => onOpenChange(false)}>Passer à la caisse</Link>
              </Button>
              
              <div className="flex gap-1.5 sm:gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8 bg-background/50"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Continuer
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8 bg-background/50"
                  size="sm"
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
          </CardFooter>
        </>
      )}
    </Card>
  )

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-0 rounded-lg",
          windowWidth >= 1024 
            ? "fixed inset-0 w-full h-full max-w-none bg-transparent border-none" 
            : "w-[85vw] max-w-[380px]"
        )}
        align={windowWidth >= 1024 ? undefined : "center"}
        side={windowWidth >= 1024 ? undefined : "top"} 
        sideOffset={windowWidth >= 1024 ? 0 : 80}
        style={{ 
          zIndex: 50,
          position: windowWidth >= 1024 ? undefined : 'fixed',
          bottom: windowWidth >= 1024 ? undefined : '80px',
          left: windowWidth >= 1024 ? undefined : '50%',
          transform: windowWidth >= 1024 ? undefined : 'translateX(-50%)'
        }}
      >
        {windowWidth >= 1024 ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Draggable
              handle=".drag-handle"
              position={position}
              onDrag={(e, data) => {
                const maxX = window.innerWidth - 380
                const maxY = window.innerHeight - 600
                setPosition({
                  x: Math.max(0, Math.min(data.x, maxX)),
                  y: Math.max(0, Math.min(data.y, maxY))
                })
              }}
              bounds="parent"
              defaultClassName="draggable-cart"
              defaultClassNameDragging="dragging"
            >
              <div style={{ width: '380px', maxHeight: '80vh', minHeight: 'min-content' }}>
                {content}
              </div>
            </Draggable>
          </div>
        ) : (
          content
        )}
      </PopoverContent>
    </Popover>
  )
}


