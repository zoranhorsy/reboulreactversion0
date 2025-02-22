'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useFavorites } from '@/app/contexts/FavoritesContext'
import { type Product } from '@/lib/api'

interface WishlistButtonProps {
  product: Product
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function WishlistButton({ product, variant = 'ghost', size = 'icon' }: WishlistButtonProps) {
  const { toast } = useToast()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isProductFavorite = isFavorite(product.id)

  const handleClick = () => {
    if (isProductFavorite) {
      removeFromFavorites(product.id)
      toast({
        title: 'Produit retiré des favoris',
        description: `${product.name} a été retiré de vos favoris.`
      })
    } else {
      addToFavorites(product)
      toast({
        title: 'Produit ajouté aux favoris',
        description: `${product.name} a été ajouté à vos favoris.`
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={isProductFavorite ? 'text-red-500 hover:text-red-600' : ''}
    >
      <Heart className={`h-5 w-5 ${isProductFavorite ? 'fill-current' : ''}`} />
    </Button>
  )
}

