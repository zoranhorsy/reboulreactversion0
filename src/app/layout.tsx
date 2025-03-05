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
import { cn } from '@/lib/utils'
import { fontSans } from '@/lib/fonts'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CloudinaryProvider } from '@/components/providers/CloudinaryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Reboul',
  description: 'Administration Reboul',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head />
            <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
                <AuthProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <CloudinaryProvider>
                            <CartProvider>
                                <FavoritesProvider>
                                    {children}
                                    <Footer />
                                    <Dock />
                                    <Toaster />
                                </FavoritesProvider>
                            </CartProvider>
                        </CloudinaryProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}

