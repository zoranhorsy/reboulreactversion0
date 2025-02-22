'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

interface User {
    id: number
    email: string
    isAdmin: boolean
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<any>
    logout: () => void
    isAuthenticated: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Token invalide')
                }

                const userData = await response.json()
                setUser(userData)
            } catch (error) {
                console.error('Erreur de vérification du token:', error)
                localStorage.removeItem('token')
                if (window.location.pathname.startsWith('/admin')) {
                    router.push('/admin/login')
                }
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            if (!response.ok) {
                throw new Error('Identifiants invalides')
            }

            const data = await response.json()
            localStorage.setItem('token', data.token)
            setUser(data.user)
            return data
        } catch (error) {
            console.error('Erreur de connexion:', error)
            toast({
                title: "Erreur de connexion",
                description: "Identifiants invalides",
                variant: "destructive"
            })
            throw error
        }
    }, [toast])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
        if (window.location.pathname.startsWith('/admin')) {
            router.push('/admin/login')
        }
    }, [router])

    const value = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 