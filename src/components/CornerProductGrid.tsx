import { CornerProductCard } from './CornerProductCard';
import { Product } from '@/lib/types/product';

interface CornerProductGridProps {
    products: Product[];
}

export const CornerProductGrid: React.FC<CornerProductGridProps> = ({ products }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <CornerProductCard 
                    key={product.id} 
                    product={product}
                />
            ))}
        </div>
    );
}; 