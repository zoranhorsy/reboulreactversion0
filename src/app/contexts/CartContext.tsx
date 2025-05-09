'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useCartWorker, CartTotal } from '../../hooks/useCartWorker'

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
  subtotal: number;
  shipping: number;
  discount: number;
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails) => void;
  clearLastOrder: () => void;
  itemCount: number;
  openCart: () => void;
  isCartLoading: boolean;
  applyDiscountCode: (code: string) => void;
  removeDiscountCode: () => void;
  setShippingMethod: (method: 'standard' | 'express' | 'pickup') => void;
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
    const [cartTotals, setCartTotals] = useState<CartTotal>({
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
    })
    const [discountCode, setDiscountCode] = useState<string | undefined>(undefined)
    const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard')

    // Intégration du cartWorker
    const { calculateCartTotals, isLoading: isCartLoading, error: cartError } = useCartWorker()

    // Chargement initial du panier depuis localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        const savedLastOrder = localStorage.getItem('lastOrder')
        const savedDiscountCode = localStorage.getItem('discountCode')
        const savedShippingMethod = localStorage.getItem('shippingMethod') as 'standard' | 'express' | 'pickup' | null
        
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
        if (savedLastOrder) {
            setLastOrder(JSON.parse(savedLastOrder))
        }
        if (savedDiscountCode) {
            setDiscountCode(savedDiscountCode)
        }
        if (savedShippingMethod) {
            setShippingMethod(savedShippingMethod)
        }
        
        setIsInitialized(true)
    }, [])

    // Synchronisation des changements avec localStorage
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

    useEffect(() => {
        if (isInitialized) {
            if (discountCode) {
                localStorage.setItem('discountCode', discountCode)
            } else {
                localStorage.removeItem('discountCode')
            }
        }
    }, [discountCode, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('shippingMethod', shippingMethod)
        }
    }, [shippingMethod, isInitialized])

    // Utilisation du cartWorker pour calculer les totaux
    useEffect(() => {
        const updateCartTotals = async () => {
            try {
                const options = {
                    discountCode,
                    shippingMethod
                }
                
                const totals = await calculateCartTotals(items, options)
                setCartTotals(totals)
            } catch (error) {
                console.error('Erreur lors du calcul des totaux du panier:', error)
            }
        }
        
        updateCartTotals()
    }, [items, discountCode, shippingMethod, calculateCartTotals])

    const addItem = useCallback((item: CartItem) => {
        try {
            console.log("CartContext - Adding item to cart:", item);
            let success = true;
            let errorMessage = '';
            
            setItems((prevItems) => {
                const existingItem = prevItems.find((i) => i.id === item.id)
                console.log("CartContext - Existing item:", existingItem);
                
                if (existingItem) {
                    const newQuantity = existingItem.quantity + item.quantity
                    if (newQuantity > existingItem.variant.stock) {
                        errorMessage = `Stock insuffisant. Seulement ${existingItem.variant.stock} unité(s) disponible(s) et vous en avez déjà ${existingItem.quantity} dans votre panier.`;
                        success = false;
                        // Retourner l'état précédent sans modification
                        return prevItems;
                    }
                    console.log("CartContext - Updating existing item quantity:", newQuantity);
                    return prevItems.map((i) =>
                        i.id === item.id ? { ...i, quantity: newQuantity } : i
                    )
                }
                
                if (item.quantity > item.variant.stock) {
                    errorMessage = `Stock insuffisant. Seulement ${item.variant.stock} unité(s) disponible(s).`;
                    success = false;
                    // Retourner l'état précédent sans modification
                    return prevItems;
                }
                
                console.log("CartContext - Adding new item to cart");
                return [...prevItems, item]
            })
            
            if (!success) {
                // Utilisez toast au lieu de throw pour afficher l'erreur sans interrompre l'exécution
                console.error("Stock error:", errorMessage);
                throw new Error(errorMessage);
            }
            
            return { success: true };
        } catch (error) {
            console.error("Error adding item to cart:", error);
            throw error;
        }
    }, [])

    const removeItem = useCallback((id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }, [])

    const updateQuantity = useCallback((id: string, quantity: number) => {
        try {
            let success = true;
            let errorMessage = '';
            
            setItems((prevItems) => {
                const item = prevItems.find((i) => i.id === id)
                if (!item) return prevItems;

                if (quantity > item.variant.stock) {
                    errorMessage = `Stock insuffisant. Seulement ${item.variant.stock} unité(s) disponible(s).`;
                    success = false;
                    // Retourner l'état précédent sans modification
                    return prevItems;
                }

                return prevItems.map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
                );
            });
            
            if (!success) {
                // Utilisez toast ou throw selon le contexte
                console.error("Stock error:", errorMessage);
                throw new Error(errorMessage);
            }
            
            return { success: true };
        } catch (error) {
            console.error("Error updating quantity:", error);
            throw error;
        }
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
        localStorage.removeItem('cart')
    }, [])

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

    const applyDiscountCode = useCallback((code: string) => {
        setDiscountCode(code)
    }, [])

    const removeDiscountCode = useCallback(() => {
        setDiscountCode(undefined)
    }, [])

    const handleSetShippingMethod = useCallback((method: 'standard' | 'express' | 'pickup') => {
        setShippingMethod(method)
    }, [])

    // Utilisation de cartTotals calculés par le worker plutôt que de recalculer à chaque rendu
    const contextValue = useMemo<CartContextType>(() => ({
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total: cartTotals.total,
        subtotal: cartTotals.subtotal,
        shipping: cartTotals.shipping,
        discount: cartTotals.discount,
        lastOrder,
        setLastOrder: setLastOrderWithStorage,
        clearLastOrder,
        itemCount: cartTotals.itemCount,
        openCart,
        isCartLoading,
        applyDiscountCode,
        removeDiscountCode,
        setShippingMethod: handleSetShippingMethod,
    }), [
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        cartTotals, 
        lastOrder, 
        setLastOrderWithStorage, 
        clearLastOrder, 
        openCart, 
        isCartLoading,
        applyDiscountCode,
        removeDiscountCode,
        handleSetShippingMethod
    ])

    // Afficher les erreurs du worker si nécessaire
    useEffect(() => {
        if (cartError) {
            console.error('CartWorker error:', cartError)
        }
    }, [cartError])

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

