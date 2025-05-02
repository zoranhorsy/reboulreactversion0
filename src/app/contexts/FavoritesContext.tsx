'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'
import { getFavorites, addToFavorites as addFavorite, removeFromFavorites as removeFavorite } from '@/lib/api'
import type { Product } from '@/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'

interface FavoritesContextType {
  favorites: Product[]
  addToFavorites: (productId: string, storeType?: string) => Promise<void>
  removeFromFavorites: (productId: string, storeType?: string) => Promise<void>
  isFavorite: (productId: string, storeType?: string) => boolean
  loading: boolean
  error: string | null
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchFavorites = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      console.log('FavoritesContext - Récupération des favoris');
      const data = await getFavorites()
      console.log('FavoritesContext - Favoris récupérés:', data);
      setFavorites(data)
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des favoris')
      console.error('FavoritesContext - Erreur lors du chargement des favoris:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const addToFavorites = async (productId: string, storeType: string = 'main') => {
    if (!user) {
      setError('Vous devez être connecté pour ajouter aux favoris')
      return
    }

    try {
      console.log('FavoritesContext - Ajout aux favoris:', { productId, storeType });
      await addFavorite(productId, storeType)
      console.log('FavoritesContext - Produit ajouté aux favoris');
      
      // Créer un objet Product temporaire avec les champs obligatoires
      const tempProduct: Partial<Product> = { 
        id: productId,
        store_type: storeType === 'corner' ? 'cpcompany' : 'adult',
        name: '',
        description: '',
        price: 0,
        category_id: 0,
        category: '',
        brand_id: 0,
        brand: '',
        image_url: '',
        images: [],
        image: '',
        variants: [],
        tags: [],
        details: [],
        reviews: [],
        questions: [],
        faqs: [],
        size_chart: [],
        featured: false,
        created_at: new Date().toISOString()
      }
      
      setFavorites(prev => [...prev, tempProduct as Product])
      setError(null)
    } catch (err) {
      setError('Erreur lors de l\'ajout aux favoris')
      console.error('FavoritesContext - Erreur lors de l\'ajout aux favoris:', err)
    }
  }

  const removeFromFavorites = async (productId: string, storeType: string = 'main') => {
    if (!user) {
      setError('Vous devez être connecté pour retirer des favoris')
      return
    }

    try {
      console.log('FavoritesContext - Suppression des favoris:', { productId, storeType });
      await removeFavorite(productId, storeType)
      console.log('FavoritesContext - Produit retiré des favoris');
      setFavorites(prev => prev.filter(fav => fav.id !== productId))
      setError(null)
    } catch (err) {
      setError('Erreur lors de la suppression des favoris')
      console.error('FavoritesContext - Erreur lors de la suppression des favoris:', err)
    }
  }

  const isFavorite = (productId: string, storeType: string = 'main'): boolean => {
    return favorites.some(fav => fav.id === productId)
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      loading,
      error
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