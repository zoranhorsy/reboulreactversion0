'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type User = {
    username: string
    role: 'admin'
}

type AuthContextType = {
    user: User | null
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = async (username: string, password: string) => {
        // Dans un cas réel, vous feriez une requête à votre API ici
        if (username === 'admin' && password === 'password') {
            const user = { username, role: 'admin' as const }
            setUser(user)
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            throw new Error('Invalid credentials')
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
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

