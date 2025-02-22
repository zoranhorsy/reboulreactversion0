import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SearchParams } from "@/lib/types/search"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"

interface ActiveFiltersProps {
  filters: Partial<SearchParams>
  categories: Category[]
  brands: Brand[]
  onRemoveFilter: (key: keyof SearchParams) => void
}

export function ActiveFilters({
  filters,
  categories,
  brands,
  onRemoveFilter
}: ActiveFiltersProps) {
  const getFilterLabel = (key: keyof SearchParams, value: string) => {
    switch (key) {
      case "category":
        return categories.find(c => c.id.toString() === value)?.name
      case "brand":
        return brands.find(b => b.id.toString() === value)?.name
      case "color":
        return `Couleur: ${value}`
      case "size":
        return `Taille: ${value}`
      case "minPrice":
        return `Min: ${value}€`
      case "maxPrice":
        return `Max: ${value}€`
      case "featured":
        return "Produits vedettes"
      case "store_type":
        return value === "new" ? "Nouveautés" : value
      case "sort":
        switch (value) {
          case "price_asc":
            return "Prix croissant"
          case "price_desc":
            return "Prix décroissant"
          case "name_asc":
            return "Nom A-Z"
          case "name_desc":
            return "Nom Z-A"
          default:
            return null
        }
      default:
        return null
    }
  }

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    return value && value !== "all" && key !== "search" && key !== "page" && key !== "limit"
  })

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map(([key, value]) => {
        const label = getFilterLabel(key as keyof SearchParams, value)
        if (!label) return null

        return (
          <Badge
            key={key}
            variant="secondary"
            className="pl-2 pr-1 py-1 flex items-center gap-1"
          >
            {label}
            <button
              onClick={() => onRemoveFilter(key as keyof SearchParams)}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Supprimer le filtre {label}</span>
            </button>
          </Badge>
        )
      })}
    </div>
  )
} 