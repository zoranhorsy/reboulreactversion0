"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Brand } from "@/lib/types/brand";
import { Product, Category } from "@/lib/api";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils/optimized-utils";
import { api } from "@/lib/api";
import { useFilterWorker } from "@/hooks/useFilterWorker";

interface FilteredItem extends Partial<Category & Brand> {
  _type: "category" | "brand";
  id: number;
  name: string;
}

interface SearchAutocompleteProps {
  onSearch: (value: string) => void;
  value: string;
  categories: Category[];
  brands: Brand[];
  placeholder?: string;
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  onBrandSelect?: (brandId: string) => void;
}

export function SearchAutocomplete({
  onSearch,
  value,
  categories,
  brands,
  placeholder = "Rechercher un produit...",
  className,
  onCategorySelect,
  onBrandSelect,
}: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [hasError, setHasError] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const {
    filterProducts,
    isLoading: isWorkerLoading,
    error: workerError,
  } = useFilterWorker();

  // Fallback pour le filtrage manuel si le worker échoue
  const filterFallback = useCallback(() => {
    // Filtrer manuellement les catégories et marques
    const filteredCats = categories
      .filter((category) =>
        category.name.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 3);

    const filteredBrs = brands
      .filter((brand) =>
        brand.name.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 3);

    setFilteredCategories(filteredCats);
    setFilteredBrands(filteredBrs);
  }, [categories, brands, inputValue]);

  // Gestionnaire de clic en dehors du composant pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestionnaire de touche pour la navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Échap pour fermer
    if (e.key === "Escape") {
      setOpen(false);
    }

    // Flèche du bas pour ouvrir les suggestions
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  // Fonction debounce pour rechercher des produits
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsLoading(false);
        setHasError(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem("token");
        console.log(
          "SearchAutocomplete - Recherche avec token:",
          token ? "présent" : "absent",
        );

        if (!token) {
          console.warn(
            "Recherche sans authentification - fonctionnalité limitée",
          );
          setRequiresAuth(true);
          setIsLoading(false);
          return;
        }

        setRequiresAuth(false);
        console.log(`SearchAutocomplete - Début de recherche pour: "${query}"`);
        const results = await api.searchProducts(query);
        console.log(
          `SearchAutocomplete - Résultats reçus:`,
          results?.length || 0,
        );
        setSearchResults(results?.slice(0, 5) || []); // Limiter à 5 résultats
      } catch (error) {
        console.error(
          "SearchAutocomplete - Erreur lors de la recherche:",
          error,
        );
        setSearchResults([]);
        setHasError(true);
        // Ajouter une vérification pour les erreurs d'autorisation
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("unauthorized") ||
            error.message.includes("token"))
        ) {
          setRequiresAuth(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  // Appliquer la recherche lorsque la valeur d'entrée change
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filtrer les catégories et marques avec le worker quand inputValue change
  useEffect(() => {
    const filterCategoriesAndBrands = async () => {
      if (!inputValue || inputValue.length < 2) {
        setFilteredCategories([]);
        setFilteredBrands([]);
        return;
      }

      try {
        // Filtrer les catégories avec le worker
        const categoriesWithCustomType = categories.map((cat) => ({
          ...cat,
          _type: "category", // Propriété spéciale pour identifier le type
        }));

        // Filtrer les marques avec le worker
        const brandsWithCustomType = brands.map((brand) => ({
          ...brand,
          _type: "brand", // Propriété spéciale pour identifier le type
        }));

        // Combiner les deux tableaux pour un seul appel au worker
        const combinedData = [
          ...categoriesWithCustomType,
          ...brandsWithCustomType,
        ];

        // Configuration du filtre pour rechercher dans les noms
        const filterOptions = {
          searchTerm: inputValue,
        };

        // Appliquer le filtre via le worker
        const filteredResults = await filterProducts(
          combinedData,
          filterOptions,
        );

        // Séparer les résultats filtrés par type
        const filteredCats = filteredResults
          .filter((item: FilteredItem) => item._type === "category")
          .map((item: FilteredItem) => ({
            id: item.id,
            name: item.name,
          })) as Category[];

        const filteredBrs = filteredResults
          .filter((item: FilteredItem) => item._type === "brand")
          .map((item: FilteredItem) => ({
            id: item.id,
            name: item.name,
          })) as Brand[];

        // Limiter à 3 résultats pour chaque type
        setFilteredCategories(filteredCats.slice(0, 3));
        setFilteredBrands(filteredBrs.slice(0, 3));
      } catch (error) {
        console.error("Erreur lors du filtrage avec worker:", error);
        // Fallback au filtrage manuel en cas d'erreur
        filterFallback();
      }
    };

    filterCategoriesAndBrands();
  }, [inputValue, categories, brands, filterProducts, filterFallback]);

  // Gestionnaire de changement de l'entrée
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsLoading(value.length >= 2);
    setOpen(value.length > 0);
    searchProducts(value);
  };

  // Gestionnaire de sélection d'un élément
  const handleSelect = (
    value: string,
    type: "product" | "category" | "brand",
    id?: string,
  ) => {
    setInputValue(value);

    if (type === "product") {
      onSearch(value);
    } else if (type === "category" && onCategorySelect && id) {
      onCategorySelect(id);
    } else if (type === "brand" && onBrandSelect && id) {
      onBrandSelect(id);
    }

    setOpen(false);

    // Remettre le focus sur l'input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Gérer les erreurs du worker
  useEffect(() => {
    if (workerError) {
      console.error("Erreur du worker dans SearchAutocomplete:", workerError);
      filterFallback();
    }
  }, [workerError, filterFallback]);

  return (
    <div className={cn("relative w-full", className)} ref={commandRef}>
      <div className="relative">
        <span>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => inputValue && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-7 sm:pl-9 h-8 sm:h-10 text-xs sm:text-sm w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue("");
              onSearch("");
              setOpen(false);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center hover:bg-muted/70 transition-colors"
          >
            <span>×</span>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute w-full z-50 mt-1 shadow-md rounded-md overflow-hidden bg-popover border border-border">
          <div className="max-h-[300px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Recherche en cours...
                </p>
              </div>
            ) : (
              <>
                {requiresAuth && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-amber-600 font-medium">
                      Connectez-vous pour utiliser la recherche avancée
                    </p>
                    <a
                      href="/connexion"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Se connecter
                    </a>
                  </div>
                )}

                {hasError && !requiresAuth && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-red-600 font-medium">
                      Erreur lors de la recherche
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Le service de recherche est temporairement indisponible
                    </p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1 px-2">
                      Produits
                    </p>
                    {searchResults.map((product) => (
                      <div
                        key={`product-${product.id}`}
                        className="px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleSelect(product.name, "product")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(product.name, "product");
                          }
                        }}
                      >
                        <span>🛍️</span>
                        <span className="flex-1 truncate">{product.name}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {typeof product.price === "number"
                            ? `${product.price.toFixed(2)} €`
                            : product.price || "Prix non disponible"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredCategories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1 px-2">
                      Catégories
                    </p>
                    {filteredCategories.map((category) => (
                      <div
                        key={`category-${category.id}`}
                        className="px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() =>
                          handleSelect(
                            category.name,
                            "category",
                            category.id.toString(),
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(
                              category.name,
                              "category",
                              category.id.toString(),
                            );
                          }
                        }}
                      >
                        <span>LayoutGrid</span>
                        <span>{category.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredBrands.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1 px-2">
                      Marques
                    </p>
                    {filteredBrands.map((brand) => (
                      <div
                        key={`brand-${brand.id}`}
                        className="px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() =>
                          handleSelect(brand.name, "brand", brand.id.toString())
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelect(
                              brand.name,
                              "brand",
                              brand.id.toString(),
                            );
                          }
                        }}
                      >
                        <span>Tag</span>
                        <span>{brand.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 &&
                  filteredCategories.length === 0 &&
                  filteredBrands.length === 0 &&
                  inputValue.length > 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Aucun résultat trouvé pour &quot;{inputValue}&quot;
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
