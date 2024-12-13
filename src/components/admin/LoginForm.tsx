'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/app/contexts/AuthContext'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()
    const { login, isLoading } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (email === 'admin@reboul.com' && password === 'password123') {
                // Authentification réussie
                await login(email, password) // Utiliser la fonction login du contexte
                localStorage.setItem('adminToken', 'fake-jwt-token')
                toast({
                    title: "Connexion réussie",
                    description: "Bienvenue dans l'interface d'administration.",
                })
                router.push('/admin/dashboard')
            } else {
                throw new Error('Identifiants invalides')
            }
        } catch (err) {
            setError('Identifiants invalides')
            toast({
                title: "Erreur de connexion",
                description: "Veuillez vérifier vos identifiants et réessayer.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Connexion Administrateur</CardTitle>
                <CardDescription>Accédez au panneau d'administration de Reboul Store</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@reboul.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
            <CardFooter>
                <Button
                    type="submit"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
            </CardFooter>
        </Card>
    )
}

