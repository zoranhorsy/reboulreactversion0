import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import Footer from '@/components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { WishlistProvider } from '@/app/contexts/WishlistContext'
import { Metadata } from 'next'
import { GeistSans } from 'geist/font'
import GsapInitializer from '@/components/GsapInitializer'
import { Dock } from '@/components/Dock'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { DynamicBodyAttributes } from '@/components/DynamicBodyAttributes'
import { Loader } from '@/components/ui/Loader'

export const metadata: Metadata = {
    title: 'Reboul Store - Vêtements Premium à Marseille',
    description: 'Boutique de vêtements premium à Marseille, spécialisée dans Stone Island, CP Company et plus encore.',
    icons: {
        icon: '/logo_black.png',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" className={GeistSans.className}>
        <body>
        <DynamicBodyAttributes>
            <AuthProvider>
                <WishlistProvider>
                    <CartProvider>
                        <Loader />
                        <GsapInitializer />
                        <main className="container mx-auto">
                            {children}
                        </main>
                        <Dock />
                        <Footer />
                        <Toaster />
                    </CartProvider>
                </WishlistProvider>
            </AuthProvider>
        </DynamicBodyAttributes>
        </body>
        </html>
    )
}

