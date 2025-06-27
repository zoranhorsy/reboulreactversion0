import { useFavorites } from "@/app/contexts/FavoritesContext";
import {
  addToFavorites as apiAddToFavorites,
  addToCornerFavorites as apiAddToCornerFavorites,
  removeFromFavorites as apiRemoveFromFavorites,
} from "@/lib/api";
import Image from "next/image";

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

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCornerProduct = false,
}) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isFav = isFavorite(product.id, isCornerProduct ? "corner" : "main");

  console.log("ProductCard - Produit:", product);
  console.log("ProductCard - Est favori:", isFav);
  console.log("ProductCard - isCornerProduct:", isCornerProduct);

  const handleFavoriteClick = async () => {
    try {
      console.log("ProductCard - Clic sur favori");
      console.log("ProductCard - ID:", product.id);
      console.log("ProductCard - isCornerProduct:", isCornerProduct);

      if (isFav) {
        console.log("ProductCard - Suppression des favoris");
        await removeFromFavorites(
          product.id,
          isCornerProduct ? "corner" : "main",
        );
      } else {
        console.log("ProductCard - Ajout aux favoris");
        await addToFavorites(product.id, isCornerProduct ? "corner" : "main");
      }
    } catch (error) {
      console.error(
        "ProductCard - Erreur lors de la gestion des favoris:",
        error,
      );
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background transition-colors hover:bg-accent">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium leading-none tracking-tight">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-medium text-primary">
          {product.price}€
        </p>
        <button
          onClick={handleFavoriteClick}
          className={`mt-3 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm
                             ${
                               isFav
                                 ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                 : "bg-primary text-primary-foreground hover:bg-primary/90"
                             }`}
        >
          {isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>
      </div>
    </div>
  );
};
