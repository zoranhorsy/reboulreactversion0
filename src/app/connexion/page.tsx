'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from '@/components/ui/label'

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
    const { toast } = useToast()

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
            
            // Adapter la structure des données utilisateur
            const userData = {
                ...data.user,
                isAdmin: data.user.isAdmin || data.user.is_admin || false
            };
            
            // Ajouter des logs supplémentaires pour le débogage
            logWithTime("Données utilisateur adaptées", userData);
            logWithTime("Statut admin:", userData.isAdmin);
            
            // Redirection manuelle
            logWithTime("Redirection manuelle", { 
                isAdmin: userData.isAdmin,
                destination: userData.isAdmin ? '/admin/dashboard' : '/'
            });
            
            // Utiliser setTimeout pour s'assurer que les logs sont affichés avant la redirection
            setTimeout(() => {
                setHasRedirected(true)
                if (userData.isAdmin) {
                    window.location.href = '/admin/dashboard';
                } else {
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

    // Fonction pour tester le token
    const testToken = () => {
        const token = localStorage.getItem('token');
        logWithTime("Test du token dans localStorage", { 
            hasToken: !!token, 
            tokenLength: token?.length,
            tokenStart: token ? token.substring(0, 20) + '...' : 'Pas de token'
        });

        // Décoder le token pour voir son contenu
        if (token) {
            const decodedToken = decodeToken(token);
            logWithTime("Contenu du token décodé", decodedToken);
        }

        // Tester une requête avec le token
        if (token) {
            logWithTime("Test d'une requête avec le token");
            fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                logWithTime("Réponse du test /auth/me", { 
                    status: response.status, 
                    ok: response.ok,
                    statusText: response.statusText
                });
                if (response.ok) {
                    return response.json();
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            })
            .then(data => {
                logWithTime("Données de l'utilisateur", data);
                toast({
                    title: 'Test réussi',
                    description: `Utilisateur: ${data.email} (${data.is_admin ? 'Admin' : 'Utilisateur'})`,
                });
            })
            .catch(error => {
                logWithTime("Erreur lors du test", error);
                toast({
                    title: 'Erreur de test',
                    description: 'Le token est invalide ou expiré.',
                    variant: 'destructive',
                });
            });
        } else {
            toast({
                title: 'Pas de token',
                description: 'Aucun token trouvé dans le localStorage.',
                variant: 'destructive',
            });
        }
    };

    // Fonction pour tester la connexion directe
    const testDirectLogin = async () => {
        logWithTime("Test de connexion directe");
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: 'zoran@reboul.com', 
                    password: 'nouveauMotDePasse123' 
                })
            });
            
            logWithTime("Réponse du test de connexion directe", { 
                status: response.status, 
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            logWithTime("Données de connexion directe", data);
            
            // Décoder le token pour voir son contenu
            const decodedToken = decodeToken(data.token);
            logWithTime("Token décodé", decodedToken);
            
            // Stocker le token manuellement
            localStorage.setItem('token', data.token);
            logWithTime("Token stocké dans localStorage", { 
                tokenLength: data.token.length,
                tokenStart: data.token.substring(0, 20) + '...'
            });
            
            toast({
                title: 'Connexion directe réussie',
                description: 'Token stocké dans localStorage.',
            });
            
            // Redirection manuelle
            logWithTime("Redirection manuelle", { 
                isAdmin: data.user.is_admin,
                destination: data.user.is_admin ? '/admin/dashboard' : '/'
            });
            
            // Utiliser setTimeout pour s'assurer que les logs sont affichés avant la redirection
            setTimeout(() => {
                setHasRedirected(true)
                if (data.user.is_admin) {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/';
                }
            }, 1000);
        } catch (error) {
            logWithTime("Erreur lors de la connexion directe", error);
            toast({
                title: 'Erreur de connexion directe',
                description: 'Impossible de se connecter directement.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen py-10">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>
                        Connectez-vous à votre compte pour accéder à votre espace personnel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="exemple@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                    <span className="sr-only">{showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}</span>
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                    </form>
                    
                    <div className="mt-4 flex space-x-2">
                        <Button variant="outline" onClick={testToken} className="flex-1">
                            Tester le token
                        </Button>
                        <Button variant="outline" onClick={testDirectLogin} className="flex-1">
                            Connexion directe
                        </Button>
                    </div>
                    
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

