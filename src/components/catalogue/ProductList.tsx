import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductList() {
    const {
        products,
        isLoading,
        error,
        page,
        limit,
        totalProducts,
        nextPage,
        prevPage,
    } = useProducts();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(limit)].map((_, index) => (
                    <Skeleton key={index} className="h-[300px] w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
                <Button onClick={prevPage} disabled={page === 1}>
                    Previous Page
                </Button>
                <span>
                    Page {page} of {Math.ceil(totalProducts / limit)}
                </span>
                <Button onClick={nextPage} disabled={page * limit >= totalProducts}>
                    Next Page
                </Button>
            </div>
        </div>
    );
}

