'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/app/contexts/AuthContext"
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            console.log('Tentative de connexion avec:', { email, password: '********' })
            const { user, token } = await login(email, password)
            console.log('Résultat de la connexion:', { user, token })
            toast({
                title: "Connexion réussie",
                description: `Bienvenue ${user.username} sur votre compte Reboul Store.`,
            })
            router.push('/profil')
        } catch (error) {
            console.error("Erreur de connexion:", error)
            toast({
                title: "Erreur de connexion",
                description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Connexion</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center space-y-2">
                        <p>
                            <Link href="/mot-de-passe-oublie" className="text-primary hover:underline">Mot de passe oublié ?</Link>
                        </p>
                        <p>
                            Pas encore de compte ? <Link href="/inscription" className="text-primary hover:underline">S&apos;inscrire</Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

