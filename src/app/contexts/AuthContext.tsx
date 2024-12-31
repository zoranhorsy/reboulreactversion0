'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from "@/components/ui/use-toast"

interface User {
    email: string;
    name?: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    // Simuler une vérification de token
                    const email = localStorage.getItem('userEmail');
                    const name = localStorage.getItem('userName');
                    if (email === 'admin@reboul.com') {
                        setUser({ email, name: name || undefined, role: 'admin' });
                    } else if (email) {
                        setUser({ email, name: name || undefined, role: 'user' });
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userName');
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            // Simuler une requête d'authentification
            if (email === 'admin@reboul.com' && password === 'password123') {
                const user = { email, role: 'admin' as const };
                setUser(user);
                localStorage.setItem('adminToken', 'fake-jwt-token');
                localStorage.setItem('userEmail', email);
                toast({
                    title: "Connexion réussie",
                    description: `Bienvenue, ${user.email}!`,
                });
            } else if (email === 'user@reboul.com' && password === 'password123') {
                const user = { email, role: 'user' as const };
                setUser(user);
                localStorage.setItem('adminToken', 'fake-jwt-token');
                localStorage.setItem('userEmail', email);
                toast({
                    title: "Connexion réussie",
                    description: `Bienvenue, ${user.email}!`,
                });
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Erreur de connexion",
                description: "Identifiants invalides. Veuillez réessayer.",
                variant: "destructive",
            });
            throw error;
        }
    }

    const register = async (name: string, email: string, password: string) => {
        try {
            // Simuler une requête d'inscription
            // Dans une vraie application, vous enverriez ces données à votre API
            const newUser = { email, name, role: 'user' as const };
            setUser(newUser);
            localStorage.setItem('adminToken', 'fake-jwt-token');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            toast({
                title: "Inscription réussie",
                description: `Bienvenue, ${newUser.name}!`,
            });
        } catch (error) {
            console.error('Register error:', error);
            toast({
                title: "Erreur d'inscription",
                description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
                variant: "destructive",
            });
            throw error;
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        toast({
            title: "Déconnexion",
            description: "Vous avez été déconnecté avec succès.",
        })
    }

    const updateUser = async (userData: Partial<User>) => {
        try {
            // Ici, vous devriez faire une requête à votre API pour mettre à jour les informations de l'utilisateur
            // Pour l'exemple, nous allons simuler cette requête
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser as User);
            if (updatedUser.name) {
                localStorage.setItem('userName', updatedUser.name);
            }
            toast({
                title: "Profil mis à jour",
                description: "Vos informations ont été mises à jour avec succès.",
            })
        } catch (error) {
            console.error('Update user error:', error)
            toast({
                title: "Erreur de mise à jour",
                description: "Impossible de mettre à jour vos informations. Veuillez réessayer.",
                variant: "destructive",
            })
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

