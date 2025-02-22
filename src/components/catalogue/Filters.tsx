import type React from "react"
import { useState, useEffect } from "react"
import type { FilterState, FiltersProps } from '@/lib/types/filters'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SectionState {
  categories: boolean;
  brands: boolean;
  sizes: boolean;
  colors: boolean;
  price: boolean;
}

// Mapping des noms de couleurs vers leurs valeurs hexadécimales
const colorMap: Record<string, { hex: string; label: string }> = {
  // Neutres
  "noir": { hex: "#000000", label: "Noir" },
  "blanc": { hex: "#FFFFFF", label: "Blanc" },
  "gris": { hex: "#808080", label: "Gris" },
  "gris-clair": { hex: "#D3D3D3", label: "Gris clair" },
  "gris-fonce": { hex: "#404040", label: "Gris foncé" },

  // Bleus
  "marine": { hex: "#1B1B3A", label: "Marine" },
  "bleu": { hex: "#0052CC", label: "Bleu" },
  "bleu-clair": { hex: "#4A90E2", label: "Bleu clair" },
  "bleu-ciel": { hex: "#87CEEB", label: "Bleu ciel" },
  "turquoise": { hex: "#40E0D0", label: "Turquoise" },

  // Rouges
  "rouge": { hex: "#E12B38", label: "Rouge" },
  "bordeaux": { hex: "#800020", label: "Bordeaux" },
  "corail": { hex: "#FF7F50", label: "Corail" },
  "framboise": { hex: "#C72C48", label: "Framboise" },

  // Verts
  "vert": { hex: "#2D8C3C", label: "Vert" },
  "vert-fonce": { hex: "#006400", label: "Vert foncé" },
  "vert-olive": { hex: "#808000", label: "Vert olive" },
  "kaki": { hex: "#767153", label: "Kaki" },
  "menthe": { hex: "#98FF98", label: "Menthe" },

  // Jaunes et oranges
  "jaune": { hex: "#FFD700", label: "Jaune" },
  "orange": { hex: "#FFA500", label: "Orange" },
  "moutarde": { hex: "#DFAF2C", label: "Moutarde" },

  // Violets et roses
  "violet": { hex: "#800080", label: "Violet" },
  "mauve": { hex: "#E0B0FF", label: "Mauve" },
  "rose": { hex: "#FFB6C1", label: "Rose" },
  "rose-pale": { hex: "#FFC0CB", label: "Rose pâle" },
  "fuchsia": { hex: "#FF1493", label: "Fuchsia" },

  // Marrons et beiges
  "marron": { hex: "#8B4513", label: "Marron" },
  "chocolat": { hex: "#7B3F00", label: "Chocolat" },
  "beige": { hex: "#F5F5DC", label: "Beige" },
  "camel": { hex: "#C19A6B", label: "Camel" },
  "taupe": { hex: "#483C32", label: "Taupe" },

  // Métalliques
  "or": { hex: "linear-gradient(45deg, #FFD700, #FDB931, #FFD700)", label: "Or" },
  "argent": { hex: "linear-gradient(45deg, #C0C0C0, #E8E8E8, #C0C0C0)", label: "Argent" },
  "bronze": { hex: "linear-gradient(45deg, #CD7F32, #FFA07A, #CD7F32)", label: "Bronze" },

  // Spéciaux
  "multicolore": { 
    hex: "linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)", 
    label: "Multicolore" 
  },
  "irise": { 
    hex: "linear-gradient(45deg, #FFD700, #FF69B4, #4169E1, #FFD700)", 
    label: "Irisé" 
  }
}

export const FilterComponent = ({
  filters,
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
  onFilterChange
}: FiltersProps) => {
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [openSections, setOpenSections] = useState<SectionState>({
    categories: true,
    brands: true,
    sizes: true,
    colors: true,
    price: true
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onFilterChange({ search: value })
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    onFilterChange({ 
      minPrice: values[0].toString(),
      maxPrice: values[1].toString()
    })
  }

  const toggleSection = (section: keyof SectionState) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newCategories)
    onFilterChange({ category_id: newCategories.join(",") })
  }

  const toggleBrand = (brandName: string) => {
    const newBrands = selectedBrands.includes(brandName)
      ? selectedBrands.filter(name => name !== brandName)
      : [...selectedBrands, brandName]
    
    setSelectedBrands(newBrands)
    onFilterChange({ brand: newBrands.join(",") })
  }

  // Initialiser selectedBrands à partir des filtres existants
  useEffect(() => {
    if (filters.brand) {
      setSelectedBrands(filters.brand.split(","))
    } else {
      setSelectedBrands([])
    }
  }, [filters.brand])

  const resetFilters = () => {
    // Réinitialiser les états locaux
    setSearchQuery("")
    setPriceRange([0, 1000])
    setSelectedCategories([])
    setSelectedBrands([])
    setIsAdvancedSearch(false)

    // Réinitialiser tous les filtres avec des valeurs par défaut
    const defaultFilters: Partial<FilterState> = {
      search: "",
      minPrice: "",
      maxPrice: "",
      category_id: "",
      brand: "",
      color: "",
      size: "",
      sort: "",
      page: "1",
      limit: "12",
      store_type: "",
      featured: ""
    }

    onFilterChange(defaultFilters)
  }

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: keyof SectionState; 
    children: React.ReactNode 
  }) => (
    <Collapsible open={openSections[section]} onOpenChange={() => toggleSection(section)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:text-primary transition-colors">
        <Label className="text-sm font-medium cursor-pointer">{title}</Label>
        {openSections[section] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <div className="space-y-4 p-3 bg-background border rounded-lg">
      {/* En-tête des filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <h2 className="text-sm font-semibold">Filtres</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      <Separator />

      {/* Barre de recherche */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 transition-all focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
          className="p-0 h-auto text-xs"
        >
          {isAdvancedSearch ? "Recherche simple" : "Recherche avancée"}
        </Button>
      </div>

      {/* Recherche avancée */}
      {isAdvancedSearch && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <FilterSection title="Prix" section="price">
            <div className="space-y-2">
              <div className="pt-1">
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={handlePriceChange}
                  className="my-4"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{priceRange[0]}€</span>
                  <span className="text-xs text-muted-foreground">{priceRange[1]}€</span>
                </div>
              </div>
            </div>
          </FilterSection>
        </div>
      )}

      <Separator />

      {/* Sections de filtres */}
      <div className="space-y-3">
        {/* Catégories */}
        <FilterSection title="Catégories" section="categories">
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategories.includes(category.id.toString()) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category.id.toString())}
                className={cn(
                  "h-7 justify-start text-xs group transition-all",
                  selectedCategories.includes(category.id.toString()) && "bg-primary text-primary-foreground"
                )}
              >
                <span className="truncate">{category.name}</span>
                {selectedCategories.includes(category.id.toString()) && (
                  <Check className="h-3 w-3 ml-auto" />
                )}
              </Button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Marques */}
        <FilterSection title="Marques" section="brands">
          <div className="flex flex-wrap gap-1.5">
            {brands.map((brand) => (
              <Badge
                key={brand.id}
                variant={selectedBrands.includes(brand.name) ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground",
                  selectedBrands.includes(brand.name) && "bg-primary text-primary-foreground"
                )}
                onClick={() => toggleBrand(brand.name)}
              >
                {brand.name}
              </Badge>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Tailles */}
        <FilterSection title="Tailles" section="sizes">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={filters.size === size ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange({ size })}
                className={cn(
                  "h-7 w-7 p-0 transition-all",
                  filters.size === size && "bg-primary text-primary-foreground"
                )}
              >
                {size}
              </Button>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Couleurs */}
        <FilterSection title="Couleurs" section="colors">
          <div className="grid grid-cols-4 gap-1.5">
            {colors.map((color) => {
              const colorInfo = colorMap[color.toLowerCase()] || { 
                hex: color, 
                label: color.charAt(0).toUpperCase() + color.slice(1) 
              }
              
              return (
                <button
                  key={color}
                  onClick={() => onFilterChange({ color })}
                  className={cn(
                    "w-full aspect-square rounded-md transition-all relative group",
                    "border-2",
                    filters.color === color 
                      ? "ring-2 ring-primary ring-offset-2" 
                      : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1",
                    colorInfo.hex === "#FFFFFF" ? "border-border" : "border-transparent",
                    "hover:scale-110 hover:z-10 transition-all duration-200"
                  )}
                  style={{
                    background: colorInfo.hex.startsWith('linear-gradient') 
                      ? colorInfo.hex 
                      : colorInfo.hex,
                    boxShadow: filters.color === color ? '0 0 0 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                  title={colorInfo.label}
                >
                  {filters.color === color && (
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      colorInfo.hex === "#FFFFFF" || colorInfo.hex === "#F5F5DC" || colorInfo.hex === "#FFD700"
                        ? "text-black" 
                        : "text-white"
                    )}>
                      <Check className="h-4 w-4 drop-shadow-md" />
                    </span>
                  )}
                  <span className="sr-only">{colorInfo.label}</span>
                  
                  {/* Tooltip amélioré */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs
                    bg-background border rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200
                    shadow-sm z-20 pointer-events-none">
                    {colorInfo.label}
                  </span>
                </button>
              )
            })}
          </div>
        </FilterSection>

        <Separator />

        {/* Tri */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Trier par</Label>
          <Select
            value={filters.sort}
            onValueChange={(value) => onFilterChange({ sort: value })}
          >
            <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Par défaut</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="name_asc">Nom A-Z</SelectItem>
              <SelectItem value="name_desc">Nom Z-A</SelectItem>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="popular">Plus populaires</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// Export aussi sous le nom Filters pour la compatibilité
export const Filters = FilterComponent

