import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
            <Image
                src={image}
                alt={name}
                width={80}
                height={80}
                className="rounded-md mr-4 w-20 h-20 object-cover mb-2 sm:mb-0"
            />
            <div className="flex-grow mb-2 sm:mb-0">
                <h3 className="font-semibold text-sm sm:text-base">{name}</h3>
                <p className="text-gray-600 text-sm">{price.toFixed(2)} €</p>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(quantity - 1)}
                        disabled={quantity === 1}
                        className="h-8 w-8"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 text-sm">{quantity}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(quantity + 1)}
                        className="h-8 w-8"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8 ml-2"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

