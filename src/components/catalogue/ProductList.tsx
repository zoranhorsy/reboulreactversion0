import React from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/products/ProductCard'
import { Product } from '@/lib/api'
import { SocialShare } from "@/components/SocialShare"

type ProductListProps = {
    products: Product[]
}

export function ProductList({ products }: ProductListProps) {
    return (
        <div className="space-y-6">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-card rounded-lg shadow-md"
                >
                    <div className="w-full sm:w-2/3 md:w-3/4">
                        <ProductCard product={product} compact={true} />
                    </div>
                    <div className="flex flex-col space-y-2 w-full sm:w-1/3 md:w-1/4">
                        <div className="text-xs text-muted-foreground mb-2">
                            {product.stock > 10 ? 'En stock' :
                                product.stock > 5 ? 'Stock limité' :
                                    product.stock > 0 ? 'Dernières pièces' : 'Rupture de stock'}
                            : {product.stock} disponible{product.stock > 1 ? 's' : ''}
                        </div>
                        <SocialShare url={`https://reboul-store.com/produit/${product.id}`} title={product.name} />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

