"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

// Define RouterInstance type based on the return type of useRouter
type RouterInstance = ReturnType<typeof useRouter>

interface User {
  id: string
  email: string
  username: string
  isAdmin: boolean
  avatar_url?: string
  phone?: string
}

interface AuthResponse {
  user: User
  token: string
}

interface AuthMeResponse {
  id: string
  email: string
  username: string
  is_admin: boolean
  avatar_url?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: () => void
  isLoading: boolean
  register: (username: string, email: string, password: string) => Promise<AuthResponse>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

interface AuthProviderProps {
  children: React.ReactNode
  router?: RouterInstance
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, router: propRouter }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const routerHook = useRouter()
  const router = propRouter || routerHook

  const isAdminRoute = useCallback((path: string) => {
    return path.startsWith('/admin') && path !== '/admin/connexion'
  }, [])

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token")
    const currentPath = window.location.pathname

    if (token) {
      try {
        const response = await axios.get<AuthMeResponse>(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData: User = {
          id: response.data.id,
          email: response.data.email,
          username: response.data.username,
          isAdmin: response.data.is_admin,
          avatar_url: response.data.avatar_url,
          phone: response.data.phone,
        }
        setUser(userData)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Si l'utilisateur est sur la page de connexion admin et qu'il est admin
        if (currentPath === "/admin/connexion" && userData.isAdmin) {
          router.push("/admin")
        }
        // Si l'utilisateur est sur une route admin mais n'est pas admin
        else if (isAdminRoute(currentPath) && !userData.isAdmin) {
          router.push("/")
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits d'accès à cette section.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        setUser(null)
        
        // Rediriger vers connexion uniquement si on est sur une route admin
        if (isAdminRoute(currentPath)) {
          router.push("/connexion")
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter.",
            variant: "destructive",
          })
        }
      }
    } else {
      setUser(null)
      // Rediriger vers connexion uniquement si on est sur une route admin
      if (isAdminRoute(currentPath)) {
        router.push("/connexion")
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour accéder à cette section.",
          variant: "destructive",
        })
      }
    }
    setIsLoading(false)
  }, [router, isAdminRoute])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleAuthRequest = useCallback(async (url: string, data: Record<string, string>): Promise<AuthResponse> => {
    try {
      const response = await axios.post(url, data)
      const { token, user } = response.data

      if (!token || !user) {
        throw new Error("Invalid response from server")
      }

      const userData: User = {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.is_admin,
        avatar_url: user.avatar_url,
        phone: user.phone,
      }

      setUser(userData)
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      return { user: userData, token }
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: "Erreur d'authentification",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  const login: AuthContextType["login"] = useCallback(
    (email, password) => {
      return handleAuthRequest(`${API_URL}/auth/login`, { email, password })
    },
    [handleAuthRequest],
  )

  const register: AuthContextType["register"] = useCallback(
    (username, email, password) => {
      return handleAuthRequest(`${API_URL}/auth/inscription`, { username, email, password })
    },
    [handleAuthRequest],
  )

  const logout = useCallback(() => {
    const currentPath = window.location.pathname
    setUser(null)
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    
    // Rediriger vers la page d'accueil si on est sur une route admin
    if (isAdminRoute(currentPath)) {
      router.push("/")
    }
  }, [router, isAdminRoute])

  return <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>{children}</AuthContext.Provider>
} 