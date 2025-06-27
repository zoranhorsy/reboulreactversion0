"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useFavorites } from "@/app/contexts/FavoritesContext";
import { type Product } from "@/lib/api";

interface WishlistButtonProps {
  product: Product;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WishlistButton({
  product,
  variant = "ghost",
  size = "icon",
}: WishlistButtonProps) {
  const { toast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.id);

  const handleClick = async () => {
    try {
      if (isProductFavorite) {
        await removeFromFavorites(product.id, product.store_type || "main");
        toast({
          title: "Produit retiré des favoris",
          description: `${product.name} a été retiré de vos favoris.`,
        });
      } else {
        await addToFavorites(product.id, product.store_type || "main");
        toast({
          title: "Produit ajouté aux favoris",
          description: `${product.name} a été ajouté à vos favoris.`,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la gestion des favoris:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la gestion des favoris",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={isProductFavorite ? "text-red-500 hover:text-red-600" : ""}
    >
      <span>♥</span>
    </Button>
  );
}
