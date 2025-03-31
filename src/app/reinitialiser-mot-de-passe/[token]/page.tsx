'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Sun, Moon, Check, X } from 'lucide-react'
import { useTheme } from 'next-themes'

// Forcer l'utilisation de l'URL Railway
const API_URL = 'https://reboul-store-api-production.up.railway.app/api'

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  if (data) {
    console.log(`[ResetPasswordPage][${timestamp}] ${message}`, data)
  } else {
    console.log(`[ResetPasswordPage][${timestamp}] ${message}`)
  }
}

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const { token } = params
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    })
    const [mounted, setMounted] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const { theme, setTheme } = useTheme()
    const { toast } = useToast()

    // Empêcher l'hydration mismatch
    useEffect(() => {
        setMounted(true)
        
        // Récupérer l'email du sessionStorage s'il existe
        if (typeof window !== 'undefined') {
            const email = sessionStorage.getItem('reset_email')
            if (email) {
                setUserEmail(email)
            }
        }
    }, [])

    // Vérifier la validité du token
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setTokenValid(false)
                return
            }

            try {
                logWithTime("Vérification de la validité du token", { token })
                
                // Vérification via l'API que le token est valide
                const response = await fetch(`${API_URL}/auth/verify-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token as string }),
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Token invalide ou expiré');
                }
                
                // Si l'API retourne l'email de l'utilisateur, on le stocke
                if (data.email) {
                    setUserEmail(data.email);
                    sessionStorage.setItem('reset_email', data.email);
                }
                
                setTokenValid(true);
                logWithTime("Token validé avec succès via l'API", data);
            } catch (error) {
                logWithTime("Erreur lors de la validation du token", error);
                setTokenValid(false);
            }
        }

        verifyToken();
    }, [token]);

    // Vérifier la force du mot de passe
    useEffect(() => {
        // Vérifier la complexité du mot de passe
        const checkPasswordStrength = () => {
            // Initialiser tous les critères à false
            const criteria = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            }
            
            setPasswordCriteria(criteria)
            
            // Calculer la force du mot de passe (0-4)
            const strengthScore = Object.values(criteria).filter(Boolean).length
            setPasswordStrength(strengthScore)
        }
        
        checkPasswordStrength()
    }, [password])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            })
            return
        }
        
        if (passwordStrength < 3) {
            toast({
                title: "Mot de passe trop faible",
                description: "Veuillez choisir un mot de passe plus sécurisé.",
                variant: "destructive",
            })
            return
        }
        
        setIsLoading(true)
        
        // Récupérer l'email pour la journalisation
        const email = userEmail || 'utilisateur@example.com'
        logWithTime("Demande de réinitialisation du mot de passe", { 
            token, 
            email,
            passwordLength: password.length,
            passwordStrength
        })
        
        try {
            // Appel à l'API de réinitialisation de mot de passe
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    token: token as string, 
                    password 
                }),
            })

            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe')
            }
            
            // Réinitialisation réussie
            setResetSuccess(true)
            logWithTime("Mot de passe réinitialisé avec succès", { email, status: response.status, data })
            
            // Supprimer l'email du sessionStorage
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('reset_email')
            }
            
            toast({
                title: "Succès",
                description: "Votre mot de passe a été réinitialisé avec succès.",
            })
            
            // Rediriger vers la page de connexion après 3 secondes
            setTimeout(() => {
                router.push('/connexion')
            }, 3000)
            
        } catch (error) {
            logWithTime("Erreur lors de la réinitialisation du mot de passe", error)
            
            // Message d'erreur personnalisé selon le type d'erreur
            let errorMessage = "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer."
            
            if (error instanceof Error) {
                if (error.message.includes('Token invalide') || error.message.includes('expiré')) {
                    errorMessage = "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien."
                    setTokenValid(false) // Marquer le token comme invalide
                } else {
                    errorMessage = error.message
                }
            }
            
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
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

    // Fonction pour afficher le contenu approprié en fonction de l'état
    const renderContent = () => {
        // Si le token est en cours de vérification
        if (tokenValid === null) {
            return (
                <div className="text-center py-4">
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Vérification du lien...
                    </p>
                </div>
            )
        }
        
        // Si le token est invalide
        if (tokenValid === false) {
            return (
                <div className="text-center py-6">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        theme === 'light' ? 'bg-red-100' : 'bg-red-900'
                    }`}>
                        <X className={`h-6 w-6 ${
                            theme === 'light' ? 'text-red-600' : 'text-red-400'
                        }`} />
                    </div>
                    
                    <h2 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
                        Lien invalide ou expiré
                    </h2>
                    
                    <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Le lien de réinitialisation de mot de passe que vous avez utilisé est invalide ou a expiré. 
                        Veuillez demander un nouveau lien.
                    </p>
                    
                    <Link href="/mot-de-passe-oublie">
                        <Button 
                            className={`${
                                theme === 'light'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-black hover:bg-gray-300'
                            }`}
                        >
                            Demander un nouveau lien
                        </Button>
                    </Link>
                </div>
            )
        }
        
        // Si la réinitialisation est réussie
        if (resetSuccess) {
            return (
                <div className="text-center py-6">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        theme === 'light' ? 'bg-green-100' : 'bg-green-900'
                    }`}>
                        <Check className={`h-6 w-6 ${
                            theme === 'light' ? 'text-green-600' : 'text-green-400'
                        }`} />
                    </div>
                    
                    <h2 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
                        Mot de passe réinitialisé
                    </h2>
                    
                    <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                    </p>
                    
                    <Link href="/connexion">
                        <Button 
                            className={`${
                                theme === 'light'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-black hover:bg-gray-300'
                            }`}
                        >
                            Se connecter
                        </Button>
                    </Link>
                </div>
            )
        }
        
        // Formulaire de réinitialisation du mot de passe
        return (
            <>
                <div className="mb-4">
                    <h1 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
                        Réinitialiser votre mot de passe
                    </h1>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Veuillez choisir un nouveau mot de passe sécurisé pour votre compte.
                    </p>
                    {userEmail && (
                        <div className={`mt-3 p-2 rounded-md text-sm ${
                            theme === 'light' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-blue-900/20 text-blue-300 border border-blue-900/50'
                        }`}>
                            Compte associé : <strong>{userEmail}</strong>
                        </div>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="password" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                            Nouveau mot de passe
                        </label>
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
                        
                        {/* Indicateur de force du mot de passe */}
                        {password.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <div className={`w-full h-1 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-zinc-800'}`}>
                                    <div 
                                        className="h-full transition-all duration-300 bg-green-500" 
                                        style={{ width: `${Math.min(100, passwordStrength * 25)}%` }}
                                    ></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                        {passwordCriteria.length ? 
                                            <Check className="h-3.5 w-3.5 text-green-500" /> : 
                                            <X className="h-3.5 w-3.5 text-red-500" />}
                                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>8 caractères minimum</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {passwordCriteria.uppercase ? 
                                            <Check className="h-3.5 w-3.5 text-green-500" /> : 
                                            <X className="h-3.5 w-3.5 text-red-500" />}
                                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Une majuscule</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {passwordCriteria.lowercase ? 
                                            <Check className="h-3.5 w-3.5 text-green-500" /> : 
                                            <X className="h-3.5 w-3.5 text-red-500" />}
                                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Une minuscule</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {passwordCriteria.number ? 
                                            <Check className="h-3.5 w-3.5 text-green-500" /> : 
                                            <X className="h-3.5 w-3.5 text-red-500" />}
                                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Un chiffre</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                className={`w-full h-12 text-base pr-10 rounded-md ${
                                    theme === 'light' 
                                    ? `bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}` 
                                    : `bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}`
                                }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                disabled={isLoading}
                                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showConfirmPassword ? 
                                    <EyeOff className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} /> : 
                                    <Eye className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} />
                                }
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <X className="h-3.5 w-3.5" />
                                Les mots de passe ne correspondent pas
                            </p>
                        )}
                    </div>
                    
                    <Button 
                        type="submit" 
                        className={`w-full h-12 text-base font-medium transition-colors mt-4 ${
                            theme === 'light'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-black hover:bg-gray-300'
                        }`}
                        disabled={isLoading || passwordStrength < 3 || password !== confirmPassword}
                    >
                        {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                    </Button>
                </form>
            </>
        )
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
            
            {/* Contenu principal */}
            <div className={`w-full max-w-md rounded-xl shadow-md p-4 sm:p-6 space-y-5 animate-fadeIn ${
                theme === 'light' ? 'bg-white' : 'bg-black'
            }`} style={{animationDelay: "0.1s"}}>
                {renderContent()}
            </div>
        </div>
    )
} 