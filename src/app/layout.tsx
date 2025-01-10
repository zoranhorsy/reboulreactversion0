import '@/app/globals.css'
import { Toaster } from "@/components/ui/toaster"
import Footer from '@/components/Footer'
import { CartProvider } from '@/app/contexts/CartContext'
import { WishlistProvider } from '@/app/contexts/WishlistContext'
import { GeistSans } from 'geist/font'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { Dock } from '@/components/Dock'
import './fonts.css'

export default function RootLayout({ children }) {
    return (
        <html lang="fr" className={GeistSans.className}>
            <body className="flex flex-col min-h-screen">
                <AuthProvider>
                    <WishlistProvider>
                        <CartProvider>
                            <main className="container mx-auto flex-grow">
                                {children}
                            </main>
                            <Footer />
                            <Dock />
                            <Toaster />
                        </CartProvider>
                    </WishlistProvider>
                </AuthProvider>
            </body>
        </html>
    )
}

