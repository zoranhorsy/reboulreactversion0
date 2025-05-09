import { useState, useEffect } from 'react';
import { api, type Product } from '@/lib/api';

interface UseProductsParams {
    featured?: boolean;
    category?: string;
    brand?: string;
    store_type?: 'adult' | 'kids' | 'sneakers';
    fields?: string[]; // Liste des champs à récupérer pour optimiser la taille de la réponse
}

export function useProducts(initialPage = 1, initialLimit = 10, params: UseProductsParams = {}) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const { featured, category, brand, store_type, fields } = params;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const requestParams: Record<string, string> = { 
                    page: page.toString(), 
                    limit: limit.toString(),
                    ...(featured !== undefined ? { featured: featured.toString() } : {}),
                    ...(category ? { category } : {}),
                    ...(brand ? { brand } : {}),
                    ...(store_type ? { store_type } : {})
                };
                
                // Ajouter le paramètre fields si spécifié pour optimiser la taille de la réponse
                if (fields && fields.length > 0) {
                    requestParams.fields = fields.join(',');
                }
                
                const response = await api.fetchProducts(requestParams);
                setProducts(response.products);
                setTotalProducts(response.total);
                setTotalPages(response.totalPages);
                setCurrentPage(response.currentPage);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err instanceof Error ? err.message : 'An error occurred while fetching products');
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(0);
                setCurrentPage(1);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [page, limit, featured, category, brand, store_type, fields]);

    const nextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setPage(pageNumber);
        }
    };

    return {
        products,
        isLoading,
        error,
        page,
        limit,
        totalProducts,
        totalPages,
        currentPage,
        nextPage,
        prevPage,
        goToPage
    };
}

