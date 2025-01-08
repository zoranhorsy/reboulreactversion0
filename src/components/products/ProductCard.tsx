import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api';
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    // Ensure we have a valid product object
    if (!product) {
        return null; // or return a placeholder component
    }

    const imageUrl = product.images && product.images.length > 0 && product.images[0] !== ""
        ? product.images[0]
        : '/placeholder.svg';

    return (
        <Card className="overflow-hidden">
            <div className="relative h-48">
                <Image
                    src={imageUrl}
                    alt={product.name || 'Product image'}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold line-clamp-1">{product.name || 'Unnamed Product'}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description || 'No description available'}</p>
                <p className="text-lg font-bold mt-2">{typeof product.price === 'number' ? `${product.price.toFixed(2)} €` : 'Price not available'}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/produit/${product.id}`} passHref>
                    <Button className="w-full">Voir les détails</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

