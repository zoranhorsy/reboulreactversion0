import React from 'react';
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
import { fontSans } from '@/lib/fonts'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CloudinaryProvider } from '@/components/providers/CloudinaryProvider'
import PromoPopup from '@/components/PromoPopup'
import AnnouncementBar from '@/components/AnnouncementBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reboul',
  description: 'Administration Reboul',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
    userScalable: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </head>
            <body className={cn(
              "min-h-screen bg-background font-sans antialiased",
              "relative w-full max-w-[100vw] overflow-x-hidden",
              fontSans.variable
            )}>
                <div className="flex min-h-screen flex-col">
                    <AuthProvider>
                        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                            <CloudinaryProvider>
                                <CartProvider>
                                    <PromoProvider>
                                        <FavoritesProvider>
                                            <AnnouncementBar />
                                            <main className="flex-1">
                                                {children}
                                            </main>
                                            <Footer />
                                            <Dock />
                                            <Toaster />
                                            <PromoPopup 
                                                title="Offre Spéciale !"
                                                message="Profitez de 10% de réduction sur votre première commande avec le code BIENVENUE10"
                                                buttonText="Voir les offres"
                                                buttonLink="/catalogue"
                                            />
                                        </FavoritesProvider>
                                    </PromoProvider>
                                </CartProvider>
                            </CloudinaryProvider>
                        </ThemeProvider>
                    </AuthProvider>
                </div>
            </body>
        </html>
    )
}

