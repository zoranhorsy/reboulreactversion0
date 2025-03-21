import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductVariantModal } from '@/components/ProductVariantModal'
import { useCart } from '@/app/contexts/CartContext'
import { toast } from '@/components/ui/use-toast'

type Product = {
    id: number
    name: string
    brand: string
    category: string
    price: number
    image: string
    description: string
    tags: string[]
    stock: number
    images?: string[]
    variants?: Array<{
        size: string
        color: string
        stock: number
    }>
}

interface QuickViewProps {
    product: Product
}

export function QuickView({ product }: QuickViewProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { addItem } = useCart()

    const handleAddToCart = (size: string, color: string, quantity: number) => {
        try {
            // Vérifier que le variant existe et a du stock
            const variant = product.variants?.find((v) => v.size === size && v.color === color)
            if (!variant) {
                throw new Error(`Cette combinaison de taille (${size}) et couleur (${color}) n'est pas disponible.`)
            }

            if (variant.stock < quantity) {
                throw new Error(`Stock insuffisant. Seulement ${variant.stock} unité(s) disponible(s).`)
            }

            const cartItemId = `${product.id}-${size}-${color}`
            addItem({
                id: cartItemId,
                name: `${product.name} (${size}, ${color})`,
                price: product.price,
                quantity: quantity,
                image: Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                    ? product.images[0]
                    : "/placeholder.svg",
                variant: {
                    size,
                    color,
                    colorLabel: color,
                    stock: variant.stock
                }
            })

            toast({
                title: "Produit ajouté au panier",
                description: `${product.name} (${size}, ${color}) × ${quantity} a été ajouté à votre panier.`,
            })

            setIsOpen(false)
        } catch (error) {
            console.error("Error adding to cart:", error)
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible d&apos;ajouter le produit au panier. Veuillez réessayer.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-none w-12 h-12">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/livraison-kt21gvf0xi94NZI1mJAbRMOxk8Xw8s.png"
                        alt="Livraison"
                        width={24}
                        height={24}
                    />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-span-4">
                            <Image
                                src={Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                                    ? product.images[0]
                                    : "/placeholder.svg"}
                                alt={product.name}
                                width={400}
                                height={400}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        <p className="text-sm text-gray-500">{product.description}</p>
                        <p className="text-lg font-bold">{product.price} €</p>
                    </div>
                    <ProductVariantModal
                        product={{
                            ...product,
                            id: product.id.toString(),
                            category_id: 0,
                            brand_id: 0,
                            image_url: product.image,
                            image: product.image,
                            images: product.images || [product.image],
                            variants: product.variants || [],
                            details: [],
                            reviews: [],
                            questions: [],
                            faqs: [],
                            size_chart: [],
                            store_type: "adult",
                            featured: false,
                            created_at: new Date().toISOString(),
                        }}
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        onAddToCart={handleAddToCart}
                    />
                </div>
                <button
                    className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fermer</span>
                </button>
            </DialogContent>
        </Dialog>
    )
}

