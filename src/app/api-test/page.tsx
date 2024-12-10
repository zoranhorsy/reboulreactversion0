'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function ApiTest() {
    const [products, setProducts] = useState([])
    const [error, setError] = useState('')

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setProducts(data)
            setError('')
        } catch (e) {
            setError('Failed to fetch products: ' + e.message)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const addProduct = async () => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test Product',
                    price: 99.99,
                    stock: 10,
                    description: 'This is a test product',
                    category: 'Test',
                    brand: 'Test Brand',
                    image: '/placeholder.svg'
                }),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            await fetchProducts()
        } catch (e) {
            setError('Failed to add product: ' + e.message)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">API Test</h1>
            <Button onClick={fetchProducts} className="mb-4">Fetch Products</Button>
            <Button onClick={addProduct} className="mb-4 ml-2">Add Test Product</Button>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(products, null, 2)}
      </pre>
        </div>
    )
}

