"use client"

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
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

// Fonction pour décoder un token JWT
const decodeToken = (token: string) => {
  try {
    // Le token JWT est composé de trois parties séparées par des points
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Décoder la partie payload (deuxième partie)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};

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

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[AuthContext][${timestamp}] ${message}`, data)
  } else {
    console.log(`[AuthContext][${timestamp}] ${message}`)
  }
}

// Provider du contexte
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const router = useRouter()

  logWithTime("AuthProvider initialisé")

  // Fonction pour vérifier l'authentification
  const checkAuth = useCallback(async () => {
    // Éviter les vérifications trop fréquentes
    const now = Date.now()
    if (now - lastCheckTime < 1000) {
      logWithTime("checkAuth - Vérification trop fréquente, ignorée")
      return
    }
    
    setLastCheckTime(now)
    logWithTime("checkAuth - Début")
    
    // Vérifier si un token est présent dans localStorage
    const token = localStorage.getItem('token')
    
    if (!token) {
      logWithTime("checkAuth - Pas de token trouvé")
      setIsLoading(false)
      setIsAuthenticated(false)
      setIsAdmin(false)
      setUser(null)
      return
    }
    
    logWithTime("checkAuth - Token trouvé", { tokenLength: token.length })
    
    // Décoder le token pour voir son contenu
    const decodedToken = decodeToken(token)
    logWithTime("checkAuth - Token décodé", decodedToken)
    
    try {
      // Faire une requête à /auth/me avec le token
      logWithTime("checkAuth - Envoi de la requête à /auth/me")
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      logWithTime("checkAuth - Réponse de /auth/me", { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de l\'authentification')
      }
      
      const userData = await response.json()
      logWithTime("checkAuth - Données utilisateur brutes", userData)
      
      // Convertir les données utilisateur au format attendu
      const formattedUser: User = {
        id: userData.id?.toString() || '',
        email: userData.email || '',
        username: userData.username || '',
        isAdmin: userData.is_admin === true,
        avatar_url: userData.avatar_url,
        phone: userData.phone
      }
      
      logWithTime("checkAuth - Utilisateur formaté", formattedUser)
      
      // Mettre à jour l'état
      setUser(formattedUser)
      setIsAuthenticated(true)
      setIsAdmin(formattedUser.isAdmin)
      
      logWithTime("checkAuth - Authentification réussie", { 
        isAdmin: formattedUser.isAdmin,
        isAuthenticated: true
      })
    } catch (error) {
      logWithTime("checkAuth - Erreur", error)
      
      // Ne pas supprimer le token en cas d'erreur réseau
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        logWithTime("checkAuth - Erreur réseau - conservation du token")
        setIsLoading(false)
        return
      }
      
      // En cas d'erreur, supprimer le token et réinitialiser l'état
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }, [lastCheckTime])

  // Fonction pour vérifier l'authentification manuellement
  const checkAuthManually = async () => {
    logWithTime("checkAuthManually - Début")
    await checkAuth()
    logWithTime("checkAuthManually - Fin", { 
      isAuthenticated, 
      isAdmin, 
      hasUser: !!user 
    })
  }

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
      localStorage.setItem('token', token)
      
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

  // Fonction pour s'inscrire avec approche hybride
  const register = async (username: string, email: string, password: string) => {
    logWithTime("register - Début", { email, username })
    setIsLoading(true)
    
    try {
      // Utiliser le bon point d'entrée pour l'inscription
      logWithTime("register - Tentative avec l'API réelle sur /auth/inscription")
      const response = await axios.post(`${API_URL}/auth/inscription`, {
        username,  // Utiliser username au lieu de name comme attendu par le backend
        email,
        password
      })
      
      logWithTime("register - Réponse API réelle", response.data)
      
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
      localStorage.setItem('token', token)
      
      // Mettre à jour l'état
      setUser(normalizedUser)
      setIsAuthenticated(true)
      setIsAdmin(normalizedUser.isAdmin)
      
      return
    } catch (error) {
      logWithTime("register - Erreur critique", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour se déconnecter
  const logout = () => {
    logWithTime("logout - Début")
    
    // Supprimer le token de localStorage
    localStorage.removeItem('token')
    
    // Réinitialiser l'état
    setUser(null)
    setIsAuthenticated(false)
    setIsAdmin(false)
    
    logWithTime("logout - Redirection")
    
    // Redirection vers la page de connexion
    window.location.href = '/connexion'
  }

  // Vérifier l'authentification au chargement
  useEffect(() => {
    logWithTime("useEffect - checkAuth")
    checkAuth()
    
    // Vérifier périodiquement l'authentification
    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuth()
      }
    }, 5000)
    
    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated, checkAuth])

  // Valeur du contexte
  const value = {
    user,
    login,
    logout,
    isLoading,
    register,
    isAuthenticated,
    isAdmin,
    checkAuthManually
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 