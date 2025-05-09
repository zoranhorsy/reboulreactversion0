'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { Button } from "@/components/ui/button"
import { Home, Search, ShoppingBag, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NotFoundContent() {
    const [randomTip, setRandomTip] = useState('')
    
    useEffect(() => {
        const tips = [
            "Essayez de chercher par marque plutôt que par nom de produit",
            "Consultez nos nouveautés pour découvrir les dernières tendances",
            "Les produits populaires sont souvent en rupture de stock",
            "Filtrez par taille pour affiner vos résultats",
            "Nos conseillers peuvent vous aider à trouver ce que vous cherchez"
        ]
        
        setRandomTip(tips[Math.floor(Math.random() * tips.length)])
    }, [])
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Contenu principal */}
            <div className="flex-1 flex flex-col px-4 py-4 max-w-md mx-auto text-center justify-center items-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative mb-8 w-20 h-20 md:w-24 md:h-24"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-foreground">
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
                    <h1 className="text-3xl font-light mb-4 tracking-wide uppercase">Page introuvable</h1>
                    <p className="text-muted-foreground mb-6">
                        La page que vous recherchez n&apos;existe pas ou a été déplacée.
                    </p>
                    
                    <div className="p-4 my-6 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm italic text-muted-foreground">{randomTip}</p>
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
                        className="gap-2 h-12 font-light tracking-wide"
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
                            className="gap-2 h-12 font-light tracking-wide"
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
                            className="gap-2 h-12 font-light tracking-wide"
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
                        className="gap-2 h-12 font-light tracking-wide"
                    >
                        <Link href="/contact">
                            <MessageSquare className="w-4 h-4" />
                            BESOIN D&apos;AIDE?
                        </Link>
                    </Button>
                </motion.div>
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