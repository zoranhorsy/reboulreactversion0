import React, { Suspense, lazy } from 'react';
import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import Footer from '@/components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { Dock } from '@/components/Dock'
import { ThemeProvider } from 'next-themes'
import './fonts.css'
import { FavoritesProvider } from '@/app/contexts/FavoritesContext'
import { PromoProvider } from '@/app/contexts/PromoContext'
import { PriorityProvider } from '@/app/contexts/PriorityContext'
import { cn } from '@/lib/utils'
import { fontSans, fontKernel, fontKernelOblique } from '@/lib/fonts'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { CloudinaryProvider } from '@/components/providers/CloudinaryProvider'
import AnnouncementBar from '@/components/AnnouncementBar'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { PageTransition } from '@/components/optimized/PageTransition'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ScriptErrorRecovery } from '@/components/ScriptErrorRecovery'
import dynamic from 'next/dynamic'

// Utilisation de preload pour les polices
const inter = Inter({ 
    subsets: ['latin'],
    display: 'swap',
    preload: true,
})

// Chargement dynamique des composants non-critiques pour le rendu initial
const DynamicPromoPopup = dynamic(() => import('@/components/PromoPopup'), {
  ssr: false,
  loading: () => null,
})

// Chargement différé des composants non-critiques pour l'expérience utilisateur initiale
const GSAPProvider = dynamic(() => import('@/components/GsapProvider'), {
  ssr: true, 
})

const GsapInitializer = dynamic(() => import('@/components/GsapInitializer').then(mod => ({ default: mod.GsapInitializer })), {
  ssr: false,
})

const RoutePrefetcher = dynamic(() => import('@/components/optimized/RoutePrefetcher').then(mod => ({ default: mod.RoutePrefetcher })), {
  ssr: false,
})

const WebVitalsMonitor = dynamic(() => import('@/components/performance/WebVitalsMonitor').then(mod => ({ default: mod.WebVitalsMonitor })), {
  ssr: false,
})

const PerformanceProvider = dynamic(() => import('@/utils/performance-monitoring').then(mod => ({ default: mod.PerformanceProvider })), {
  ssr: false,
})

// Chargement du moniteur d'hydratation uniquement en développement
const HydrationMonitorComponent = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('@/utils/hydration-monitor').then(mod => ({ default: mod.HydrationMonitor })), {
      ssr: false,
    })
  : () => null

// Metadata optimisée
export const metadata: Metadata = {
  title: 'Reboul Store',
  description: 'Boutique en ligne de vêtements premium',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

// Configuration du viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' }
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning className={cn(
            fontSans.variable,
            fontKernel.variable,
            fontKernelOblique.variable
        )}>
            <head>
                {/* Préchargement des ressources critiques pour le LCP */}
                <link 
                    rel="preload" 
                    href="/fonts/main-font.woff2" 
                    as="font" 
                    type="font/woff2" 
                    crossOrigin="anonymous" 
                />
                <link
                    rel="preload"
                    href="/images/logotype_w.png"
                    as="image"
                    type="image/png"
                />
                <link
                    rel="preload"
                    href="/images/logotype_b.png"
                    as="image"
                    type="image/png"
                />
                <link
                    rel="preconnect"
                    href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com"
                />
                {/* Ajout d'un script pour éviter les erreurs d'hydratation liées au changement de thème */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                            try {
                                // Éviter les erreurs d'hydratation liées au thème
                                const savedTheme = localStorage.getItem('theme') || 'system';
                                document.documentElement.setAttribute('data-theme', savedTheme);
                                
                                // Vérification préalable du thème système
                                if (savedTheme === 'system') {
                                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    document.documentElement.classList.toggle('dark', isDark);
                                } else {
                                    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
                                }
                            } catch (e) {
                                // Fallback silencieux
                            }
                        })();
                        `
                    }}
                />
            </head>
            <body className={cn(
                "min-h-screen font-sans antialiased",
                "relative w-full max-w-[100vw] overflow-x-hidden",
                "bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950",
                "text-zinc-900 dark:text-zinc-100",
                fontSans.variable
            )}>
                <div className="relative flex min-h-screen flex-col">
                    {/* Fond avec motif subtil */}
                    <div className="absolute inset-0 bg-grid-zinc-900/[0.02] dark:bg-grid-zinc-100/[0.02] -z-10" />
                    
                    {/* Effet de grain */}
                    <div className="absolute inset-0 bg-noise opacity-20 dark:opacity-30 -z-10" />
                    
                    <ErrorBoundary>
                        <SWRProvider>
                            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                                <AuthProvider>
                                    <CartProvider>
                                        <FavoritesProvider>
                                            <PromoProvider>
                                                <PriorityProvider>
                                                    <CloudinaryProvider>
                                                        <Suspense fallback={null}>
                                                            <GSAPProvider>
                                                                <Suspense fallback={null}>
                                                                    <GsapInitializer />
                                                                </Suspense>
                                                                
                                                                <div className="relative flex flex-col flex-1">
                                                                    <AnnouncementBar />
                                                                    <main className="flex-1">
                                                                        {/* Transition entre les pages avec Suspense */}
                                                                        <Suspense fallback={<LoadingIndicator />}>
                                                                            <PageTransition>
                                                                                {children}
                                                                            </PageTransition>
                                                                        </Suspense>
                                                                    </main>
                                                                    <Footer />
                                                                    <Dock />
                                                                </div>
                                                                
                                                                <Toaster />
                                                                
                                                                {/* Chargement différé des éléments non-critiques */}
                                                                <Suspense fallback={null}>
                                                                    <DynamicPromoPopup 
                                                                        title="Offre Spéciale !"
                                                                        message="Profitez de 10% de réduction sur votre première commande avec le code BIENVENUE10"
                                                                        buttonText="Voir les offres"
                                                                        buttonLink="/catalogue"
                                                                    />
                                                                </Suspense>
                                                                
                                                                <ScriptErrorRecovery />
                                                                
                                                                {/* Composants chargés en dernier */}
                                                                <Suspense fallback={null}>
                                                                    <PerformanceProvider>
                                                                        <Suspense fallback={null}>
                                                                            <WebVitalsMonitor />
                                                                        </Suspense>
                                                                    </PerformanceProvider>
                                                                </Suspense>
                                                                
                                                                {/* Prefetcher de routes - chargé en dernier */}
                                                                <Suspense fallback={null}>
                                                                    <RoutePrefetcher />
                                                                </Suspense>
                                                                
                                                                {/* Moniteur d'hydratation (uniquement en développement) */}
                                                                {process.env.NODE_ENV !== 'production' && (
                                                                    <HydrationMonitorComponent />
                                                                )}
                                                            </GSAPProvider>
                                                        </Suspense>
                                                    </CloudinaryProvider>
                                                </PriorityProvider>
                                            </PromoProvider>
                                        </FavoritesProvider>
                                    </CartProvider>
                                </AuthProvider>
                            </ThemeProvider>
                        </SWRProvider>
                    </ErrorBoundary>
                </div>
            </body>
        </html>
    )
}

