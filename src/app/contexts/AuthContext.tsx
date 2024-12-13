'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
    email: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (token) {
            // Simuler la vérification du token
            setUser({ email: 'admin@reboul.com' })
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        // Simuler une requête d'authentification
        if (email === 'admin@reboul.com' && password === 'password123') {
            setUser({ email })
            localStorage.setItem('adminToken', 'fake-jwt-token')
        } else {
            throw new Error('Invalid credentials')
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('adminToken')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

