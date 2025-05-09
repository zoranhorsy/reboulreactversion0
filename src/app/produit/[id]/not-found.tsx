'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Search, ShoppingBag, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

// Le composant reste client uniquement, mais nous utilisons Suspense dans les pages
export default function ProductNotFound() {
    const [randomTip, setRandomTip] = useState('')
    const [mounted, setMounted] = useState(false)
    const { theme, resolvedTheme } = useTheme()
    
    useEffect(() => {
        const tips = [
            "Essayez de chercher par marque plutôt que par nom de produit",
            "Consultez nos nouveautés pour découvrir les dernières tendances",
            "Les produits populaires sont souvent en rupture de stock",
            "Filtrez par taille pour affiner vos résultats",
            "Nos conseillers peuvent vous aider à trouver ce que vous cherchez"
        ]
        
        setRandomTip(tips[Math.floor(Math.random() * tips.length)])
        setMounted(true)
        
        // Log pour débogage
        console.log('Thème actuel:', theme)
        console.log('Thème résolu:', resolvedTheme)
    }, [theme, resolvedTheme])
    
    // Déterminer le logo à utiliser en fonction du thème
    const logoSrc = mounted && (theme === 'dark' || resolvedTheme === 'dark') 
        ? "/logo_w.png" 
        : "/logo_black.png"
        
    // Log pour débogage
    console.log('Logo source:', logoSrc)
    
    return (
        <div className="flex flex-col min-h-screen bg-background dark:bg-black text-foreground dark:text-white">
            {/* En-tête de navigation */}
            <div className="sticky top-0 z-50 w-full h-14 border-b border-border dark:border-zinc-800 bg-background/80 dark:bg-black/80 backdrop-blur-md flex items-center px-4">
                <Link href="/catalogue" className="inline-flex items-center text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Retour</span>
                </Link>
            </div>
            
            {/* Logo Reboul */}
            <div className="w-full flex justify-center mt-16 mb-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-40 h-40"
                >
                    {mounted && (
                        <Image 
                            src={logoSrc}
                            alt="Reboul Logo"
                            width={160}
                            height={160}
                            className="object-contain"
                            priority
                            onError={(e) => {
                                // Fallback si l'image n'existe pas
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                        />
                    )}
                </motion.div>
            </div>
            
            {/* Contenu principal */}
            <div className="flex-1 flex flex-col px-4 py-4 max-w-md mx-auto text-center justify-center items-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative mb-8 w-20 h-20 md:w-24 md:h-24"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-foreground dark:stroke-white">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray="5,5"
                            className="animate-spin-slow"
                        />
                        <text x="50" y="55" fontSize="28" fill="currentColor" textAnchor="middle" alignmentBaseline="middle">404</text>
                    </svg>
                </motion.div>
                
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h1 className="text-3xl font-light mb-4 tracking-wide uppercase">Produit introuvable</h1>
                    <p className="text-muted-foreground dark:text-zinc-400 mb-6">
                        L&apos;article que vous recherchez n&apos;est pas disponible ou n&apos;existe plus dans notre catalogue.
                    </p>
                    
                    <div className="p-4 my-6 bg-muted/50 dark:bg-zinc-900/50 rounded-lg border border-border dark:border-zinc-800">
                        <p className="text-sm italic text-muted-foreground dark:text-zinc-400">{randomTip}</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="grid gap-4 w-full mt-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <Button 
                        asChild 
                        size="lg" 
                        className="gap-2 h-12 font-light tracking-wide dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        <Link href="/catalogue">
                            <Search className="w-4 h-4" />
                            EXPLORER LE CATALOGUE
                        </Link>
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            asChild 
                            variant="outline" 
                            size="lg" 
                            className="gap-2 h-12 font-light tracking-wide dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                        >
                            <Link href="/">
                                <Home className="w-4 h-4" />
                                ACCUEIL
                            </Link>
                        </Button>
                        
                        <Button 
                            asChild 
                            variant="outline" 
                            size="lg" 
                            className="gap-2 h-12 font-light tracking-wide dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                        >
                            <Link href="/panier">
                                <ShoppingBag className="w-4 h-4" />
                                PANIER
                            </Link>
                        </Button>
                    </div>
                    
                    <Button 
                        asChild 
                        variant="outline" 
                        size="lg" 
                        className="gap-2 h-12 font-light tracking-wide dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-white dark:hover:text-white"
                    >
                        <Link href="/contactez-nous">
                            <MessageSquare className="w-4 h-4" />
                            BESOIN D&apos;AIDE?
                        </Link>
                    </Button>
                </motion.div>
            </div>
            
            {/* Pied de page */}
            <div className="mt-auto pt-10">
                <div className="text-center text-xs uppercase tracking-widest text-muted-foreground dark:text-zinc-500 mb-4">
                    <p>CONCEPT STORE</p>
                </div>
                
                <footer className="py-6 border-t border-border dark:border-zinc-800 text-center text-sm text-muted-foreground dark:text-zinc-500">
                    <p>© 2025 Reboul. Tous droits réservés</p>
                </footer>
            </div>
            
            {/* Style pour l'animation lente */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 25s linear infinite;
                }
            `}</style>
        </div>
    )
}

