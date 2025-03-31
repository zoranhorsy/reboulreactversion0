'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/contexts/AuthContext"
import { Eye, EyeOff, Check, X, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    })
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const { toast } = useToast()
    const { register } = useAuth()

    // Empêcher l'hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

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
        try {
            await register(name, email, password)
            toast({
                title: "Inscription réussie",
                description: "Votre compte a été créé avec succès.",
            })
            router.push('/connexion')
        } catch (error) {
            console.error("Erreur d'inscription:", error)
            toast({
                title: "Erreur d'inscription",
                description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getStrengthColor = () => {
        return 'bg-green-500'
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
                        <label htmlFor="name" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Nom d&apos;utilisateur</label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={`w-full h-12 text-base rounded-md ${
                                theme === 'light' 
                                ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0' 
                                : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0'
                            }`}
                            placeholder="Votre nom d&apos;utilisateur"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label htmlFor="email" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full h-12 text-base rounded-md ${
                                theme === 'light' 
                                ? 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0' 
                                : 'bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0'
                            }`}
                            placeholder="votre@email.com"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label htmlFor="password" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Mot de passe</label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? 
                                    <EyeOff className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} /> : 
                                    <Eye className={`h-5 w-5 ${theme === 'light' ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-400'}`} />
                                }
                            </button>
                        </div>
                        
                        {/* Indicateur de force du mot de passe simplifié */}
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
                        <label htmlFor="confirmPassword" className={`block text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Confirmer le mot de passe</label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`w-full h-12 text-base rounded-md ${
                                theme === 'light' 
                                ? `bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-0 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}` 
                                : `bg-zinc-900 border-zinc-800 focus:border-zinc-700 focus:ring-0 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}`
                            }`}
                            placeholder="••••••••"
                        />
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
                        {isLoading ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                </form>
                
                <p className={`text-sm text-center mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    Déjà un compte ? <Link href="/connexion" className={`${theme === 'light' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-200 hover:text-white'} transition-colors`}>Se connecter</Link>
                </p>
            </div>
        </div>
    )
}

// Ajoutez ce style à votre fichier global.css si ce n'est pas déjà fait
// .animate-fadeIn {
//     animation: fadeIn 0.5s ease-in-out;
// }
// @keyframes fadeIn {
//     from { opacity: 0; transform: translateY(10px); }
//     to { opacity: 1; transform: translateY(0); }
// }

