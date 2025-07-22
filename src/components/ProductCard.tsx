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
  console.log("ProductCard - Produit:", product);
  console.log("ProductCard - Est favori:", false);
  console.log("ProductCard - isCornerProduct:", isCornerProduct);

  const handleFavoriteClick = async () => {
    try {
      console.log("ProductCard - Clic sur favori");
      console.log("ProductCard - ID:", product.id);
      console.log("ProductCard - isCornerProduct:", isCornerProduct);

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
      </div>
    </div>
  );
};
