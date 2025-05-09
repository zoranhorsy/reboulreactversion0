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
        return `"${value}"`
      case "featured":
        return value === "true" ? "Produits vedettes" : null
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
          case "popular":
            return "Populaires"
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
    <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 min-w-max">
      {activeFilters.map(([key, value]) => {
        const label = getFilterLabel(key as keyof SearchParams, value as string)
        if (!label) return null

        return (
          <Badge
            key={key}
            variant="secondary"
            className={cn(
              "h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs rounded-full whitespace-nowrap",
              "bg-secondary/70 hover:bg-secondary/80"
            )}
          >
            {label}
            <button
              onClick={() => onRemoveFilter(key as keyof SearchParams)}
              className="ml-1 sm:ml-1.5 rounded-full hover:bg-secondary-foreground/20 inline-flex items-center justify-center h-3.5 w-3.5 sm:h-4 sm:w-4"
              aria-label={`Supprimer le filtre ${label}`}
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </Badge>
        )
      })}
      
      {activeFilters.length >= 2 && (
        <Badge
          variant="outline"
          className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs rounded-full bg-background hover:bg-muted cursor-pointer whitespace-nowrap"
          onClick={() => {
            // Réinitialiser tous les filtres sauf le store_type qui est généralement fixe par page
            const storeType = filters.store_type
            activeFilters.forEach(([key]) => {
              if (key !== 'store_type') {
                onRemoveFilter(key as keyof SearchParams)
              }
            })
          }}
        >
          Effacer tout
        </Badge>
      )}
    </div>
  )
} 