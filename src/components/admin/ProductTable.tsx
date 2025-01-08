import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Product, Category } from '@/lib/api'
import Image from 'next/image'
import { Edit, Trash2, ChevronUp, ChevronDown, ImageOff } from 'lucide-react'
import { constructImageUrl } from '@/utils/productUtils'

interface ProductTableProps {
    filteredProducts: Product[];
    categories: Category[];
    sortConfig: { key: keyof Product; direction: 'ascending' | 'descending' } | null;
    handleSort: (key: keyof Product) => void;
    handleEditProduct: (product: Product) => void;
    handleDeleteProduct: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
                                                              filteredProducts,
                                                              categories,
                                                              sortConfig,
                                                              handleSort,
                                                              handleEditProduct,
                                                              handleDeleteProduct
                                                          }) => {
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const handleImageError = (productId: string, imagePath: string) => {
        console.error('Image loading error for product:', productId);
        console.error('Original image path:', imagePath);
        console.error('Constructed URL:', constructImageUrl(imagePath));
        setImageErrors(prev => ({ ...prev, [productId]: true }));
    };

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
                        {product.images?.length > 0 && !imageErrors[product.id] ? (
                            <div className="relative w-12 h-12">
                                <Image
                                    src={constructImageUrl(product.images[0])}
                                    alt={product.name}
                                    width={50}
                                    height={50}
                                    className="rounded-md object-cover"
                                    onError={() => handleImageError(product.id, product.images[0])}
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                <ImageOff size={24} />
                            </div>
                        )}
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
                    <td className="p-2">{product.storeType}</td>
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

