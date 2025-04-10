'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    colorLabel: string;
    stock: number;
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
  openCart: () => void;
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
        try {
            console.log("CartContext - Adding item to cart:", item);
            setItems((prevItems) => {
                const existingItem = prevItems.find((i) => i.id === item.id)
                console.log("CartContext - Existing item:", existingItem);
                if (existingItem) {
                    const newQuantity = existingItem.quantity + item.quantity
                    if (newQuantity > existingItem.variant.stock) {
                        throw new Error(`Stock insuffisant. Seulement ${existingItem.variant.stock} unité(s) disponible(s).`)
                    }
                    console.log("CartContext - Updating existing item quantity:", newQuantity);
                    return prevItems.map((i) =>
                        i.id === item.id ? { ...i, quantity: newQuantity } : i
                    )
                }
                if (item.quantity > item.variant.stock) {
                    throw new Error(`Stock insuffisant. Seulement ${item.variant.stock} unité(s) disponible(s).`)
                }
                console.log("CartContext - Adding new item to cart");
                return [...prevItems, item]
            })
        } catch (error) {
            console.error("Error adding item to cart:", error)
            throw error
        }
    }, [])

    const removeItem = useCallback((id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        try {
            setItems((prevItems) => {
                const item = prevItems.find((i) => i.id === id)
                if (!item) return prevItems

                if (quantity > item.variant.stock) {
                    throw new Error(`Stock insuffisant. Seulement ${item.variant.stock} unité(s) disponible(s).`)
                }

                return prevItems.map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
                )
            })
        } catch (error) {
            console.error("Error updating quantity:", error)
            throw error
        }
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

    const openCart = useCallback(() => {
        const event = new CustomEvent('openCart')
        window.dispatchEvent(event)
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
        openCart,
    }

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

