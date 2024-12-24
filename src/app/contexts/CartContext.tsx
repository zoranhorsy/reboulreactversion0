'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    image: string
}

interface OrderDetails {
    orderId: string;
    items: CartItem[];
    total: number;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    estimatedDelivery: string;
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
    total: number
    lastOrder: OrderDetails | null
    setLastOrder: (order: OrderDetails) => void
    clearLastOrder: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([])
    const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null)

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedLastOrder = localStorage.getItem('lastOrder')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
        if (savedLastOrder) {
            setLastOrder(JSON.parse(savedLastOrder))
        }
        console.log('CartProvider mounted, lastOrder:', savedLastOrder);
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
        console.log('Cart updated:', items)
    }, [items])

    useEffect(() => {
        if (lastOrder) {
            localStorage.setItem('lastOrder', JSON.stringify(lastOrder))
            console.log('Last order updated:', lastOrder)
        }
    }, [lastOrder])

    const addItem = (item: CartItem) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id)
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prevItems, { ...item, quantity: 1 }]
        })
    }

    const removeItem = (id: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id))
    }

    const updateQuantity = (id: number, quantity: number) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            )
        )
    }

    const clearCart = () => {
        console.log('Clearing cart')
        setItems([])
        localStorage.removeItem('cart')
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const setLastOrderWithStorage = (order: OrderDetails) => {
        setLastOrder(order)
        localStorage.setItem('lastOrder', JSON.stringify(order))
        console.log('Last order set:', order)
    }

    const clearLastOrder = () => {
        console.log('Clearing last order')
        setLastOrder(null)
        localStorage.removeItem('lastOrder')
    }

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            total,
            lastOrder,
            setLastOrder: setLastOrderWithStorage,
            clearLastOrder
        }}>
            {children}
        </CartContext.Provider>
    )
}

