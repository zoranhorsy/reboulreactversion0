import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"
import type { SearchParams } from "@/lib/types/search"

interface FilterSidebarProps {
  categories: Category[]
  brands: Brand[]
  colors: string[]
  sizes: string[]
  storeTypes: string[]
  updateFilter: (filters: Partial<SearchParams>) => void
  resetFilters: () => void
}

export function FilterSidebar({
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
  updateFilter,
  resetFilters,
}: FilterSidebarProps) {
  const handleFilterChange = (key: keyof SearchParams, value: string) => {
    updateFilter({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtres</h2>
        <Button variant="ghost" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">Catégories</h3>
          <Select onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Marques</h3>
          <Select onValueChange={(value) => handleFilterChange("brand", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les marques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les marques</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Couleurs</h3>
          <Select onValueChange={(value) => handleFilterChange("color", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les couleurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les couleurs</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Tailles</h3>
          <Select onValueChange={(value) => handleFilterChange("size", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les tailles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les tailles</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Type de magasin</h3>
          <Select onValueChange={(value) => handleFilterChange("store_type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {storeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 font-medium">Tri</h3>
          <Select onValueChange={(value) => handleFilterChange("sort", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="name_asc">Nom A-Z</SelectItem>
              <SelectItem value="name_desc">Nom Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 