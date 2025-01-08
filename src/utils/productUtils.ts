import { Product } from '@/lib/api';

export const constructImageUrl = (imagePath: string): string => {
    if (!imagePath) {
        return '/placeholder.png';
    }

    // If it's already a complete URL (including blob URLs), return as is
    if (imagePath.startsWith('http') ||
        imagePath.startsWith('data:') ||
        imagePath.startsWith('blob:')) {
        return imagePath;
    }

    // If the path already includes '/uploads', don't add it again
    if (imagePath.includes('/uploads')) {
        return imagePath;
    }

    // Extract just the filename if it's a full path
    const filename = imagePath.split('/').pop();

    // Construct the URL with the API endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    return `${API_URL}/uploads/${filename}`;
};

// Keep the existing handleSort function
export const handleSort = (
    key: keyof Product,
    sortConfig: { key: keyof Product; direction: 'ascending' | 'descending' } | null,
    setSortConfig: React.Dispatch<React.SetStateAction<{ key: keyof Product; direction: 'ascending' | 'descending' } | null>>,
    products: Product[],
    activeStoreType: 'all' | 'adult' | 'kids' | 'sneakers',
    setFilteredProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
    const sortedProducts = [...products].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0;
    });
    setFilteredProducts(
        activeStoreType === 'all'
            ? sortedProducts
            : sortedProducts.filter(product => product.storeType === activeStoreType)
    );
};

