import { useState, useCallback, useEffect } from 'react'
import { Product } from '@/lib/api'

export function useCart() {
    const [cart, setCart] = useState<Product[]>([])

    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    const addToCart = useCallback((product: Product) => {
        setCart(prevCart => {
            const updatedCart = [...prevCart, product]
            localStorage.setItem('cart', JSON.stringify(updatedCart))
            return updatedCart
        })
        console.log('Produit ajouté au panier:', product)
    }, [])

    const removeFromCart = useCallback((productId: number) => {
        setCart(prevCart => {
            const updatedCart = prevCart.filter(item => String(item.id) !== String(productId))
            localStorage.setItem('cart', JSON.stringify(updatedCart))
            return updatedCart
        })
    }, [])

    return { cart, addToCart, removeFromCart }
}

