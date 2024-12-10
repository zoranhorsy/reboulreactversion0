'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
    id: number
    name: string
    price: number
    quantity: number
    image: string
    size: string
    color: string
}

type CartContextType = {
    cartItems: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
    applyPromoCode: (code: string) => void
    promoCode: string
    discount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [promoCode, setPromoCode] = useState('')
    const [discount, setDiscount] = useState(0)

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCartItems(JSON.parse(savedCart))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (item: CartItem) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id && i.size === item.size && i.color === item.color)
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id && i.size === item.size && i.color === item.color
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                )
            }
            return [...prevItems, item]
        })
    }

    const removeFromCart = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id))
    }

    const updateQuantity = (id: number, quantity: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
        setPromoCode('')
        setDiscount(0)
    }

    const applyPromoCode = (code: string) => {
        if (code.toLowerCase() === 'reboul10') {
            const discountAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) * 0.1
            setDiscount(discountAmount)
            setPromoCode(code)
        } else {
            setDiscount(0)
            setPromoCode('')
        }
    }

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            applyPromoCode,
            promoCode,
            discount
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

