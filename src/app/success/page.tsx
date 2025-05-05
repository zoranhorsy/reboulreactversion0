'use client'




// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from '@/app/config';
import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingBag, Mail, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import confetti from 'canvas-confetti'

export const viewport: Viewport = defaultViewport;

export default function SuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Lance le confetti à l'arrivée sur la page
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })

        // Vérifie si on a des informations de commande dans le localStorage
        const orderData = localStorage.getItem('lastOrder')
        if (!orderData) {
            // Si pas de commande, redirige vers l'accueil
            router.push('/')
        }
    }, [router])

    return ((
    <ClientPageWrapper>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card>
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="flex justify-center mb-4"
                        >
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        </motion.div>
                        <CardTitle className="text-2xl sm:text-3xl">Commande confirmée !</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Merci pour votre commande. Nous vous enverrons un email de confirmation avec les détails.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 text-muted-foreground"
                        >
                            <Mail className="h-5 w-5" />
                            <p>Un email de confirmation a été envoyé à votre adresse.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 text-muted-foreground"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <p>Vous pouvez suivre votre commande dans votre espace client.</p>
                        </motion.div>

                        <Separator className="my-6" />

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Numéro de commande</p>
                            <p className="font-mono text-lg">#ORDER-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>

                        <p className="text-muted-foreground">
                            Votre commande a été confirmée. Vous recevrez un email dès qu&apos;elle sera expédiée.
                        </p>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        <Button 
                            className="w-full sm:w-auto"
                            onClick={() => router.push('/profil')}
                        >
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Voir mes commandes
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full sm:w-auto"
                            onClick={() => router.push('/')}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Retour à l&apos;accueil
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    </ClientPageWrapper>
  ))
} 