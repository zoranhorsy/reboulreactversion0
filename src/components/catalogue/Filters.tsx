import type React from "react"
import type { FilterState, FiltersProps } from '@/lib/types/filters'

export const FilterComponent = ({
  filters,
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
  onFilterChange
}: FiltersProps) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Catégorie
        </label>
        <select
          id="category"
          value={filters.category_id}
          onChange={(e) => handleChange('category_id', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="brand" className="block text-sm font-medium">
          Marque
        </label>
        <select
          id="brand"
          value={filters.brand}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Toutes les marques</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.name}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium">
          Couleur
        </label>
        <select
          id="color"
          value={filters.color}
          onChange={(e) => handleChange('color', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Toutes les couleurs</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="size" className="block text-sm font-medium">
          Taille
        </label>
        <select
          id="size"
          value={filters.size}
          onChange={(e) => handleChange('size', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Toutes les tailles</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="store_type" className="block text-sm font-medium">
          Type de magasin
        </label>
        <select
          id="store_type"
          value={filters.store_type}
          onChange={(e) => handleChange('store_type', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Tous les types</option>
          {storeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="block text-sm font-medium">
          Trier par
        </label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Par défaut</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="name_asc">Nom A-Z</option>
          <option value="name_desc">Nom Z-A</option>
        </select>
      </div>
    </div>
  )
}

// Export aussi sous le nom Filters pour la compatibilité
export const Filters = FilterComponent

