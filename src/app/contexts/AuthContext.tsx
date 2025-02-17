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

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token")
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
        }
        setUser(userData)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
        if (window.location.pathname === "/admin/login") {
          router.push("/admin/dashboard")
        }
      } catch (error) {
        console.error("Error verifying token:", error)
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        setUser(null)
        router.push("/admin/login")
      }
    } else {
      setUser(null)
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        router.push("/admin/login")
      }
    }
    setIsLoading(false)
  }, [router])

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
      }

      setUser(userData)
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict; Secure`

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
    setUser(null)
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/admin/login")
  }, [router])

  return <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>{children}</AuthContext.Provider>
}

