import { useFavorites } from '../app/contexts/FavoritesContext';
import { addToFavorites, addToCornerFavorites, removeFromFavorites } from '@/lib/api'
import Image from 'next/image';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        is_corner_product?: boolean;
    };
    isCornerProduct?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isCornerProduct = false }) => {
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const isFav = isFavorite(product.id, isCornerProduct ? 'corner' : 'main');

    console.log('ProductCard - Produit:', product);
    console.log('ProductCard - Est favori:', isFav);
    console.log('ProductCard - isCornerProduct:', isCornerProduct);

    const handleFavoriteClick = async () => {
        try {
            console.log('ProductCard - Clic sur favori');
            console.log('ProductCard - ID:', product.id);
            console.log('ProductCard - isCornerProduct:', isCornerProduct);
            
            if (isFav) {
                console.log('ProductCard - Suppression des favoris');
                await removeFromFavorites(product.id, isCornerProduct ? 'corner' : 'main');
            } else {
                console.log('ProductCard - Ajout aux favoris');
                if (isCornerProduct) {
                    await addToCornerFavorites(product.id);
                } else {
                    await addToFavorites(product.id);
                }
            }
        } catch (error) {
            console.error('ProductCard - Erreur lors de la gestion des favoris:', error);
        }
    };

    return (
        <div className="product-card">
            <div className="relative w-full aspect-square">
                <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: a1200px) 50vw, 33vw"
                />
            </div>
            <h3>{product.name}</h3>
            <p>{product.price}€</p>
            <button onClick={handleFavoriteClick}>
                {isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </button>
        </div>
    );
}; 