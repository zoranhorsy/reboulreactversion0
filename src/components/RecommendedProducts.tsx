import { useState, useEffect } from 'react'
import { ProductCard } from './products/ProductCard'
import { Product, fetchProducts } from '@/lib/api'

interface RecommendedProductsProps {
    currentProductId: string
    category: string
}

export function RecommendedProducts({ currentProductId, category }: RecommendedProductsProps) {
    console.log('RecommendedProducts props:', { currentProductId, category });
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            setIsLoading(true)
            setError(null)
            try {
                console.log('Fetching recommended products for category:', category);
                const { products: allProducts } = await fetchProducts({ categories: category })
                console.log('All fetched products:', allProducts);

                if (!Array.isArray(allProducts)) {
                    throw new Error('Fetched products is not an array')
                }

                const filtered = allProducts.filter(product => product.id !== currentProductId);
                console.log('Filtered products:', filtered);
                const shuffled = filtered.sort(() => 0.5 - Math.random())
                console.log('Shuffled products:', shuffled);
                setRecommendedProducts(shuffled.slice(0, 4))
            } catch (error) {
                console.error('Error fetching recommended products:', error)
                setError('Unable to load recommended products. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecommendedProducts()
    }, [currentProductId, category])

    if (isLoading) {
        return <div>Chargement des produits recommandés...</div>
    }

    if (error) {
        return <div>Erreur : {error}</div>
    }

    if (recommendedProducts.length === 0) {
        return <div>Aucun produit recommandé disponible pour le moment.</div>;
    }

    console.log('Recommended products to render:', recommendedProducts);
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Produits recommandés</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

