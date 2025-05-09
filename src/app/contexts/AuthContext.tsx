"use client"

import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from "@/components/ui/use-toast"

// Définir l'URL de l'API
const API_URL = 'https://reboul-store-api-production.up.railway.app/api'
console.log('[AuthContext] Utilisation de l\'API URL:', API_URL);

// Type pour le router
type RouterInstance = ReturnType<typeof useRouter>

// Interface pour l'utilisateur
interface User {
  id: string
  email: string
  username: string
  isAdmin: boolean
  avatar_url?: string
  phone?: string
}

// Interface pour la réponse d'authentification avec is_admin
interface AuthResponseUser extends Omit<User, 'isAdmin'> {
  is_admin?: boolean;
  isAdmin?: boolean;
}

interface AuthResponse {
  user: AuthResponseUser;
  token: string;
}

// Interface pour la réponse de /auth/me
interface AuthMeResponse {
  id: string
  email: string
  username: string
  is_admin: boolean
  avatar_url?: string
  phone?: string
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: () => void
  isLoading: boolean
  register: (username: string, email: string, password: string) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  checkAuthManually: () => Promise<void>
}

// Fonction de décodage de token simplifiée
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  } catch (e) {
    return null
  }
}

// Logger conditionnel - n'affiche les logs qu'en développement
const logWithTime = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString()
    if (data) {
      console.log(`[AuthContext][${timestamp}] ${message}`, data)
    } else {
      console.log(`[AuthContext][${timestamp}] ${message}`)
    }
  }
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider du contexte
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Démarrer à false pour éviter un blocage initial
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  logWithTime("AuthProvider initialisé")

  // Fonction pour vérifier l'authentification avec rate limiting et memoization
  const checkAuth = useCallback(async () => {
    // Éviter les vérifications trop fréquentes (5 secondes)
    const now = Date.now()
    if (now - lastCheckTime < 5000) {
      return
    }
    
    setLastCheckTime(now)
    
    // Vérifier si un token est présent dans localStorage
    let token: string | null = null;
    
    try {
      token = localStorage.getItem('token')
    } catch (e) {
      // Ignorer les erreurs de localStorage (e.g. dans un environnement SSR)
    }
    
    if (!token) {
      setIsLoading(false)
      setIsAuthenticated(false)
      setIsAdmin(false)
      setUser(null)
      return
    }
    
    // Vérifier si le token est expiré avant de faire une requête API
    try {
      const decodedToken = decodeToken(token)
      
      if (!decodedToken || (decodedToken.exp && decodedToken.exp * 1000 < Date.now())) {
        // Token expiré, nettoyer l'état
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }
      
      // Faire une requête à /auth/me avec le token
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de l\'authentification')
      }
      
      const userData = await response.json()
      
      // Convertir les données utilisateur au format attendu
      const formattedUser: User = {
        id: userData.id?.toString() || '',
        email: userData.email || '',
        username: userData.username || '',
        isAdmin: userData.is_admin === true,
        avatar_url: userData.avatar_url,
        phone: userData.phone
      }
      
      // Mettre à jour l'état
      setUser(formattedUser)
      setIsAuthenticated(true)
      setIsAdmin(formattedUser.isAdmin)
      
    } catch (error) {
      // Ne pas supprimer le token en cas d'erreur réseau
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        setIsLoading(false)
        return
      }
      
      // En cas d'erreur, supprimer le token et réinitialiser l'état
      try {
        localStorage.removeItem('token')
      } catch (e) {
        // Ignorer les erreurs
      }
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    }
    
    setIsLoading(false)
  }, [lastCheckTime])

  // Fonction pour vérifier l'authentification manuellement
  const checkAuthManually = useCallback(async () => {
    setIsLoading(true)
    await checkAuth()
  }, [checkAuth])

  // Fonction pour se connecter
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { user: responseUser, token } = response.data

      // Normaliser l'utilisateur
      const normalizedUser = {
        id: responseUser.id,
        email: responseUser.email,
        username: responseUser.username,
        isAdmin: responseUser.is_admin || responseUser.isAdmin || false,
        avatar_url: responseUser.avatar_url,
        phone: responseUser.phone
      }

      // Stocker le token
      try {
        localStorage.setItem('token', token)
      } catch (e) {
        // Ignorer les erreurs
      }
      
      // Mettre à jour l'état
      setUser(normalizedUser)
      setIsAuthenticated(true)
      setIsAdmin(normalizedUser.isAdmin)

      return { 
        user: normalizedUser, 
        token 
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour s'inscrire
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/auth/inscription`, {
        username,
        email,
        password
      })
      
      const { user: responseUser, token } = response.data

      // Normaliser l'utilisateur
      const normalizedUser = {
        id: responseUser.id,
        email: responseUser.email,
        username: responseUser.username,
        isAdmin: responseUser.is_admin || responseUser.isAdmin || false,
        avatar_url: responseUser.avatar_url,
        phone: responseUser.phone
      }

      // Stocker le token
      try {
        localStorage.setItem('token', token)
      } catch (e) {
        // Ignorer les erreurs
      }
      
      // Mettre à jour l'état
      setUser(normalizedUser)
      setIsAuthenticated(true)
      setIsAdmin(normalizedUser.isAdmin)
      
      return
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour se déconnecter
  const logout = () => {
    // Supprimer le token de localStorage
    try {
      localStorage.removeItem('token')
    } catch (e) {
      // Ignorer les erreurs
    }
    
    // Réinitialiser l'état
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    
    // Redirection vers la page de connexion
    window.location.href = '/connexion'
  }

  // Initialisation différée de l'authentification
  useEffect(() => {
    // Cette méthode utilise setTimeout pour différer la vérification initiale
    // et éviter de bloquer le rendu et l'interactivité
    const timer = setTimeout(() => {
      if (!isInitialized) {
        checkAuth().then(() => {
          setIsInitialized(true)
        })
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [isInitialized, checkAuth])

  // Vérifier périodiquement l'authentification si l'utilisateur est connecté
  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;
    
    // Vérifier l'authentification à des intervalles plus longs (15 secondes)
    const interval = setInterval(() => {
      checkAuth()
    }, 15000)
    
    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, isInitialized, checkAuth])

  // Mémoiser la valeur du contexte pour éviter les re-renders inutiles
  const value = useMemo(() => ({
    user,
    login,
    logout,
    isLoading,
    register,
    isAuthenticated,
    isAdmin,
    checkAuthManually
  }), [user, isLoading, isAuthenticated, isAdmin, checkAuthManually]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 