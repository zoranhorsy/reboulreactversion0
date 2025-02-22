import { Product } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export function constructImageUrl(imageUrl: string): string {
    if (!imageUrl) {
        return '/placeholder.svg'
    }

    // Si c'est déjà une URL absolue ou une image placeholder
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/placeholder')) {
        return imageUrl
    }

    // Nettoyer l'URL relative et la convertir en URL absolue
    const cleanPath = imageUrl.replace(/^\/uploads\//, '').replace(/^\//, '')
    return `${API_URL}/uploads/${cleanPath}`
}

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
        const valueA = a[key];
        const valueB = b[key];

        // Si les deux valeurs sont undefined, on les considère égales
        if (valueA === undefined && valueB === undefined) return 0;
        // Si une seule valeur est undefined, on la met à la fin
        if (valueA === undefined) return 1;
        if (valueB === undefined) return -1;

        // Comparaison des valeurs définies
        if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
        return 0;
    });
    setFilteredProducts(
        activeStoreType === 'all'
            ? sortedProducts
            : sortedProducts.filter(product => product.store_type === activeStoreType)
    );
};

