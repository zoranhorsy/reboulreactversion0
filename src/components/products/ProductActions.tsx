import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ProductActionsProps {
  onAddToCart: (color: string, size: string, quantity: number) => void
  selectedColor: string
  selectedSize: string
}

export function ProductActions({ onAddToCart, selectedColor, selectedSize }: ProductActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onAddToCart(selectedColor, selectedSize, 1)}
        className="flex-grow bg-black text-white hover:bg-black/90 rounded-none h-12"
      >
        AJOUTER AU PANIER
      </Button>
      <Button variant="outline" size="icon" className="rounded-none w-12 h-12">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favoris-rFbzZ8XXTdAshbnnWySWyYGmzz830d.png"
          alt="Favoris"
          width={24}
          height={24}
        />
      </Button>
      <Button variant="outline" size="icon" className="rounded-none w-12 h-12">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/livraison-kt21gvf0xi94NZI1mJAbRMOxk8Xw8s.png"
          alt="Livraison"
          width={24}
          height={24}
        />
      </Button>
    </div>
  )
}

