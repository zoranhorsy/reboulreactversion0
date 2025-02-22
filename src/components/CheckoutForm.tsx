"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart, type OrderDetails } from "@/app/contexts/CartContext"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"

interface CheckoutFormProps {
  shippingData: {
    address: string
    email: string
    city: string
    country: string
    postalCode: string
    firstName: string
    lastName: string
    phone: string
  } | null
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  variant: {
    size?: string
    color?: string
  }
}

interface Order {
  id: string
  date: string
  customer: string
  email: string
  total: number
  status: OrderStatus
  items: OrderItem[]
  shippingAddress?: {
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }
}

export function CheckoutForm({ shippingData }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { items: cartItems, total, clearCart, setLastOrder } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  })

  const [shippingAddress, setShippingAddress] = useState({
    street: shippingData?.address || "",
    city: shippingData?.city || "",
    postalCode: shippingData?.postalCode || "",
    country: shippingData?.country || "",
  })

  const [email, setEmail] = useState(shippingData?.email || "")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [name]: value }))
  }

  const createOrder = async (orderDetails: Order): Promise<Order> => {
    try {
      console.log("CheckoutForm - Sending order to API:", JSON.stringify(orderDetails, null, 2))
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      })

      const data = await response.json()
      console.log("CheckoutForm - API response:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("CheckoutForm - API error response:", data)
        throw new Error(data.error || "Erreur lors de la création de la commande")
      }

      console.log("CheckoutForm - Order created successfully:", data)
      return data
    } catch (error) {
      console.error("CheckoutForm - Error creating order:", error)
      throw error
    }
  }

  const processCheckout = async (isTest: boolean) => {
    setIsProcessing(true)
    setError(null)
    console.log("CheckoutForm - Processing checkout...", { isTest, cartItems })

    try {
      if (cartItems.length === 0) {
        throw new Error("Votre panier est vide")
      }

      if (!isTest) {
        const cardValidationErrors = validateCardInfo(cardInfo.cardNumber, cardInfo.expiry, cardInfo.cvc)
        if (cardValidationErrors.length > 0) {
          throw new Error(cardValidationErrors.join(", "))
        }

        if (!validateEmail(email)) {
          throw new Error("Adresse e-mail invalide")
        }
      }

      const orderDetails: Order = {
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date().toISOString(),
        customer: shippingData ? `${shippingData.firstName} ${shippingData.lastName}` : "John Doe",
        email: email || "test@example.com",
        total: total,
        status: "pending",
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant: {
            size: item.variant?.size || "Default",
            color: item.variant?.color || "Default",
          },
        })),
        shippingAddress: {
          address: shippingAddress.street || "Adresse de test",
          city: shippingAddress.city || "Ville de test",
          postalCode: shippingAddress.postalCode || "12345",
          country: shippingAddress.country || "Pays de test",
        },
      }

      console.log("CheckoutForm - Order details before API call:", JSON.stringify(orderDetails, null, 2))
      const createdOrder = await createOrder(orderDetails)
      console.log("CheckoutForm - Created order:", JSON.stringify(createdOrder, null, 2))

      // Adapter l'ordre créé au format OrderDetails
      const orderForContext: OrderDetails = {
        id: createdOrder.id,
        date: createdOrder.date,
        customer: {
          name: createdOrder.customer,
          email: createdOrder.email,
        },
        total: createdOrder.total,
        status: createdOrder.status,
        items: cartItems, // Utiliser directement les items du panier qui ont déjà le bon format
      }

      setLastOrder(orderForContext)

      console.log("CheckoutForm - Checkout successful, redirecting to confirmation page...")

      toast({
        title: "Commande traitée",
        description: "Votre commande a été traitée avec succès.",
      })

      clearCart()

      setTimeout(() => {
        router.push("/confirmation-commande")
      }, 100)
    } catch (error) {
      console.error("CheckoutForm - Checkout error:", error)
      setError(error instanceof Error ? error.message : "Une erreur inattendue s&apos;est produite")
      toast({
        title: "Erreur de commande",
        description: error instanceof Error ? error.message : "Une erreur inattendue s&apos;est produite",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const validateCardInfo = (cardNumber: string, expiry: string, cvc: string): string[] => {
    const errors: string[] = []

    if (!/^\d{16}$/.test(cardNumber)) {
      errors.push("Numéro de carte invalide")
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.push("Date d'expiration invalide")
    }

    if (!/^\d{3}$/.test(cvc)) {
      errors.push("CVC invalide")
    }

    return errors
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    processCheckout(false)
  }

  const handleTestCheckout = () => {
    processCheckout(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="street">Adresse</Label>
        <Input
          id="street"
          name="street"
          type="text"
          required
          placeholder="123 Rue de la Paix"
          value={shippingAddress.street}
          onChange={handleAddressChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            name="city"
            type="text"
            required
            placeholder="Paris"
            value={shippingAddress.city}
            onChange={handleAddressChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code Postal</Label>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            required
            placeholder="75000"
            value={shippingAddress.postalCode}
            onChange={handleAddressChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Pays</Label>
        <Input
          id="country"
          name="country"
          type="text"
          required
          placeholder="France"
          value={shippingAddress.country}
          onChange={handleAddressChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Numéro de carte</Label>
        <Input
          id="cardNumber"
          name="cardNumber"
          type="text"
          required
          placeholder="1234 5678 9012 3456"
          value={cardInfo.cardNumber}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Date d&apos;expiration</Label>
          <Input
            id="expiry"
            name="expiry"
            type="text"
            required
            placeholder="MM/AA"
            value={cardInfo.expiry}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            name="cvc"
            type="text"
            required
            placeholder="123"
            value={cardInfo.cvc}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur de paiement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          "Payer"
        )}
      </Button>

      <Button
        type="button"
        onClick={handleTestCheckout}
        disabled={isProcessing}
        variant="secondary"
        className="w-full mt-2"
      >
        Test Checkout (Sans remplir les champs)
      </Button>

      <p className="mt-2 text-xs text-gray-500 text-center">
        En cliquant sur &quot;Payer&quot;, vous acceptez nos conditions générales de vente.
      </p>
    </form>
  )
}

