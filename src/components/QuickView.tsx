import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from '@/components/cart/AddToCartButton'

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
}

type QuickViewProps = {
    product: Product
}

export function QuickView({ product }: QuickViewProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Vue rapide</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <div className="grid gap-4">
                    <div className="relative aspect-square">
                        <Image
                            src={product.image}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <p className="mt-2 font-bold">{product.price} €</p>
                        <p className="mt-2 text-sm">{product.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                                <span key={tag} className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
                            ))}
                        </div>
                    </div>
                    <AddToCartButton
                        productId={String(product.id)}
                        name={product.name}
                        price={product.price}
                        image={Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                            ? product.images[0]
                            : "/placeholder.svg"}
                        disabled={!product.stock || product.stock <= 0}
                        stock={product.stock}
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

