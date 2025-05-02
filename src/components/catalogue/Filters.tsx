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
import { getColorInfo, isWhiteColor } from '@/config/productColors'

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

  // Fonction simplifiée pour sélectionner une seule marque à la fois
  const toggleBrand = (brand: { id: number; name: string }) => {
    // Si la marque est déjà sélectionnée, la désélectionner
    if (selectedBrands.includes(brand.id.toString())) {
      setSelectedBrands([]);
      // Utiliser brand_id = 0 pour réinitialiser le filtre (une valeur qui n'existe pas)
      onFilterChange({ brand_id: "" });
    } else {
      // Sélectionner la marque spécifique
      setSelectedBrands([brand.id.toString()]);
      // Envoyer l'ID de la marque directement, pas sous forme de chaîne
      onFilterChange({ brand_id: brand.id.toString() });
    }
  }

  // Initialiser selectedBrands à partir des filtres existants
  useEffect(() => {
    if (filters.brand_id) {
      setSelectedBrands(filters.brand_id.toString().split(","))
    } else {
      setSelectedBrands([])
    }
  }, [filters.brand_id])

  // Initialiser selectedCategories à partir des filtres existants
  useEffect(() => {
    if (filters.category_id) {
      setSelectedCategories(filters.category_id.split(","))
    } else {
      setSelectedCategories([])
    }
  }, [filters.category_id])

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
      brand_id: "",
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
    <div className="space-y-4 bg-background rounded-lg">
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
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id.toString())
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id.toString())}
                    className={cn(
                      "px-2.5 py-1.5 text-xs font-medium rounded-full transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {category.name}
                    {isSelected && <Check className="ml-1 h-3 w-3 inline" />}
                  </button>
                )
              })}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Marques */}
        <FilterSection title="Marques" section="brands">
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {brands.map((brand) => {
                const isSelected = selectedBrands.includes(brand.id.toString())
                return (
                  <button
                    key={brand.id}
                    onClick={() => toggleBrand(brand)}
                    className={cn(
                      "px-2.5 py-1.5 text-xs font-medium rounded-full transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {brand.name}
                    {isSelected && <Check className="ml-1 h-3 w-3 inline" />}
                  </button>
                )
              })}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Couleurs */}
        <FilterSection title="Couleurs" section="colors">
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {colors.map((color) => {
              const colorInfo = getColorInfo(color)
              const isSelected = filters.color === color
              
              return (
                <button
                  key={color}
                  onClick={() => onFilterChange({ color: isSelected ? "" : color })}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium rounded-full transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                  title={colorInfo.label}
                >
                  {colorInfo.label}
                  {isSelected && <Check className="ml-1 h-3 w-3 inline" />}
                </button>
              )
            })}
          </div>
        </FilterSection>

        <Separator />

        {/* Tailles */}
        <FilterSection title="Tailles" section="sizes">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((size) => {
              const isSelected = filters.size === size
              return (
                <button
                  key={size}
                  onClick={() => onFilterChange({ size: isSelected ? "" : size })}
                  className={cn(
                    "min-w-[36px] h-9 px-2 inline-flex items-center justify-center text-sm font-medium",
                    "rounded-md transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {size}
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

