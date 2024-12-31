import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

interface CartItemProps {
    id: number
    name: string
    price: number
    quantity: number
    image: string
    onRemove: () => void
    onUpdateQuantity: (quantity: number) => void
}

export function CartItem({ id, name, price, quantity, image, onRemove, onUpdateQuantity }: CartItemProps) {
    const handleDecreaseQuantity = useCallback(() => {
        if (quantity > 1) {
            onUpdateQuantity(quantity - 1)
        }
    }, [quantity, onUpdateQuantity])

    const handleIncreaseQuantity = useCallback(() => {
        onUpdateQuantity(quantity + 1)
    }, [quantity, onUpdateQuantity])

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
            <Image
                src={image}
                alt={name}
                width={80}
                height={80}
                className="rounded-md mr-4 w-20 h-20 object-cover mb-2 sm:mb-0"
                title={name}
            />
            <div className="flex-grow mb-2 sm:mb-0">
                <h3 className="font-semibold text-sm sm:text-base">{name}</h3>
                <p className="text-gray-600 text-sm">{typeof price === 'number' ? `${price.toFixed(2)} €` : 'Prix non disponible'}</p>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDecreaseQuantity}
                        disabled={quantity === 1}
                        className="h-8 w-8"
                        aria-label="Diminuer la quantité"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 text-sm">{quantity}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleIncreaseQuantity}
                        className="h-8 w-8"
                        aria-label="Augmenter la quantité"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8 ml-2"
                    aria-label="Supprimer l'article"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

