import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { WishlistProvider } from '@/app/contexts/WishlistContext'
import { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import GsapInitializer from '@/components/GsapInitializer'
import { Dock } from '@/components/Dock'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { ClientLayout } from '@/components/ClientLayout'
import { Loader } from '@/components/ui/Loader'

export const metadata: Metadata = {
    title: 'Reboul Store - Vêtements Premium à Marseille',
    description: 'Boutique de vêtements premium à Marseille, spécialisée dans Stone Island, CP Company et plus encore.',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className={GeistSans.className}>
        <body className="bg-background text-foreground">
        <ClientLayout>
            <AuthProvider>
                <WishlistProvider>
                    <CartProvider>
                        <Loader />
                        <GsapInitializer />
                        <Header />
                        <main className="container mx-auto px-4 py-8 mb-32">
                            {children}
                        </main>
                        <Dock />
                        <Footer />
                        <Toaster />
                    </CartProvider>
                </WishlistProvider>
            </AuthProvider>
        </ClientLayout>
        </body>
        </html>
    )
}

