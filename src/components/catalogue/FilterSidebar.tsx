import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/types/category";
import type { Brand } from "@/lib/types/brand";
import type { SearchParams } from "@/lib/types/search";

interface FilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  colors: string[];
  sizes: string[];
  storeTypes: string[];
  filters: SearchParams;
  updateFilter: (filters: Partial<SearchParams>) => void;
  resetFilters: () => void;
}

export function FilterSidebar({
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
  filters,
  updateFilter,
  resetFilters,
}: FilterSidebarProps) {
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter({ search: event.target.value });
  };

  return (
    <div className="h-full w-full max-w-xs border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Filtres</h2>
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 text-xs"
          >
            Réinitialiser
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <span>🔍</span>
          <Input
            placeholder="Rechercher un produit..."
            className="pl-8 bg-muted/50"
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        {/* Filtres rapides */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter({ featured: "true" })}
              className="h-8"
            >
              Produits vedettes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter({ store_type: "new" })}
              className="h-8"
            >
              Nouveautés
            </Button>
          </div>
        </div>

        <Separator className="my-4" />
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)] px-4">
        <div className="space-y-6">
          {/* Catégories avec boutons */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Catégories
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 6).map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Button
                    variant={
                      filters.category === category.id.toString()
                        ? "default"
                        : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() =>
                      updateFilter({ category: category.id.toString() })
                    }
                  >
                    {category.name}
                  </Button>
                </div>
              ))}
            </div>
            {categories.length > 6 && (
              <Select
                onValueChange={(value) => updateFilter({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Plus de catégories..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Marques
            </h3>
            <Select onValueChange={(value) => updateFilter({ brand: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les marques</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-4" />

          {/* Tailles */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Tailles
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={filters.size === size ? "default" : "outline"}
                  className="w-full"
                  onClick={() => updateFilter({ size })}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Couleurs */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Couleurs
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    filters.color === color ? "border-primary" : "border-border"
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      filters.color === color
                        ? "0 0 0 2px var(--primary)"
                        : "none",
                  }}
                  onClick={() => updateFilter({ color })}
                />
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Prix */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Prix
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Min</span>
                <Input
                  type="number"
                  placeholder="0 €"
                  className="h-8"
                  onChange={(e) => updateFilter({ minPrice: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Max</span>
                <Input
                  type="number"
                  placeholder="Max €"
                  className="h-8"
                  onChange={(e) => updateFilter({ maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Type de magasin */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Type de magasin
            </h3>
            <Select
              onValueChange={(value) => updateFilter({ store_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {storeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "adult"
                      ? "Adulte"
                      : type === "kids"
                        ? "Enfant"
                        : "Sneakers"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tri */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide text-foreground/60">
              Tri
            </h3>
            <Select onValueChange={(value) => updateFilter({ sort: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Par défaut</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="name_asc">Nom A-Z</SelectItem>
                <SelectItem value="name_desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
