'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[LoginPage][${timestamp}] ${message}`, data)
  } else {
    console.log(`[LoginPage][${timestamp}] ${message}`)
  }
}

// Forcer l'utilisation de l'URL Railway
const API_URL = 'https://reboul-store-api-production.up.railway.app/api'
logWithTime("Utilisation de l'API URL: " + API_URL);

// Fonction pour décoder un token JWT
const decodeToken = (token: string) => {
    try {
        // Le token JWT est composé de trois parties séparées par des points
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { error: 'Format de token invalide' };
        }
        
        // Décoder la partie payload (deuxième partie)
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        return { error: 'Erreur lors du décodage du token' };
    }
};

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasRedirected, setHasRedirected] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const { toast } = useToast()

    // Empêcher l'hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    logWithTime("Page de connexion rendue")

    useEffect(() => {
        if (hasRedirected) {
            logWithTime("Redirection déjà effectuée, ignorée")
            return
        }

        logWithTime("useEffect - vérification du token dans localStorage")
        const token = localStorage.getItem('token')
        
        if (token) {
            logWithTime("Token trouvé dans localStorage", { 
                tokenLength: token.length,
                tokenStart: token.substring(0, 20) + '...'
            })
            
            // Décoder le token pour voir son contenu
            const decodedToken = decodeToken(token)
            logWithTime("Contenu du token décodé", decodedToken)
            
            // Vérifier si le token est valide en faisant une requête à /auth/me
            fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                logWithTime("Réponse de /auth/me", { 
                    status: response.status, 
                    ok: response.ok 
                })
                
                if (response.ok) {
                    return response.json()
                }
                
                throw new Error('Token invalide')
            })
            .then(userData => {
                logWithTime("Utilisateur authentifié", userData)
                
                // Adapter la structure des données utilisateur
                const isAdmin = userData.isAdmin || userData.is_admin || false;
                logWithTime("Statut admin:", isAdmin);
                
                // Rediriger vers la page appropriée
                if (isAdmin) {
                    logWithTime("Redirection vers /admin/dashboard (admin)")
                    setHasRedirected(true)
                    window.location.href = '/admin/dashboard'
                } else {
                    logWithTime("Redirection vers / (utilisateur)")
                    setHasRedirected(true)
                    window.location.href = '/'
                }
            })
            .catch(error => {
                logWithTime("Erreur lors de la vérification du token", error)
                // Supprimer le token invalide
                localStorage.removeItem('token')
            })
        } else {
            logWithTime("Pas de token dans localStorage")
        }
    }, [hasRedirected])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        logWithTime("Soumission du formulaire de connexion")
        
        setIsLoading(true)

        try {
            logWithTime("Envoi de la requête de connexion", { email })
            
            // Utiliser fetch directement
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            logWithTime("Réponse brute reçue", { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            logWithTime("Données de réponse", data);
            
            // Décoder le token pour voir son contenu
            const decodedToken = decodeToken(data.token);
            logWithTime("Token décodé", decodedToken);
            
            // Stocker le token manuellement
            localStorage.setItem('token', data.token);
            logWithTime("Token stocké dans localStorage", { 
                tokenLength: data.token.length,
                tokenStart: data.token.substring(0, 20) + '...'
            });
            
            // Afficher un toast de succès
            toast({
                title: 'Connexion réussie',
                description: 'Vous êtes maintenant connecté.',
            });
            
            // S'assurer que nous utilisons la bonne propriété pour le statut admin
            const isAdmin = data.user.is_admin === true;
            
            // Adapter la structure des données utilisateur
            const userData = {
                ...data.user,
                isAdmin: isAdmin // Utiliser la valeur extraite directement
            };
            
            // Ajouter des logs supplémentaires pour le débogage
            logWithTime("Données utilisateur adaptées", userData);
            logWithTime("Statut admin:", isAdmin);
            logWithTime("Valeur de is_admin dans les données brutes:", data.user.is_admin);
            logWithTime("Valeur de isAdmin dans les données brutes:", data.user.isAdmin);
            
            // Redirection manuelle
            logWithTime("Redirection manuelle", { 
                isAdmin: isAdmin,
                destination: isAdmin ? '/admin' : '/'
            });
            
            // Utiliser setTimeout pour s'assurer que les logs sont affichés avant la redirection
            setTimeout(() => {
                logWithTime("Exécution du setTimeout pour la redirection");
                setHasRedirected(true);
                logWithTime("hasRedirected défini à true");
                
                if (isAdmin) {
                    logWithTime("Tentative de redirection vers /admin");
                    window.location.href = '/admin';
                } else {
                    logWithTime("Tentative de redirection vers /");
                    window.location.href = '/';
                }
            }, 1000);
            
        } catch (error) {
            logWithTime("Erreur de connexion", error)
            toast({
                title: 'Erreur',
                description: 'Email ou mot de passe incorrect.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Déterminer le logo à afficher en fonction du thème
    const logoSrc = (!mounted || theme === 'dark') ? '/images/logo_white.png' : '/images/logo_black.png'

    // Fonction pour basculer entre les thèmes
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
        setTheme(newTheme)
    }

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
            {/* Bouton de changement de thème */}
            <button
                onClick={toggleTheme}
                className={`absolute top-4 right-4 p-2 rounded-full ${
                    theme === 'light' 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-zinc-800 text-gray-200 hover:bg-zinc-700'
                }`}
                aria-label={theme === 'light' ? "Passer au mode sombre" : "Passer au mode clair"}
                title={theme === 'light' ? "Passer au mode sombre" : "Passer au mode clair"}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Logo en header */}
            <div className="w-full max-w-md mb-8 flex flex-col items-center animate-fadeIn">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                    <Image 
                        src={logoSrc}
                        alt="Logo Reboul" 
                        fill 
                        className="object-contain"
                        priority
                        onError={(e) => {
                            console.error("Erreur de chargement du logo:", logoSrc)
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                        }}
                    />
                </div>
            </div>
            
            {/* Formulaire */}
            <div className={`w-full max-w-md rounded-xl shadow-md p-4 sm:p-6 space-y-5 animate-fadeIn ${
                theme === 'light' ? 'bg-white' : 'bg-black'
            }`} style={{animationDelay: "0.1s"}}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Email</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="exemple@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className={`w-full h-12 text-base rounded-md ${
                                theme === 'light' 
                                ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0' 
                                : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0'
                            }`}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="password" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Mot de passe</label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className={`w-full h-12 text-base pr-10 rounded-md ${
                                    theme === 'light' 
                                    ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0' 
                                    : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0'
                                }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                disabled={isLoading}
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? 
                                    <EyeOff className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} /> : 
                                    <Eye className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} />
                                }
                            </button>
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        className={`w-full h-12 text-base font-medium transition-colors mt-4 ${
                            theme === 'light'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-black hover:bg-gray-300'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                </form>
                
                <div className="mt-4 space-y-2">
                    <p className={`text-sm text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        <Link href="/mot-de-passe-oublie" className={`${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-200 hover:text-white'} transition-colors`}>
                            Mot de passe oublié ?
                        </Link>
                    </p>
                    <p className={`text-sm text-center ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Pas encore de compte ? <Link href="/inscription" className={`${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-200 hover:text-white'} transition-colors`}>
                            S&apos;inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

