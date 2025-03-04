'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

// Forcer l'utilisation de l'URL Railway
const API_URL = 'https://reboul-store-api-production.up.railway.app/api'
console.log('[AuthContext] Utilisation de l\'API URL:', API_URL);

interface User {
    id: number
    email: string
    isAdmin: boolean
    username: string
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

    const checkAuth = useCallback(async () => {
        console.log('[AuthContext] Vérification de l\'authentification');
        const token = localStorage.getItem('token')
        if (!token) {
            console.log('[AuthContext] Pas de token trouvé dans localStorage');
            setIsLoading(false)
            return
        }
        console.log('[AuthContext] Token trouvé dans localStorage:', token.substring(0, 20) + '...');

        // Fonction pour décoder un token JWT
        const decodeToken = (token: string) => {
            try {
                const parts = token.split('.');
                if (parts.length !== 3) return null;
                const payload = JSON.parse(atob(parts[1]));
                return payload;
            } catch (error) {
                console.error('[AuthContext] Erreur lors du décodage manuel du token:', error);
                return null;
            }
        };

        // Essayer de décoder le token manuellement d'abord
        const decodedToken = decodeToken(token);
        console.log('[AuthContext] Token décodé manuellement:', decodedToken);
        
        if (decodedToken && decodedToken.userId && decodedToken.username) {
            // Créer un utilisateur à partir du token décodé
            const userData = {
                id: decodedToken.userId,
                email: decodedToken.username + '@example.com', // Fallback
                username: decodedToken.username,
                isAdmin: decodedToken.isAdmin || false
            };
            console.log('[AuthContext] Utilisateur créé à partir du token:', userData);
            setUser(userData);
            setIsLoading(false);
            return;
        }

        // Si le décodage manuel échoue, essayer la route /auth/me
        try {
            console.log('[AuthContext] Envoi de la requête à /auth/me');
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            console.log('[AuthContext] Réponse de /auth/me:', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('[AuthContext] Token expiré ou invalide');
                    // Token expiré ou invalide
                    localStorage.removeItem('token')
                    setUser(null)
                    if (window.location.pathname.startsWith('/admin')) {
                        console.log('[AuthContext] Redirection vers /connexion');
                        // Utiliser window.location.href au lieu de router.push
                        window.location.href = '/connexion';
                    }
                } else {
                    console.log('[AuthContext] Erreur non-401, utilisation du token décodé manuellement');
                }
                setIsLoading(false)
                return
            }

            const userData = await response.json()
            console.log('[AuthContext] Données utilisateur reçues:', userData);
            // Adapter la structure des données utilisateur
            const adaptedUser = {
                ...userData,
                isAdmin: userData.isAdmin || userData.is_admin || false
            };
            console.log('[AuthContext] Données utilisateur adaptées:', adaptedUser);
            setUser(adaptedUser)
        } catch (error) {
            console.error('[AuthContext] Erreur de vérification du token:', error)
            // Ne pas supprimer le token en cas d'erreur réseau
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.log('[AuthContext] Erreur réseau - conservation du token')
                return
            }
            localStorage.removeItem('token')
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const login = useCallback(async (email: string, password: string) => {
        try {
            console.log('[AuthContext] Tentative de connexion avec:', { email });
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            console.log('[AuthContext] Réponse de login:', { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });

            if (!response.ok) {
                const errorData = await response.json()
                console.log('[AuthContext] Erreur de connexion:', errorData);
                throw new Error(errorData.error || 'Identifiants invalides')
            }

            const data = await response.json()
            console.log('[AuthContext] Données de connexion reçues:', {
                token: data.token ? data.token.substring(0, 20) + '...' : 'undefined',
                user: data.user
            });
            localStorage.setItem('token', data.token)
            console.log('[AuthContext] Token stocké dans localStorage');
            
            // Adapter la structure des données utilisateur
            const userData = {
                ...data.user,
                isAdmin: data.user.isAdmin || data.user.is_admin || false
            }
            console.log('[AuthContext] Données utilisateur adaptées:', userData);
            setUser(userData)
            
            // Vérifier si l'utilisateur est admin pour la redirection
            console.log('[AuthContext] Vérification du statut admin pour la redirection:', {
                isAdmin: userData.isAdmin,
                currentPath: window.location.pathname
            });
            
            // Utiliser setTimeout pour éviter les problèmes de timing
            setTimeout(() => {
                if (userData.isAdmin && window.location.pathname === '/connexion') {
                    console.log('[AuthContext] Redirection vers /admin/dashboard');
                    window.location.href = '/admin/dashboard';
                } else if (window.location.pathname === '/connexion') {
                    console.log('[AuthContext] Redirection vers /');
                    window.location.href = '/';
                }
            }, 500);
            
            return data
        } catch (error) {
            console.error('[AuthContext] Erreur de connexion:', error)
            toast({
                title: "Erreur de connexion",
                description: error instanceof Error ? error.message : "Identifiants invalides",
                variant: "destructive"
            })
            throw error
        }
    }, [toast])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
        router.push('/connexion')
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