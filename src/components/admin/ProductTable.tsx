import React from 'react'
import { Button } from "@/components/ui/button"
import { Product, Category, getImagePath } from '@/lib/api'
import Image from 'next/image'
import { Edit, Trash2, ChevronUp, ChevronDown, ImageOff } from 'lucide-react'

interface ProductTableProps {
    filteredProducts: Product[];
    categories: Category[];
    sortConfig: { key: keyof Product; direction: 'ascending' | 'descending' } | null;
    handleSort: (key: keyof Product) => void;
    handleEditProduct: (product: Product) => void;
    handleDeleteProduct: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
    filteredProducts,
    categories,
    sortConfig,
    handleSort,
    handleEditProduct,
    handleDeleteProduct
}) => {
    return (
        <table className="w-full">
            <thead>
                <tr>
                    <th className="text-left p-2">Image</th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('name')}>
                        Nom {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('price')}>
                        Prix {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                    </th>
                    <th className="text-left p-2">Catégorie</th>
                    <th className="text-left p-2">Type de magasin</th>
                    <th className="text-left p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t">
                        <td className="p-2">
                            <div className="relative w-12 h-12">
                                {product.images?.length > 0 ? (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={getImagePath(product.images[0])}
                                            alt={product.name}
                                            fill
                                            className="rounded-md object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder.png';
                                            }}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                        <ImageOff className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">
                            {typeof product.price === 'number'
                                ? `${product.price.toFixed(2)} €`
                                : typeof product.price === 'string'
                                    ? `${parseFloat(product.price).toFixed(2)} €`
                                    : 'Prix non disponible'}
                        </td>
                        <td className="p-2">{categories.find(cat => cat.id === (product.category || product.category_id))?.name || 'Non catégorisé'}</td>
                        <td className="p-2">{product.storeType || product.store_type || 'N/A'}</td>
                        <td className="p-2">
                            <Button variant="ghost" onClick={() => handleEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Modifier
                            </Button>
                            <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ProductTable;

