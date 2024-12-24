import { useState, useEffect, useCallback, useRef } from 'react'
import { Product, fetchProducts } from '@/lib/api'

interface UseProductsReturn {
    products: Product[] | null
    isLoading: boolean
    error: Error | null
    total: number
}

export function useProducts(params: Record<string, string> = {}): UseProductsReturn {
    const [products, setProducts] = useState<Product[] | null>(null)
    const [total, setTotal] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)
    const prevParamsRef = useRef<string>('')

    const loadProducts = useCallback(async () => {
        const paramsString = JSON.stringify(params)
        if (paramsString === prevParamsRef.current && products !== null) {
            return
        }
        prevParamsRef.current = paramsString

        console.log("useProducts: Loading products with params:", params)
        try {
            setIsLoading(true)
            const { products: fetchedProducts, total } = await fetchProducts(params)
            console.log("useProducts: Fetched products:", JSON.stringify(fetchedProducts, null, 2))

            if (!Array.isArray(fetchedProducts)) {
                throw new Error('Fetched products is not an array')
            }

            // Validate each product
            const validatedProducts = fetchedProducts.map((product, index) => {
                if (typeof product !== 'object' || product === null) {
                    console.error(`Invalid product at index ${index}:`, product)
                    return null
                }
                return product
            }).filter((product): product is Product => product !== null)

            setProducts(validatedProducts)
            setTotal(total)
            setError(null)
        } catch (err) {
            console.error('useProducts: Error fetching products:', err)
            setError(err instanceof Error ? err : new Error('An error occurred while fetching products'))
            setProducts(null)
        } finally {
            setIsLoading(false)
        }
    }, [params])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    return { products, isLoading, error, total }
}

