'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import axios from 'axios'

interface User {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ user: User, token: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userData: User = {
                        id: response.data.id,
                        email: response.data.email,
                        username: response.data.username,
                        isAdmin: response.data.is_admin
                    };
                    setUser(userData);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    if (window.location.pathname === '/admin/login') {
                        router.push('/admin/dashboard');
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                    router.push('/admin/login');
                }
            } else {
                setUser(null);
                if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [router])

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error('Invalid response from server');
            }

            const userData: User = {
                id: user.id,
                email: user.email,
                username: user.username,
                isAdmin: user.is_admin
            };

            setUser(userData);
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Set a cookie for server-side auth checks
            document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;

            return { user: userData, token };
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Erreur de connexion",
                description: "Vérifiez vos identifiants et réessayez.",
                variant: "destructive",
            });
            throw error;
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization'];
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/admin/login');
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

