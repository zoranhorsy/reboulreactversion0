'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type WishlistItem = {
    id: number
    name: string
    price: number
    image: string
}

type WishlistContextType = {
    wishlistItems: WishlistItem[]
    addToWishlist: (item: WishlistItem) => void
    removeFromWishlist: (id: number) => void
    isInWishlist: (id: number) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
    }, [wishlistItems])

    const addToWishlist = (item: WishlistItem) => {
        setWishlistItems(prevItems => {
            if (!prevItems.some(i => i.id === item.id)) {
                return [...prevItems, item]
            }
            return prevItems
        })
    }

    const removeFromWishlist = (id: number) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== id))
    }

    const isInWishlist = (id: number) => {
        return wishlistItems.some(item => item.id === id)
    }

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}

