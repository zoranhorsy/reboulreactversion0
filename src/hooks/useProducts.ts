import { useState, useEffect } from 'react';
import { api, type Product } from '@/lib/api';

interface UseProductsParams {
    featured?: boolean;
    category?: string;
    brand?: string;
    store_type?: 'adult' | 'kids' | 'sneakers';
}

export function useProducts(initialPage = 1, initialLimit = 10, params: UseProductsParams = {}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalProducts, setTotalProducts] = useState(0);

    const { featured, category, brand, store_type } = params;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await api.fetchProducts({ 
                    page: page.toString(), 
                    limit: limit.toString(),
                    ...(featured !== undefined ? { featured: featured.toString() } : {}),
                    ...(category ? { category } : {}),
                    ...(brand ? { brand } : {}),
                    ...(store_type ? { store_type } : {})
                });
                setProducts(response.products);
                setTotalProducts(response.total);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
                setProducts([]);
                setTotalProducts(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [page, limit, featured, category, brand, store_type]);

    const nextPage = () => {
        const totalPages = Math.ceil(totalProducts / limit);
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return {
        products,
        isLoading,
        error,
        page,
        limit,
        totalProducts,
        nextPage,
        prevPage
    };
}

