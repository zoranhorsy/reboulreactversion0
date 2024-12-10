'use client'

import { Button } from "@/components/ui/button"
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from "@/components/ui/use-toast"

type Product = {
    id: number
    name: string
    price: number
    image: string
}

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart()
    const { toast } = useToast()

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
        })
        toast({
            title: "Produit ajouté",
            description: `${product.name} a été ajouté à votre panier.`,
        })
    }

    return (
        <Button onClick={handleAddToCart} className="bg-primary text-white hover:bg-primary/90">
            Ajouter au panier
        </Button>
    )
}

