import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SearchParams } from "@/lib/types/search"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"
import { cn } from "@/lib/utils"

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
        const category = categories.find(c => c.id.toString() === value)
        return category ? category.name : null
      case "brand":
        const brandNames = value.split(',')
        if (brandNames.length === 1) {
          const brand = brands.find(b => b.id.toString() === value || b.name === value)
          return brand ? brand.name : value
        }
        return `${brandNames.length} marques`
      case "color":
        return `Couleur: ${value}`
      case "size":
        return `Taille: ${value}`
      case "minPrice":
        return `Min: ${value}€`
      case "maxPrice":
        return `Max: ${value}€`
      case "search":
        return `Recherche: ${value}`
      case "featured":
        return "Produits vedettes"
      case "store_type":
        if(value === "adult") return "Adulte"
        if(value === "kids") return "Enfant"
        if(value === "sneakers") return "Sneakers"
        return value === "new" ? "Nouveautés" : value
      case "sort":
        switch (value) {
          case "price_asc":
            return "Prix ↑"
          case "price_desc":
            return "Prix ↓"
          case "name_asc":
            return "Nom A-Z"
          case "name_desc":
            return "Nom Z-A"
          case "newest":
            return "Nouveautés"
          default:
            return null
        }
      default:
        return null
    }
  }

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    return value && value !== "all" && key !== "page" && key !== "limit"
  })

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {activeFilters.map(([key, value]) => {
          const label = getFilterLabel(key as keyof SearchParams, value as string)
          if (!label) return null

          return (
            <Badge 
              key={key}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 whitespace-nowrap px-2.5 py-1", 
                "border rounded-full text-xs font-medium"
              )}
            >
              {label}
              <button
                onClick={() => onRemoveFilter(key as keyof SearchParams)}
                aria-label={`Supprimer le filtre ${label}`}
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Supprimer le filtre {label}</span>
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
} 