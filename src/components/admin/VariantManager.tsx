import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productColors } from "@/config/productColors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Variant } from "@/lib/types/product";

interface VariantManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

// Liste des tailles prédéfinies regroupées par catégories
const SIZES = {
  standard: ["XS", "S", "M", "L", "XL", "XXL"],
  italian: [
    "IT 38",
    "IT 40",
    "IT 42",
    "IT 44",
    "IT 46",
    "IT 48",
    "IT 50",
    "IT 52",
    "IT 54",
    "IT 56",
    "IT 58",
    "IT 60",
  ],
  shoes_kids: [
    "EU 16",
    "EU 16.5",
    "EU 17",
    "EU 17.5",
    "EU 18",
    "EU 18.5",
    "EU 19",
    "EU 19.5",
    "EU 20",
    "EU 20.5",
    "EU 21",
    "EU 21.5",
    "EU 22",
    "EU 22.5",
    "EU 23",
    "EU 23.5",
    "EU 24",
    "EU 24.5",
    "EU 25",
    "EU 25.5",
    "EU 26",
    "EU 26.5",
    "EU 27",
    "EU 27.5",
    "EU 28",
    "EU 28.5",
    "EU 29",
    "EU 29.5",
    "EU 30",
    "EU 30.5",
    "EU 31",
    "EU 31.5",
    "EU 32",
    "EU 32.5",
    "EU 33",
    "EU 33.5",
    "EU 34",
    "EU 34.5",
    "EU 35",
  ],
  shoes: [
    "EU 35",
    "EU 35 1/3",
    "EU 35.5",
    "EU 35 2/3",
    "EU 36",
    "EU 36 1/3",
    "EU 36.5",
    "EU 36 2/3",
    "EU 37",
    "EU 37 1/3",
    "EU 37.5",
    "EU 37 2/3",
    "EU 38",
    "EU 38 1/3",
    "EU 38.5",
    "EU 38 2/3",
    "EU 39",
    "EU 39 1/3",
    "EU 39.5",
    "EU 39 2/3",
    "EU 40",
    "EU 40 1/3",
    "EU 40.5",
    "EU 40 2/3",
    "EU 41",
    "EU 41 1/3",
    "EU 41.5",
    "EU 41 2/3",
    "EU 42",
    "EU 42 1/3",
    "EU 42.5",
    "EU 42 2/3",
    "EU 43",
    "EU 43 1/3",
    "EU 43.5",
    "EU 43 2/3",
    "EU 44",
    "EU 44 1/3",
    "EU 44.5",
    "EU 44 2/3",
    "EU 45",
    "EU 45 1/3",
    "EU 45.5",
    "EU 45 2/3",
    "EU 46",
    "EU 46 1/3",
    "EU 46.5",
    "EU 46 2/3",
    "EU 47",
    "EU 47 1/3",
    "EU 47.5",
    "EU 47 2/3",
  ],
};

// Liste des couleurs prédéfinies est maintenant importée de productColors.ts

interface SavedCustomColor {
  name: string;
  value: string;
}

// Utiliser React.memo pour éviter les rendus inutiles
export const VariantManager = React.memo(function VariantManagerComponent({
  variants,
  onChange,
}: VariantManagerProps) {
  const [newVariant, setNewVariant] = useState<Variant>({
    id: 0,
    size: "",
    color: "",
    stock: 0,
  });
  const [error, setError] = useState<string | null>(null);
  // États pour gérer les valeurs personnalisées
  const [customSize, setCustomSize] = useState<string>("");
  const [customColor, setCustomColor] = useState<string>("");
  const [customColorHex, setCustomColorHex] = useState<string>("#000000");
  const [isCustomSize, setIsCustomSize] = useState<boolean>(false);
  const [isCustomColor, setIsCustomColor] = useState<boolean>(false);
  const [isEditingVariantColor, setIsEditingVariantColor] = useState<
    number | null
  >(null);
  const [editingCustomColor, setEditingCustomColor] = useState<string>("");
  const [editingCustomColorHex, setEditingCustomColorHex] =
    useState<string>("#000000");
  const [savedCustomColors, setSavedCustomColors] = useState<
    SavedCustomColor[]
  >([]);

  // Load saved custom colors from localStorage on component mount
  useEffect(() => {
    try {
      const savedColors = localStorage.getItem("savedCustomColors");
      if (savedColors) {
        const parsedColors = JSON.parse(savedColors);
        if (Array.isArray(parsedColors) && parsedColors.length > 0) {
          setSavedCustomColors(parsedColors);
        }
      }
    } catch (error) {
      console.error("Error loading saved colors:", error);
    }
  }, []);

  // Save custom colors to localStorage when they change
  useEffect(() => {
    if (savedCustomColors.length > 0) {
      // Utiliser un timer pour éviter des écritures trop fréquentes dans localStorage
      const timer = setTimeout(() => {
        localStorage.setItem(
          "savedCustomColors",
          JSON.stringify(savedCustomColors),
        );
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [savedCustomColors]);

  const saveCustomColor = useCallback(
    (name: string, hexValue: string) => {
      if (!name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom de la couleur ne peut pas être vide",
          variant: "destructive",
        });
        return false;
      }

      // Check if this color name already exists
      const existingColor = [...productColors, ...savedCustomColors].find(
        (color) => color.name.toLowerCase() === name.toLowerCase(),
      );

      if (existingColor) {
        toast({
          title: "Attention",
          description: "Cette couleur existe déjà",
          variant: "destructive",
        });
        return false;
      }

      // Add the custom color to saved colors
      const newColor = { name, value: hexValue };
      setSavedCustomColors((prev) => [...prev, newColor]);

      toast({
        title: "Couleur sauvegardée",
        description: `"${name}" a été ajoutée aux couleurs disponibles`,
      });

      return true;
    },
    [savedCustomColors],
  );

  const removeCustomColor = useCallback(
    (name: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      setSavedCustomColors((prev) =>
        prev.filter((color) => color.name !== name),
      );

      toast({
        title: "Couleur supprimée",
        description: `"${name}" a été retirée des couleurs personnalisées`,
      });
    },
    [],
  );

  const addVariant = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission
    e.preventDefault();

    const finalSize = isCustomSize ? customSize : newVariant.size;
    const finalColor = isCustomColor ? customColor : newVariant.color;

    if (!finalSize) {
      setError("La taille est requise");
      return;
    }

    if (!finalColor) {
      setError("La couleur est requise");
      return;
    }

    // Parse stock to ensure it's a valid number
    const stock = Number(newVariant.stock);
    if (isNaN(stock) || stock < 0) {
      setError("Le stock doit être un nombre positif");
      return;
    }

    // For custom colors, we might want to track the hex value separately
    // This could be done by extending your API to store color metadata
    if (isCustomColor && customColor) {
      // Si c'est une couleur personnalisée, envisager de la sauvegarder
      // Automatiquement pour une utilisation future
      if (
        !savedCustomColors.some(
          (c) => c.name.toLowerCase() === customColor.toLowerCase(),
        )
      ) {
        saveCustomColor(customColor, customColorHex);
      }
    }

    // Ensure the variant data is properly formatted
    const newVariantData = {
      id: newVariant.id,
      size: finalSize.trim(),
      color: finalColor.trim(),
      stock: stock,
    };

    // Verify there are no duplicates (same size and color)
    const isDuplicate = variants.some(
      (v) =>
        v.size.trim().toLowerCase() === newVariantData.size.toLowerCase() &&
        v.color.trim().toLowerCase() === newVariantData.color.toLowerCase(),
    );

    if (isDuplicate) {
      setError("Cette combinaison taille/couleur existe déjà");
      return;
    }

    onChange([...variants, newVariantData]);

    setNewVariant({ id: 0, size: "", color: "", stock: 0 });
    setCustomSize("");
    setCustomColor("");
    setCustomColorHex("#000000");
    setIsCustomSize(false);
    setIsCustomColor(false);
    setError(null);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    onChange(updatedVariants);
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number,
  ) => {
    const updatedVariants = variants.map((variant, i) => {
      if (i !== index) return variant;

      // If updating stock, make sure it's a valid number
      if (field === "stock") {
        const stockValue = Number(value);
        return {
          ...variant,
          [field]: isNaN(stockValue) ? 0 : Math.max(0, stockValue),
        };
      }

      // If updating size or color, make sure it's trimmed
      if (field === "size" || field === "color") {
        // If it's a custom selection, don't update yet
        if (value === "custom") {
          if (field === "color") {
            startEditingVariantColor(index, variant.color);
            return variant;
          }
          return variant;
        }

        // Make sure the value is a string and trimmed
        const stringValue =
          typeof value === "string" ? value.trim() : String(value).trim();
        return { ...variant, [field]: stringValue };
      }

      return { ...variant, [field]: value };
    });

    // Check for duplicates after update
    const hasDuplicates = updatedVariants.some((variant, idx) => {
      if (idx === index) return false; // Skip the variant we're updating

      const updatedVariant = updatedVariants[index];
      return (
        variant.size.toLowerCase() === updatedVariant.size.toLowerCase() &&
        variant.color.toLowerCase() === updatedVariant.color.toLowerCase()
      );
    });

    if (hasDuplicates) {
      toast({
        title: "Attention",
        description: "Cette combinaison taille/couleur existe déjà",
        variant: "destructive",
      });
      return;
    }

    onChange(updatedVariants);
  };

  const handleSizeChange = (value: string) => {
    if (value === "custom") {
      setIsCustomSize(true);
    } else {
      setIsCustomSize(false);
      setNewVariant({ ...newVariant, size: value });
    }
  };

  const handleColorChange = (value: string) => {
    if (value === "custom") {
      setIsCustomColor(true);
    } else {
      setIsCustomColor(false);
      setNewVariant({ ...newVariant, color: value });

      // If a standard color is selected, update the custom color hex value
      const selectedColor = productColors.find((color) => color.name === value);
      if (selectedColor) {
        setCustomColorHex(selectedColor.value);
      }
    }
  };

  const startEditingVariantColor = (index: number, currentColor: string) => {
    setIsEditingVariantColor(index);

    // Check if it's a standard color or custom color
    const standardColor = productColors.find(
      (color) => color.name === currentColor,
    );
    if (standardColor) {
      setEditingCustomColor("");
      setEditingCustomColorHex(standardColor.value);
    } else {
      setEditingCustomColor(currentColor);
      setEditingCustomColorHex("#000000");
    }
  };

  const saveEditingVariantColor = (index: number) => {
    if (editingCustomColor) {
      // Create a new custom color entry
      const colorEntry = {
        name: editingCustomColor,
        value: editingCustomColorHex,
      };

      // Check if this custom color name already exists in productColors to prevent duplicates
      const existingColor = productColors.find(
        (c) => c.name.toLowerCase() === editingCustomColor.toLowerCase(),
      );

      // If it's a new custom color, we might want to store it for future use
      // This is just updating the local variant for now
      updateVariant(index, "color", colorEntry.name);
    }

    setIsEditingVariantColor(null);
    setEditingCustomColor("");
    setEditingCustomColorHex("#000000");
  };

  const cancelEditingVariantColor = () => {
    setIsEditingVariantColor(null);
    setEditingCustomColor("");
    setEditingCustomColorHex("#000000");
  };

  // Memoize les options standards pour éviter les recalculs inutiles
  const standardSizesOptions = useMemo(
    () =>
      SIZES.standard.map((size) => (
        <SelectItem key={size} value={size}>
          {size}
        </SelectItem>
      )),
    [],
  );

  const italianSizesOptions = useMemo(
    () =>
      SIZES.italian.map((size) => (
        <SelectItem key={size} value={size}>
          {size}
        </SelectItem>
      )),
    [],
  );

  const kidsShoeSizesOptions = useMemo(
    () =>
      SIZES.shoes_kids.map((size) => (
        <SelectItem key={size} value={size}>
          {size}
        </SelectItem>
      )),
    [],
  );

  const adultShoeSizesOptions = useMemo(
    () =>
      SIZES.shoes.map((size) => (
        <SelectItem key={size} value={size}>
          {size}
        </SelectItem>
      )),
    [],
  );

  const standardColorsOptions = useMemo(
    () =>
      productColors.map((color) => (
        <SelectItem key={color.name} value={color.name}>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2 border border-border/40"
              style={{ backgroundColor: color.value }}
            />
            {color.name}
          </div>
        </SelectItem>
      )),
    [],
  );

  return (
    <div className="space-y-4 text-white">
      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-zinc-800/50 border border-zinc-700/40 rounded-lg"
            >
              <div className="w-1/3 sm:w-1/4">
                <Select
                  value={variant.size}
                  onValueChange={(value) => updateVariant(index, "size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-zinc-400">
                        Tailles standards
                      </SelectLabel>
                      {standardSizesOptions}
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="text-zinc-400">
                        Tailles italiennes (pantalons)
                      </SelectLabel>
                      {italianSizesOptions}
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="text-zinc-400">
                        Tailles de chaussures Enfant (EU)
                      </SelectLabel>
                      {kidsShoeSizesOptions}
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="text-zinc-400">
                        Tailles de chaussures Adulte (EU)
                      </SelectLabel>
                      {adultShoeSizesOptions}
                    </SelectGroup>

                    {!SIZES.standard.includes(variant.size) &&
                      !SIZES.italian.includes(variant.size) &&
                      !SIZES.shoes_kids.includes(variant.size) &&
                      !SIZES.shoes.includes(variant.size) &&
                      variant.size && (
                        <SelectGroup>
                          <SelectLabel className="text-zinc-400">
                            Valeur personnalisée
                          </SelectLabel>
                          <SelectItem value={variant.size}>
                            {variant.size}
                          </SelectItem>
                        </SelectGroup>
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/3 sm:w-1/4">
                {isEditingVariantColor === index ? (
                  <div className="space-y-1.5">
                    <div className="flex space-x-1 items-center">
                      <div className="relative flex-1">
                        <Input
                          value={editingCustomColor}
                          onChange={(e) =>
                            setEditingCustomColor(e.target.value)
                          }
                          placeholder="Couleur personnalisée"
                          className="border-zinc-700/40 h-8 sm:h-9 text-sm bg-zinc-800/50 w-full pl-7 text-white"
                        />
                        <div
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-zinc-700/40"
                          style={{ backgroundColor: editingCustomColorHex }}
                        ></div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEditingVariantColor(index)}
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex-shrink-0"
                      >
                        <span>✓</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          saveCustomColor(
                            editingCustomColor,
                            editingCustomColorHex,
                          )
                        }
                        className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex-shrink-0"
                        title="Sauvegarder cette couleur"
                      >
                        <span>📝</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelEditingVariantColor}
                        className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex-shrink-0"
                      >
                        <span>×</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor={`color-hex-${index}`}
                        className="text-[10px] text-zinc-400"
                      >
                        Couleur:
                      </Label>
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="color"
                          id={`color-hex-${index}`}
                          value={editingCustomColorHex}
                          onChange={(e) =>
                            setEditingCustomColorHex(e.target.value)
                          }
                          className="h-4 w-4 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] text-zinc-400">
                          {editingCustomColorHex}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 relative">
                    <Select
                      value={variant.color}
                      onValueChange={(value) =>
                        updateVariant(index, "color", value)
                      }
                    >
                      <SelectTrigger>
                        {variant.color && (
                          <div className="flex items-center">
                            {productColors.some(
                              (c) => c.name === variant.color,
                            ) ? (
                              <div
                                className="w-3 h-3 rounded-full mr-2 border border-zinc-700/40"
                                style={{
                                  backgroundColor:
                                    productColors.find(
                                      (c) => c.name === variant.color,
                                    )?.value || "#CCCCCC",
                                }}
                              />
                            ) : savedCustomColors.some(
                                (c) => c.name === variant.color,
                              ) ? (
                              <div
                                className="w-3 h-3 rounded-full mr-2 border border-zinc-700/40"
                                style={{
                                  backgroundColor:
                                    savedCustomColors.find(
                                      (c) => c.name === variant.color,
                                    )?.value || "#CCCCCC",
                                }}
                              />
                            ) : (
                              <div className="w-3 h-3 rounded-full mr-2 border border-zinc-700/40 bg-gray-600 overflow-hidden relative">
                                <span>🔄</span>
                              </div>
                            )}
                            <SelectValue placeholder="Couleur" />
                          </div>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-zinc-400">
                            Couleurs standard
                          </SelectLabel>
                          {standardColorsOptions}
                        </SelectGroup>

                        {savedCustomColors.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="flex items-center justify-between text-zinc-400">
                              <span>Couleurs personnalisées</span>
                            </SelectLabel>
                            {savedCustomColors.map((color) => (
                              <SelectItem key={color.name} value={color.name}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2 border border-zinc-700/40"
                                      style={{ backgroundColor: color.value }}
                                    />
                                    {color.name}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 ml-2 rounded-full hover:bg-red-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeCustomColor(color.name);
                                    }}
                                  >
                                    <span>×</span>
                                  </Button>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}

                        {!productColors.some((c) => c.name === variant.color) &&
                          !savedCustomColors.some(
                            (c) => c.name === variant.color,
                          ) &&
                          variant.color && (
                            <SelectGroup>
                              <SelectLabel className="text-zinc-400">
                                Valeur personnalisée
                              </SelectLabel>
                              <SelectItem value={variant.color}>
                                {variant.color}
                              </SelectItem>
                            </SelectGroup>
                          )}

                        <SelectGroup>
                          <SelectItem value="custom">
                            Couleur personnalisée...
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        startEditingVariantColor(index, variant.color)
                      }
                      className="h-7 w-7 rounded-full hover:bg-white/10 flex-shrink-0"
                      title="Modifier la couleur"
                    >
                      <span>✏️</span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="w-1/4 sm:w-1/6">
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, "stock", parseInt(e.target.value) || 0)
                  }
                  placeholder="Stock"
                  className="border-zinc-700/40 h-8 sm:h-9 text-sm bg-zinc-800/50 text-white text-right"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(index)}
                className="h-8 w-8 rounded-full flex-shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-400"
              >
                <span>×</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-zinc-800/40 rounded-lg border border-zinc-700/40 p-2 sm:p-3">
        <h4 className="text-xs font-medium mb-2 text-zinc-400">
          Ajouter un nouveau variant
        </h4>
        <div className="flex flex-wrap gap-2">
          <div className="w-full sm:w-1/4">
            <Label
              htmlFor="new-size"
              className="text-xs mb-1 block text-zinc-400"
            >
              Taille
            </Label>
            {isCustomSize ? (
              <div className="flex space-x-1">
                <Input
                  id="custom-size"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Taille personnalisée"
                  className="border-zinc-700/40 h-8 sm:h-9 text-sm bg-zinc-800/50 w-3/4 text-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCustomSize(false)}
                  className="h-8 sm:h-9 w-1/4 text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <Select value={newVariant.size} onValueChange={handleSizeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">
                      Tailles standards
                    </SelectLabel>
                    {standardSizesOptions}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">
                      Tailles italiennes (pantalons)
                    </SelectLabel>
                    {italianSizesOptions}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">
                      Tailles de chaussures Enfant (EU)
                    </SelectLabel>
                    {kidsShoeSizesOptions}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">
                      Tailles de chaussures Adulte (EU)
                    </SelectLabel>
                    {adultShoeSizesOptions}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectItem value="custom">
                      Taille personnalisée...
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="w-full sm:w-1/4">
            <Label
              htmlFor="new-color"
              className="text-xs mb-1 block text-zinc-400"
            >
              Couleur
            </Label>
            {isCustomColor ? (
              <div className="space-y-1.5">
                <div className="flex space-x-1">
                  <div className="relative flex-1">
                    <Input
                      id="custom-color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="Nom de la couleur"
                      className="border-zinc-700/40 h-8 sm:h-9 text-sm bg-zinc-800/50 w-full pl-7 text-white"
                    />
                    <div
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-zinc-700/40"
                      style={{ backgroundColor: customColorHex }}
                    ></div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomColor(false)}
                    className="h-8 sm:h-9 aspect-square flex-shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  >
                    <span>×</span>
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor="color-hex"
                    className="text-[10px] text-zinc-400"
                  >
                    Couleur (optionnel):
                  </Label>
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="color"
                      id="color-hex"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="h-4 w-4 cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] text-zinc-400">
                      {customColorHex}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => saveCustomColor(customColor, customColorHex)}
                    className="h-6 w-full text-xs mt-0.5 border-white/30 text-white hover:bg-white/10"
                  >
                    <span>Bookmark</span> Sauvegarder cette couleur
                  </Button>
                </div>
              </div>
            ) : (
              <Select
                value={newVariant.color}
                onValueChange={handleColorChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une couleur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-zinc-400">
                      Couleurs standard
                    </SelectLabel>
                    {standardColorsOptions}
                  </SelectGroup>

                  {savedCustomColors.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="flex items-center justify-between text-zinc-400">
                        <span>Couleurs personnalisées</span>
                      </SelectLabel>
                      {savedCustomColors.map((color) => (
                        <SelectItem key={color.name} value={color.name}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2 border border-zinc-700/40"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 ml-2 rounded-full hover:bg-red-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomColor(color.name);
                              }}
                            >
                              <span>×</span>
                            </Button>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  <SelectGroup>
                    <SelectItem value="custom">
                      Couleur personnalisée...
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="w-full sm:w-1/6">
            <Label
              htmlFor="new-stock"
              className="text-xs mb-1 block text-zinc-400"
            >
              Stock
            </Label>
            <Input
              id="new-stock"
              type="number"
              value={newVariant.stock}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Quantité"
              className="border-zinc-700/40 h-8 sm:h-9 text-sm bg-zinc-800/50 text-white text-right"
            />
          </div>

          <div className="w-full sm:w-1/4 flex items-end">
            <Button
              onClick={addVariant}
              className="w-full h-8 sm:h-9 bg-white text-black hover:bg-zinc-200"
            >
              <span>+</span> Ajouter
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-center text-xs text-red-400">
            <span>⚠️</span>
            {error}
          </div>
        )}
      </div>

      {variants.length === 0 && (
        <div className="text-xs text-center text-zinc-400 py-2">
          Aucun variant ajouté.
        </div>
      )}
    </div>
  );
});

// Exporter le composant par défaut
export default VariantManager;
