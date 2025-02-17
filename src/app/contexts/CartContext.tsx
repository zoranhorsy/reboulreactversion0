'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface OrderDetails {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  items: CartItem[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails) => void;
  clearLastOrder: () => void;
  itemCount: number;
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
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedLastOrder = localStorage.getItem('lastOrder')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
        if (savedLastOrder) {
            setLastOrder(JSON.parse(savedLastOrder))
        }
        setIsInitialized(true)
    }, [])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, isInitialized])

    useEffect(() => {
        if (isInitialized && lastOrder) {
            localStorage.setItem('lastOrder', JSON.stringify(lastOrder))
        }
    }, [lastOrder, isInitialized])

    const addItem = useCallback((item: CartItem) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id)
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, quantity: +(i.quantity + item.quantity).toFixed(2) } : i
                )
            }
            return [...prevItems, { ...item, quantity: +item.quantity.toFixed(2) }]
        })
    }, [])

    const removeItem = useCallback((id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
            )
        )
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
        localStorage.removeItem('cart')
    }, [])

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const setLastOrderWithStorage = useCallback((order: OrderDetails) => {
        setLastOrder(order)
        localStorage.setItem('lastOrder', JSON.stringify(order))
    }, [])

    const clearLastOrder = useCallback(() => {
        setLastOrder(null)
        localStorage.removeItem('lastOrder')
    }, [])

    const contextValue: CartContextType = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        lastOrder,
        setLastOrder: setLastOrderWithStorage,
        clearLastOrder,
        itemCount,
    }

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

