'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        try {
            const { user } = await login(email, password)

            if (user && user.isAdmin) {
                toast({
                    title: "Connexion réussie",
                    description: "Bienvenue dans l'interface d'administration.",
                })
                router.push('/admin/dashboard')
            } else {
                throw new Error('Accès non autorisé')
            }
        } catch (err) {
            console.error('Erreur de connexion:', err)
            setError('Identifiants invalides ou accès non autorisé')
            toast({
                title: "Erreur de connexion",
                description: "Veuillez vérifier vos identifiants et réessayer.",
                variant: "destructive",
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Connexion Administrateur</CardTitle>
                <CardDescription>
                    Accédez au panneau d'administration de Reboul Store
                </CardDescription>
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
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

