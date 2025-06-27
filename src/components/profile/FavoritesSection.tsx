"use client";

import { useFavorites } from "@/app/contexts/FavoritesContext";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FavoritesSection() {
  const { favorites, removeFromFavorites } = useFavorites();

  if (!favorites.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <span>♥</span>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Aucun favori pour le moment
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ajoutez des articles à vos favoris pour les retrouver facilement ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium tracking-tight">Mes Favoris</h2>
          <p className="text-sm text-muted-foreground">
            {favorites.length} article{favorites.length > 1 ? "s" : ""} dans vos
            favoris
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <span>🗑️</span>
              Tout supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer tous les favoris ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera
                définitivement tous vos articles favoris.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  favorites.forEach((fav) => removeFromFavorites(fav.id));
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
