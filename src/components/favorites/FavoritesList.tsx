"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/app/contexts/FavoritesContext";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function FavoritesList() {
  const { favorites, removeFromFavorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(false);
  }, [favorites]);

  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      await removeFromFavorites(productId);
      toast({
        title: "Produit retiré des favoris",
        description: "Le produit a été retiré de vos favoris avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression du favori.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          Chargement de vos favoris...
        </p>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <span>♥</span>
        <h2 className="text-2xl font-semibold mb-2">Aucun favori</h2>
        <p className="text-muted-foreground max-w-md">
          Vous n&apos;avez pas encore ajouté de produits à vos favoris.
          Parcourez notre catalogue et ajoutez les produits qui vous plaisent !
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted-foreground">
          {favorites.length} produit{favorites.length > 1 ? "s" : ""}
        </p>
      </div>
      <div
        className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {favorites.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
