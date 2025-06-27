import React, { useState, useEffect, useCallback } from "react";
import { removeFromFavorites, getFavorites } from "@/lib/api";
import { Product } from "@/lib/types/product";
import { useToast } from "@/components/ui/use-toast";
import { ProductCard } from "@/components/products/ProductCard";

// Puisque ce fichier semble ancien et n'est pas utilisé, nous pouvons ajouter un commentaire
// Ce composant n'est pas utilisé actuellement, il est remplacé par la version dans app/favorites/page.tsx

const FavoritesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      setProducts(favorites);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des favoris",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFromFavorites = async (
    id: string,
    isCornerProduct: boolean = false,
  ) => {
    try {
      const storeType = isCornerProduct ? "corner" : "main";
      await removeFromFavorites(id, storeType);
      setProducts(products.filter((product) => product.id !== id));
      toast({
        title: "Succès",
        description: "Produit retiré des favoris",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du favori",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Chargement...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          Vous n&apos;avez pas encore de favoris
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
