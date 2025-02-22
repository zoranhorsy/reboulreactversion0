import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface User {
    id: number
    email: string
    isAdmin: boolean
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            api.fetchUserProfile()
                .then(userData => {
                    if (userData) {
                        setUser({
                            id: parseInt(userData.id),
                            email: userData.email,
                            isAdmin: userData.isAdmin
                        })
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token')
                    setUser(null)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password)
            if (response) {
                const { token, user: userData } = response
                localStorage.setItem('token', token)
                setUser({
                    id: parseInt(userData.id),
                    email: userData.email,
                    isAdmin: userData.isAdmin
                })
                return response
            }
            throw new Error('Login failed')
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        api.logout()
        setUser(null)
    }

    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false
    }
} 