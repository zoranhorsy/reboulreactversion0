import { ProductCard } from '@/components/products/ProductCard'

interface Product {
    id: number
    name: string
    price: number
    image: string
    brand: string
    category: string
    tags?: string[]
    colors?: string[]
    stock: number
}

interface ProductGridProps {
    products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

