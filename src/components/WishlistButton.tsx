'use client'

import { Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useToast } from "@/components/ui/use-toast"

type WishlistButtonProps = {
    product: {
        id: number
        name: string
        price: number
        image: string
    }
}

export function WishlistButton({ product }: WishlistButtonProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const { toast } = useToast()

    const toggleWishlist = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id)
            toast({
                title: "Retiré de la liste de souhaits",
                description: `${product.name} a été retiré de votre liste de souhaits.`,
            })
        } else {
            addToWishlist(product)
            toast({
                title: "Ajouté à la liste de souhaits",
                description: `${product.name} a été ajouté à votre liste de souhaits.`,
            })
        }
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleWishlist}
            aria-label={isInWishlist(product.id) ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
        >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
    )
}

