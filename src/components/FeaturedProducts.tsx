import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

export function FeaturedProducts() {
    const { products, isLoading, error } = useProducts(1, 4); // Fetch 4 featured products

    console.log('FeaturedProducts render:', { products, isLoading, error });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-[350px] w-full rounded-lg bg-gray-200 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-8">
                <p className="text-lg font-semibold">Erreur lors du chargement des produits en vedette</p>
                <p className="text-sm mt-2">{error}</p>
            </div>
        );
    }

    if (!Array.isArray(products) || products.length === 0) {
        return (
            <div className="text-gray-500 text-center py-8">
                <p className="text-lg font-semibold">Aucun produit en vedette disponible</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Produits en vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

