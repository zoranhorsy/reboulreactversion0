'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(undefined)

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([])
    const [lastOrder, setLastOrder] = useState(null)
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

    const addItem = useCallback((item) => {
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

    const removeItem = useCallback((id) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }, [])

    const updateQuantity = useCallback((id, quantity) => {
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

    const setLastOrderWithStorage = useCallback((order) => {
        setLastOrder(order)
        localStorage.setItem('lastOrder', JSON.stringify(order))
    }, [])

    const clearLastOrder = useCallback(() => {
        setLastOrder(null)
        localStorage.removeItem('lastOrder')
    }, [])

    const contextValue = {
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

