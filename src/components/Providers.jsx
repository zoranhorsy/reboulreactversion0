'use client'

import { AuthProvider } from '@/app/contexts/AuthContext'
import { WishlistProvider } from '@/app/contexts/WishlistContext'
import { CartProvider } from '@/app/contexts/CartContext'
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }) {
    return (
        <AuthProvider>
            <WishlistProvider>
                <CartProvider>
                    {children}
                    <Toaster />
                </CartProvider>
            </WishlistProvider>
        </AuthProvider>
    )
}

