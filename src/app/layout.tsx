import React, { Suspense } from 'react';
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
import { cn } from '@/lib/utils'
import { fontSans, fontKernel, fontKernelOblique } from '@/lib/fonts'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { CloudinaryProvider } from '@/components/providers/CloudinaryProvider'
import PromoPopup from '@/components/PromoPopup'
import AnnouncementBar from '@/components/AnnouncementBar'
import GSAPProvider from '@/components/GsapProvider'
import { GsapInitializer } from '@/components/GsapInitializer'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { PageTransition } from '@/components/optimized/PageTransition'
import { RoutePrefetcher } from '@/components/optimized/RoutePrefetcher'
import { PerformanceMonitor, PerformanceProvider } from '@/utils/performance-monitoring'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ScriptErrorRecovery } from '@/components/ScriptErrorRecovery'

const inter = Inter({ 
    subsets: ['latin'],
    display: 'swap', // Optimisation du chargement des polices
})

export const metadata: Metadata = {
  title: 'Reboul',
  description: 'Administration Reboul',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning className={cn(
            fontSans.variable,
            fontKernel.variable,
            fontKernelOblique.variable
        )}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                {/* Preload des polices critiques */}
                <link
                    rel="preload"
                    href="/fonts/KernelRegular.ttf"
                    as="font"
                    type="font/ttf"
                    crossOrigin="anonymous"
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
                    
                    <AuthProvider>
                        <SWRProvider>
                            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                                <GSAPProvider>
                                    <GsapInitializer />
                                    <CloudinaryProvider>
                                        <CartProvider>
                                            <PromoProvider>
                                                <FavoritesProvider>
                                                    <PerformanceProvider>
                                                        {/* Prefetcher de routes */}
                                                        <RoutePrefetcher />

                                                        <ErrorBoundary>
                                                            <div className="relative flex flex-col flex-1">
                                                                <AnnouncementBar />
                                                                <main className="flex-1">
                                                                    {/* Transition entre les pages */}
                                                                    <Suspense fallback={<LoadingIndicator />}>
                                                                        <PageTransition>
                                                                            {children}
                                                                        </PageTransition>
                                                                    </Suspense>
                                                                </main>
                                                                <Footer />
                                                                <Dock />
                                                            </div>
                                                        </ErrorBoundary>
                                                        
                                                        <Toaster />
                                                        <PromoPopup 
                                                            title="Offre Spéciale !"
                                                            message="Profitez de 10% de réduction sur votre première commande avec le code BIENVENUE10"
                                                            buttonText="Voir les offres"
                                                            buttonLink="/catalogue"
                                                        />
                                                        <PerformanceMonitor />
                                                        <ScriptErrorRecovery />
                                                    </PerformanceProvider>
                                                </FavoritesProvider>
                                            </PromoProvider>
                                        </CartProvider>
                                    </CloudinaryProvider>
                                </GSAPProvider>
                            </ThemeProvider>
                        </SWRProvider>
                    </AuthProvider>
                </div>
            </body>
        </html>
    )
}

