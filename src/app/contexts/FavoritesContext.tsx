'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getFavorites, addToFavorites as addFavorite, removeFromFavorites as removeFavorite } from '@/lib/api'
import type { Product } from '@/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (product: Product) => Promise<void>
  removeFromFavorites: (productId: string | number) => Promise<void>
  isFavorite: (productId: string | number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Charger les favoris depuis le backend au montage
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        console.log('Pas d\'utilisateur connecté, pas de chargement des favoris');
        setIsLoading(false)
        return
      }

      try {
        console.log('Chargement des favoris pour l\'utilisateur:', {
          id: user.id,
          email: user.email
        });
        const data = await getFavorites()
        console.log('Favoris chargés:', data);
        setFavorites(data)
      } catch (error: any) {
        console.error('Erreur lors du chargement des favoris:', error)
        console.error('Détails de l\'erreur:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })

        if (error.response?.status === 401) {
          console.log('Erreur d\'authentification, redirection...');
          return
        }

        // Charger depuis le localStorage comme fallback
        console.log('Tentative de chargement depuis le localStorage');
        const savedFavorites = localStorage.getItem('favorites')
        if (savedFavorites) {
          try {
            const parsedFavorites = JSON.parse(savedFavorites)
            console.log('Favoris chargés depuis le localStorage:', parsedFavorites);
            setFavorites(parsedFavorites)
          } catch (error) {
            console.error('Erreur lors du chargement des favoris du localStorage:', error)
          }
        } else {
          console.log('Pas de favoris dans le localStorage');
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  // Sauvegarder les favoris dans le localStorage à chaque modification
  useEffect(() => {
    if (!isLoading) {
      console.log('Sauvegarde des favoris dans le localStorage:', favorites);
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
  }, [favorites, isLoading])

  const addToFavorites = async (product: Product) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour ajouter des favoris.",
        variant: "destructive"
      })
      return
    }

    try {
      // S'assurer que l'ID est un nombre
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id
      if (isNaN(productId)) {
        throw new Error('ID de produit invalide')
      }

      // Vérifier si le produit est déjà dans les favoris
      if (isFavorite(productId)) {
        toast({
          title: "Information",
          description: `${product.name} est déjà dans vos favoris.`
        })
        return
      }

      await addFavorite(productId)
      setFavorites(prev => [...prev, product])
      toast({
        title: "Ajouté aux favoris",
        description: `${product.name} a été ajouté à vos favoris.`
      })
    } catch (error: any) {
      console.error('Erreur détaillée lors de l\'ajout aux favoris:', error)
      // Si l'erreur est que le produit est déjà dans les favoris, ce n'est pas vraiment une erreur
      if (error.response?.data?.message === 'Ce produit est déjà dans vos favoris') {
        // Mettre à jour l'état local si nécessaire
        if (!isFavorite(product.id)) {
          setFavorites(prev => [...prev, product])
        }
        toast({
          title: "Information",
          description: `${product.name} est déjà dans vos favoris.`
        })
      } else if (error.response?.status === 401) {
        toast({
          title: "Erreur d'authentification",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Impossible d'ajouter le produit aux favoris.",
          variant: "destructive"
        })
      }
    }
  }

  const removeFromFavorites = async (productId: string | number) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour gérer vos favoris.",
        variant: "destructive"
      })
      return
    }

    try {
      // S'assurer que l'ID est un nombre
      const numericId = typeof productId === 'string' ? parseInt(productId, 10) : productId
      if (isNaN(numericId)) {
        throw new Error('ID de produit invalide')
      }

      // Vérifier si le produit est dans les favoris
      if (!isFavorite(numericId)) {
        toast({
          title: "Information",
          description: "Ce produit n'est pas dans vos favoris."
        })
        return
      }

      await removeFavorite(numericId)
      const product = favorites.find(fav => {
        const favId = typeof fav.id === 'string' ? parseInt(fav.id, 10) : fav.id
        return favId === numericId
      })
      setFavorites(prev => prev.filter(fav => {
        const favId = typeof fav.id === 'string' ? parseInt(fav.id, 10) : fav.id
        return favId !== numericId
      }))
      
      if (product) {
        toast({
          title: "Retiré des favoris",
          description: `${product.name} a été retiré de vos favoris.`
        })
      }
    } catch (error: any) {
      console.error('Erreur détaillée lors de la suppression des favoris:', error)
      if (error.response?.status === 401) {
        toast({
          title: "Erreur d'authentification",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Impossible de retirer le produit des favoris.",
          variant: "destructive"
        })
      }
    }
  }

  const isFavorite = (productId: string | number) => {
    const numericId = typeof productId === 'string' ? parseInt(productId, 10) : productId
    return favorites.some(fav => {
      const favId = typeof fav.id === 'string' ? parseInt(fav.id, 10) : fav.id
      return favId === numericId
    })
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
} 