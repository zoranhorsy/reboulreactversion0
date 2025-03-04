"use client"

import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from "@/components/ui/use-toast"

// Définir l'URL de l'API
const API_URL = 'http://localhost:5001/api'

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

// Interface pour la réponse d'authentification
interface AuthResponse {
  user: User
  token: string
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
  login: (email: string, password: string) => Promise<void>
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
  const checkAuth = async () => {
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
  }

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
  const login = async (email: string, password: string) => {
    logWithTime("login - Début", { email })
    setIsLoading(true)
    
    try {
      // Faire une requête à /auth/login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      logWithTime("login - Réponse", { 
        status: response.status, 
        ok: response.ok 
      })
      
      if (!response.ok) {
        throw new Error('Email ou mot de passe incorrect')
      }
      
      const data = await response.json()
      logWithTime("login - Données brutes", data)
      
      // Stocker le token dans localStorage
      localStorage.setItem('token', data.token)
      logWithTime("login - Token stocké", { 
        tokenLength: data.token.length 
      })
      
      // Décoder le token pour voir son contenu
      const decodedToken = decodeToken(data.token)
      logWithTime("login - Token décodé", decodedToken)
      
      // Convertir les données utilisateur au format attendu
      const formattedUser: User = {
        id: data.user?.id?.toString() || '',
        email: data.user?.email || '',
        username: data.user?.username || '',
        isAdmin: data.user?.is_admin === true,
        avatar_url: data.user?.avatar_url,
        phone: data.user?.phone
      }
      
      logWithTime("login - Utilisateur formaté", formattedUser)
      
      // Mettre à jour l'état
      setUser(formattedUser)
      setIsAuthenticated(true)
      setIsAdmin(formattedUser.isAdmin)
      
      logWithTime("login - Redirection", { 
        isAdmin: formattedUser.isAdmin 
      })
      
      // Redirection
      if (formattedUser.isAdmin) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      logWithTime("login - Erreur", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour s'inscrire
  const register = async (username: string, email: string, password: string) => {
    logWithTime("register - Début", { email, username })
    setIsLoading(true)
    
    try {
      // Faire une requête à /auth/register
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })
      
      logWithTime("register - Réponse", { 
        status: response.status, 
        ok: response.ok 
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription')
      }
      
      const data = await response.json()
      logWithTime("register - Données brutes", data)
      
      // Stocker le token dans localStorage
      localStorage.setItem('token', data.token)
      logWithTime("register - Token stocké", { 
        tokenLength: data.token.length 
      })
      
      // Décoder le token pour voir son contenu
      const decodedToken = decodeToken(data.token)
      logWithTime("register - Token décodé", decodedToken)
      
      // Convertir les données utilisateur au format attendu
      const formattedUser: User = {
        id: data.user?.id?.toString() || '',
        email: data.user?.email || '',
        username: data.user?.username || '',
        isAdmin: data.user?.is_admin === true,
        avatar_url: data.user?.avatar_url,
        phone: data.user?.phone
      }
      
      logWithTime("register - Utilisateur formaté", formattedUser)
      
      // Mettre à jour l'état
      setUser(formattedUser)
      setIsAuthenticated(true)
      setIsAdmin(formattedUser.isAdmin)
      
      logWithTime("register - Redirection", { 
        isAdmin: formattedUser.isAdmin 
      })
      
      // Redirection
      if (formattedUser.isAdmin) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      logWithTime("register - Erreur", error)
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
      const token = localStorage.getItem('token')
      if (token && !isAuthenticated) {
        logWithTime("Vérification périodique - Token trouvé mais non authentifié")
        checkAuth()
      }
    }, 5000)
    
    return () => {
      clearInterval(interval)
    }
  }, [isAuthenticated])

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