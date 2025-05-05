"use client"

import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { getProductById } from "@/lib/api"
import { ProductGallery } from "@/components/ProductGallery"
import { ProductDetails } from "@/components/ProductDetails"
import { SimilarProducts } from "@/components/SimilarProducts"
import { RecentlyViewedProducts } from "@/components/RecentlyViewedProducts"
import { ProductTechnicalSpecs } from "@/components/ProductTechnicalSpecs"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { useCart } from "@/app/contexts/CartContext"
import { useFavorites } from "@/app/contexts/FavoritesContext"
import { toast } from "@/components/ui/use-toast"
import { LoaderComponent } from "@/components/ui/Loader"
import type { CartItem } from "@/lib/types/cart"
import { ReboulPageHeader } from "@/components/reboul/components/ReboulPageHeader"
import { cn } from "@/lib/utils"
import { Heart, Share2 } from "lucide-react"

export const viewport: Viewport = defaultViewport;

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [isWishlist, setIsWishlist] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id)
        if (!data) {
          notFound()
          return
        }
        setProduct(data)
        setIsWishlist(isFavorite(data.id))
        
        // Sélectionner automatiquement la première variante disponible
        if (data.variants && data.variants.length > 0) {
          const firstAvailableVariant = data.variants.find((v: any) => v.stock > 0)
          if (firstAvailableVariant) {
            setSelectedSize(firstAvailableVariant.size)
            setSelectedColor(firstAvailableVariant.color)
          }
        }
      } catch (error) {
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id, isFavorite])

  const handleAddToCart = () => {
    if (!product) return

    try {
      const variant = product.variants?.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      )

      const cartItem: CartItem = {
        id: variant ? `${product.id}-${selectedSize}-${selectedColor}` : product.id,
        name: variant ? `${product.name} (${selectedSize}, ${selectedColor})` : product.name,
        price: product.price,
        quantity,
        image: product.images?.[0] || "/placeholder.svg",
        variant: variant ? {
          size: selectedSize,
          color: selectedColor,
          colorLabel: selectedColor,
          stock: variant.stock
        } : {
          size: '',
          color: '',
          colorLabel: '',
          stock: 0
        }
      }

      addItem(cartItem)
      toast({
        title: "Produit ajouté au panier",
        description: `${cartItem.name} × ${quantity} a été ajouté à votre panier.`
      })
      setQuantity(1)
      openCart()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: `Découvrez ${product?.name} sur Reboul Store`,
        url: window.location.href
      })
    } catch (error) {
      console.error("Erreur lors du partage:", error)
    }
  }

  const toggleWishlist = () => {
    if (!product) return
    
    if (isWishlist) {
      removeFromFavorites(product.id)
      setIsWishlist(false)
      toast({
        title: "Produit retiré des favoris",
        description: `${product.name} a été retiré de vos favoris.`
      })
    } else {
      addToFavorites(product.id, product.is_corner_product || false)
      setIsWishlist(true)
      toast({
        title: "Produit ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`
      })
    }
  }

  if (isLoading) {
    return <LoaderComponent />
  }

  if (!product) {
    return notFound()
  }

  return (
    <ClientPageWrapper>
      <div className="min-h-screen bg-background">
        <ReboulPageHeader 
          title="REBOUL STORE"
          subtitle="Collection exclusive de vêtements premium"
          backLink="/catalogue"
          backText="Retour au catalogue"
          breadcrumbs={[
            { label: "Accueil", href: "/" },
            { label: "Catalogue", href: "/catalogue" },
            { label: product.name, href: `/produit/${product.id}` }
          ]}
          actions={[
            {
              icon: <Heart className={cn(
                "w-5 h-5",
                isWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-100"
              )} />,
              onClick: toggleWishlist,
              label: "Favoris"
            },
            {
              icon: <Share2 className="w-5 h-5 text-zinc-100" />,
              onClick: handleShare,
              label: "Partager"
            }
          ]}
        />

        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            <ProductGallery images={product.images} productName={product.name} />
            
            <div className="sticky top-8">
              <ProductDetails
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
                isWishlist={isWishlist}
                onToggleWishlist={toggleWishlist}
                onShare={handleShare}
              />
            </div>
          </div>

          <div className="mt-16 sm:mt-24 space-y-12 sm:space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 sm:mb-8">Produits similaires</h2>
              <SimilarProducts currentProductId={product.id} />
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 sm:mb-8">Récemment consultés</h2>
              <RecentlyViewedProducts currentProductId={product.id} />
            </section>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  )
}

