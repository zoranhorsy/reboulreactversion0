import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { FilterState, FiltersProps } from "@/lib/types/filters";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getColorInfo, isWhiteColor } from "@/config/productColors";

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
  noir: { hex: "#000000", label: "Noir" },
  blanc: { hex: "#FFFFFF", label: "Blanc" },
  gris: { hex: "#808080", label: "Gris" },
  "gris-clair": { hex: "#D3D3D3", label: "Gris clair" },
  "gris-fonce": { hex: "#404040", label: "Gris foncé" },
  beige: { hex: "#F5F5DC", label: "Beige" },
  creme: { hex: "#FFFDD0", label: "Crème" },

  // Bleus
  marine: { hex: "#1B1B3A", label: "Marine" },
  bleu: { hex: "#0052CC", label: "Bleu" },
  "bleu-clair": { hex: "#4A90E2", label: "Bleu clair" },
  "bleu-ciel": { hex: "#87CEEB", label: "Bleu ciel" },
  turquoise: { hex: "#40E0D0", label: "Turquoise" },

  // Rouges
  rouge: { hex: "#E12B38", label: "Rouge" },
  bordeaux: { hex: "#800020", label: "Bordeaux" },
  corail: { hex: "#FF7F50", label: "Corail" },
  framboise: { hex: "#C72C48", label: "Framboise" },

  // Verts
  vert: { hex: "#2D8C3C", label: "Vert" },
  "vert-fonce": { hex: "#006400", label: "Vert foncé" },
  "vert-olive": { hex: "#808000", label: "Vert olive" },
  kaki: { hex: "#767153", label: "Kaki" },
  menthe: { hex: "#98FF98", label: "Menthe" },

  // Jaunes et oranges
  jaune: { hex: "#FFD700", label: "Jaune" },
  orange: { hex: "#FFA500", label: "Orange" },
  moutarde: { hex: "#DFAF2C", label: "Moutarde" },

  // Violets et roses
  violet: { hex: "#800080", label: "Violet" },
  mauve: { hex: "#E0B0FF", label: "Mauve" },
  rose: { hex: "#FFB6C1", label: "Rose" },
  "rose-pale": { hex: "#FFC0CB", label: "Rose pâle" },
  fuchsia: { hex: "#FF1493", label: "Fuchsia" },

  // Marrons et beiges
  marron: { hex: "#8B4513", label: "Marron" },
  chocolat: { hex: "#7B3F00", label: "Chocolat" },
  camel: { hex: "#C19A6B", label: "Camel" },
  taupe: { hex: "#483C32", label: "Taupe" },

  // Métalliques
  or: { hex: "linear-gradient(45deg, #FFD700, #FDB931, #FFD700)", label: "Or" },
  argent: {
    hex: "linear-gradient(45deg, #C0C0C0, #E8E8E8, #C0C0C0)",
    label: "Argent",
  },
  bronze: {
    hex: "linear-gradient(45deg, #CD7F32, #FFA07A, #CD7F32)",
    label: "Bronze",
  },

  // Spéciaux
  multicolore: {
    hex: "linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
    label: "Multicolore",
  },
  irise: {
    hex: "linear-gradient(45deg, #FFD700, #FF69B4, #4169E1, #FFD700)",
    label: "Irisé",
  },
};

export const FilterComponent = ({
  filters,
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
  availableColors,
  availableSizes,
  onFilterChange,
}: FiltersProps): JSX.Element => {
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<SectionState>({
    categories: true,
    brands: true,
    sizes: true,
    colors: true,
    price: true,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Référence pour calculer la hauteur du contenu
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Détecter si l'appareil est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Vérifier au chargement initial
    checkIfMobile();

    // Vérifier à chaque fois que la fenêtre est redimensionnée
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Initialiser searchQuery à partir des filtres existants
  useEffect(() => {
    if (filters.search) {
      setSearchQuery(filters.search);
    } else {
      setSearchQuery("");
    }
  }, [filters.search]);

  // Initialiser priceRange à partir des filtres existants
  useEffect(() => {
    const min = filters.minPrice ? parseInt(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseInt(filters.maxPrice) : 1000;
    setPriceRange([min, max]);
  }, [filters.minPrice, filters.maxPrice]);

  // Initialiser selectedColors à partir des filtres existants
  useEffect(() => {
    if (filters.color) {
      setSelectedColors(filters.color.split(","));
    } else {
      setSelectedColors([]);
    }
  }, [filters.color]);

  // Initialiser selectedSizes à partir des filtres existants
  useEffect(() => {
    if (filters.size) {
      setSelectedSizes(filters.size.split(","));
    } else {
      setSelectedSizes([]);
    }
  }, [filters.size]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFilterChange({
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    });
  };

  const toggleSection = (section: keyof SectionState) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    onFilterChange({ category_id: newCategories.join(",") });
  };

  // Fonction simplifiée pour sélectionner une seule marque à la fois
  const toggleBrand = (brand: { id: number; name: string }) => {
    // Si la marque est déjà sélectionnée, la désélectionner
    if (selectedBrands.includes(brand.id.toString())) {
      setSelectedBrands([]);
      onFilterChange({ brand_id: "" });
    } else {
      // Sélectionner la marque spécifique
      setSelectedBrands([brand.id.toString()]);
      onFilterChange({ brand_id: brand.id.toString() });
    }
  };

  // Fonction pour sélectionner plusieurs couleurs
  const toggleColor = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    setSelectedColors(newColors);
    onFilterChange({ color: newColors.join(",") });
  };

  // Fonction pour sélectionner plusieurs tailles
  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    setSelectedSizes(newSizes);
    onFilterChange({ size: newSizes.join(",") });
  };

  // Initialiser selectedBrands à partir des filtres existants
  useEffect(() => {
    if (filters.brand_id) {
      setSelectedBrands(filters.brand_id.toString().split(","));
    } else {
      setSelectedBrands([]);
    }
  }, [filters.brand_id]);

  // Initialiser selectedCategories à partir des filtres existants
  useEffect(() => {
    if (filters.category_id) {
      setSelectedCategories(filters.category_id.split(","));
    } else {
      setSelectedCategories([]);
    }
  }, [filters.category_id]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setIsAdvancedSearch(false);

    onFilterChange({
      category_id: "",
      brand_id: "",
      color: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      featured: "",
      store_type: "",
    });
  };

  const FilterSection = ({
    title,
    section,
    children,
    icon,
  }: {
    title: string;
    section: keyof SectionState;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <Collapsible
      open={openSections[section]}
      onOpenChange={() => toggleSection(section)}
      className="transition-all duration-300 ease-in-out"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-primary/80">{icon}</div>}
          <Label className="text-sm font-medium cursor-pointer">{title}</Label>
        </div>
        {openSections[section] ? <span>↑</span> : <span>↓</span>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="h-full flex flex-col bg-background/95 overflow-hidden">
      {/* En-tête des filtres */}
      <div
        ref={headerRef}
        className="sticky top-0 z-10 bg-background border-b pb-3 px-5 pt-5 flex justify-between items-center"
      >
        <h2 className="text-lg font-medium">Filtres</h2>
        <Button
          variant="link"
          size="sm"
          onClick={resetFilters}
          className="text-xs font-normal text-muted-foreground hover:text-primary h-auto p-0"
        >
          Réinitialiser
        </Button>
      </div>

      {/* Zone scrollable pour les filtres */}
      <ScrollArea className="flex-1 overflow-auto pb-8">
        <div className="p-5 space-y-6">
          {/* Recherche avancée (prix) */}
          {isAdvancedSearch && (
            <div className="space-y-4 animate-in slide-in-from-top duration-300 ease-in-out">
              <FilterSection title="Prix" section="price" icon="€">
                <div className="space-y-2 px-2 py-1">
                  <div className="pt-1">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={handlePriceChange}
                      className="my-6"
                    />
                    <div className="flex justify-between mt-2">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Min
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal py-1 px-3 rounded-md bg-muted/30"
                        >
                          {priceRange[0]}€
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Max
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal py-1 px-3 rounded-md bg-muted/30"
                        >
                          {priceRange[1]}€
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </FilterSection>
            </div>
          )}

          <Separator className="my-4" />

          {/* Sections de filtres */}
          <div className="space-y-5">
            {/* Catégories */}
            <FilterSection title="Catégories" section="categories" icon="🏷️">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(
                      category.id.toString(),
                    );
                    return (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id.toString())}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {category.name}
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </FilterSection>

            <Separator className="my-2" />

            {/* Marques */}
            <FilterSection title="Marques" section="brands" icon="🏢">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 rounded-md scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                <div className="grid grid-cols-1 gap-1.5">
                  {brands.map((brand) => {
                    const isSelected = selectedBrands.includes(
                      brand.id.toString(),
                    );
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-medium rounded-md transition-all flex items-center",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                          isSelected
                            ? "bg-primary/15 text-primary shadow-sm"
                            : "hover:bg-muted/70 text-foreground",
                        )}
                      >
                        <span className="flex-1 truncate">{brand.name}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
                {brands.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-3 py-3">
                    Aucune marque disponible
                  </p>
                )}
              </div>
            </FilterSection>

            <Separator className="my-2" />

            {/* Couleurs */}
            <FilterSection title="Couleurs" section="colors" icon="🎨">
              <div className="grid grid-cols-6 gap-2 py-2">
                {(availableColors || colors || []).map((color) => {
                  const colorInfo = getColorInfo(color);
                  const isActive = selectedColors.includes(color);

                  return (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "group flex flex-col items-center space-y-1.5 relative",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      )}
                      aria-label={`Filtrer par couleur ${colorInfo.label}`}
                      title={colorInfo.label}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full",
                          "flex items-center justify-center transition-all duration-300",
                          "group-hover:scale-110 group-hover:shadow-md",
                          isActive
                            ? "ring-2 ring-primary ring-offset-2 shadow-sm"
                            : "ring-1 ring-muted-foreground/20",
                          isWhiteColor(color) && "border border-gray-200",
                        )}
                        style={{
                          background: colorInfo.hex,
                        }}
                      >
                        {isActive && <span>✓</span>}
                      </div>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                        {colorInfo.label}
                      </span>
                    </button>
                  );
                })}
                {(availableColors || colors || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic col-span-6 px-3 py-3">
                    Aucune couleur disponible
                  </p>
                )}
              </div>
            </FilterSection>

            <Separator className="my-2" />

            {/* Tailles */}
            <FilterSection title="Tailles" section="sizes" icon="📏">
              <div className="flex flex-wrap gap-2 py-2">
                {(availableSizes || sizes || []).map((size) => {
                  const isActive = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "min-w-[2.5rem] px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
                {(availableSizes || sizes || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic w-full px-3 py-3">
                    Aucune taille disponible
                  </p>
                )}
              </div>
            </FilterSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Export aussi sous le nom Filters pour la compatibilité
export const Filters = FilterComponent;
