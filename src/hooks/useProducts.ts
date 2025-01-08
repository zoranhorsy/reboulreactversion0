import { useState, useEffect, useCallback } from 'react';
import { api, Product } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast"

export function useProducts(initialPage = 1, initialLimit = 10) {
    const [products, setProducts] = useState<Product[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const loadProducts = useCallback(async (currentPage: number, currentLimit: number) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Loading products with page:', currentPage, 'and limit:', currentLimit); // Add this log
            const { products, total } = await api.fetchProducts({ page: currentPage, limit: currentLimit });
            setProducts(products);
            setTotalProducts(total);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products. Please try again.');
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to fetch products. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadProducts(page, limit);
    }, [page, limit, loadProducts]);

    const nextPage = useCallback(() => {
        if (page * limit < totalProducts) {
            setPage(prevPage => prevPage + 1);
        }
    }, [page, limit, totalProducts]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    }, [page]);

    return {
        products,
        totalProducts,
        isLoading,
        error,
        page,
        limit,
        nextPage,
        prevPage,
        setPage,
        setLimit,
    };
}

