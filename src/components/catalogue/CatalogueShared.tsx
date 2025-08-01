"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MinimalFiltersBar, FilterComponent } from "@/components/catalogue/Filters";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types/product";
import type { Category } from "@/lib/types/category";
import type { Brand } from "@/lib/types/brand";
import {
  type FilterState,
  type FilterChangeHandler,
} from "@/lib/types/filters";
import { ReboulPageHeader } from "@/components/reboul/components/ReboulPageHeader";
import { MobileFilterModal } from "./MobileFilterModal";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useFilterWorker } from "@/hooks/useFilterWorker";
import { rafThrottle } from "@/lib/utils";

// Types pour les store types supportés
export type StoreType = "adult" | "sneakers" | "kids";

interface CatalogueSharedProps {
  initialProducts: Product[];
  total: number;
  initialCategories: Category[];
  initialBrands: Brand[];
  storeType: StoreType;
  title: string;
  subtitle: string;
  backLink?: string;
  backText?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export function CatalogueShared({
  initialProducts,
  total,
  initialCategories,
  initialBrands,
  storeType,
  title,
  subtitle,
  backLink = "/",
  backText = "Accueil",
  breadcrumbs = [],
}: CatalogueSharedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories] = useState<Category[]>(initialCategories);
  const [brands] = useState<Brand[]>(initialBrands);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(total);
  const limitParam = searchParams.get("limit") || "12";
  const [totalPages, setTotalPages] = useState(
    Math.ceil(total / Number(limitParam)),
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { toast } = useToast();
  const {
    filterProducts,
    sortProducts,
    isLoading: isWorkerLoading,
    error: workerError,
  } = useFilterWorker();
  const [localProducts, setLocalProducts] =
    useState<Product[]>(initialProducts);

  // Fonction de secours pour le filtrage local si le worker échoue
  const handleFilterFallback = useCallback(
    (productsList: Product[], filterOptions: any) => {
      // Filtre par catégorie
      if (filterOptions.categories?.length) {
        productsList = productsList.filter((product) => {
          const categoryId = String(product.category_id || "");
          return filterOptions.categories.includes(categoryId);
        });
      }
      // Filtre par marque
      if (filterOptions.brands?.length) {
        productsList = productsList.filter((product) => {
          const brandId = String(product.brand_id || "");
          return filterOptions.brands.includes(brandId);
        });
      }
      // Filtre par prix
      if (filterOptions.priceRange) {
        productsList = productsList.filter((product) => {
          return (
            product.price >= filterOptions.priceRange.min &&
            product.price <= filterOptions.priceRange.max
          );
        });
      }
      // Filtre par taille
      if (filterOptions.sizes?.length) {
        productsList = productsList.filter((product) => {
          if (!product.variants) return false;
          const productSizes = product.variants
            .map((v) => v.size)
            .filter(Boolean);
          return filterOptions.sizes.some((size: string) =>
            productSizes.includes(size),
          );
        });
      }
      // Filtre par couleur
      if (filterOptions.colors?.length) {
        productsList = productsList.filter((product) => {
          if (!product.variants) return false;
          const productColors = product.variants
            .map((v) => v.color?.toLowerCase())
            .filter(Boolean);
          return filterOptions.colors.some((color: string) =>
            productColors.includes(color.toLowerCase()),
          );
        });
      }
      // Filtre par disponibilité
      if (filterOptions.inStock !== undefined) {
        productsList = productsList.filter((product) => {
          if (!product.variants || product.variants.length === 0) {
            return filterOptions.inStock === true;
          }
          const hasStock = product.variants.some((v) => (v.stock || 0) > 0);
          return filterOptions.inStock === hasStock;
        });
      }
      // Filtre par terme de recherche
      if (filterOptions.searchTerm) {
        const searchLower = filterOptions.searchTerm.toLowerCase();
        productsList = productsList.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            (product.brand &&
              product.brand.toLowerCase().includes(searchLower)) ||
            (product.description &&
              product.description.toLowerCase().includes(searchLower)),
        );
      }
      return productsList;
    },
    [],
  );

  // Clé pour stocker/récupérer les filtres dans localStorage
  const FILTERS_STORAGE_KEY = `reboul-${storeType}-filters`;

  // Initialiser les filtres à partir des searchParams ou localStorage
  const initializeFilters = () => {
    // Obtenir les filtres des paramètres d'URL
    const urlFilters: FilterState = {
      page: searchParams.get("page") || "1",
      limit: limitParam,
      category_id: searchParams.get("category_id") || "",
      brand: searchParams.get("brand") || "",
      brand_id: searchParams.get("brand_id") || "",
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "",
      color: searchParams.get("color") || "",
      size: searchParams.get("size") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      store_type: storeType, // Forcer le store_type selon le composant
      featured: searchParams.get("featured") || "",
    };
    // Vérifier si les paramètres d'URL contiennent des filtres actifs
    const hasActiveUrlFilters = Object.entries(urlFilters).some(
      ([key, value]) =>
        value && value !== "" && key !== "page" && key !== "limit" && key !== "store_type",
    );
    // Si les paramètres d'URL sont vides, essayer de récupérer les filtres du localStorage
    if (!hasActiveUrlFilters) {
      try {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters) as FilterState;
          setTimeout(() => {
            setFiltersRestored(true);
          }, 1000);
          return {
            ...parsedFilters,
            page: urlFilters.page,
            limit: urlFilters.limit,
            store_type: storeType, // Toujours forcer le store_type
          };
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des filtres sauvegardés:", error);
      }
    }
    return urlFilters;
  };

  const [filters, setFilters] = useState<FilterState>(initializeFilters());
  const [filtersRestored, setFiltersRestored] = useState(false);

  // Sauvegarder les filtres dans localStorage à chaque changement
  useEffect(() => {
    try {
      // Ne pas sauvegarder page et limit pour éviter de restaurer à une page spécifique
      const { page, limit, store_type, ...filtersToSave } = filters;
      const hasActiveFilters = Object.entries(filtersToSave).some(
        ([key, value]) => value && value !== "",
      );
      if (hasActiveFilters) {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
      } else {
        localStorage.removeItem(FILTERS_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des filtres:", error);
    }
  }, [filters, FILTERS_STORAGE_KEY]);

  // Fonction unique pour mettre à jour les filtres et l'URL
  const handleFilterChange: FilterChangeHandler = useCallback(
    (newFilters) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters, store_type: storeType };
        if (
          "page" in newFilters === false &&
          Object.keys(newFilters).length > 0
        ) {
          updated.page = "1";
        }
        const queryString = new URLSearchParams();
        Object.entries(updated).forEach(([key, value]) => {
          // Ne pas inclure store_type dans l'URL car il est implicite dans le chemin
          if (value && key !== "store_type") {
            if (key === "brand_id" && value) {
              // Gérer brand_id séparément
            } else {
              queryString.set(key, value.toString());
            }
          }
        });
        if (updated.brand_id) {
          queryString.set("brand_id", updated.brand_id.toString());
        }
        const url = `${pathname}?${queryString.toString()}`;
        router.push(url);
        return updated;
      });
    },
    [router, pathname, storeType],
  );

  // Fonction pour extraire les variantes uniques
  const extractVariants = useCallback((productList: Product[]) => {
    const uniqueColors = new Set<string>();
    const uniqueSizes = new Set<string>();
    productList.forEach((product) => {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant.color) uniqueColors.add(variant.color.toLowerCase());
          if (variant.size) uniqueSizes.add(variant.size);
        });
      }
    });
    return {
      colors: Array.from(uniqueColors).sort(),
      sizes: Array.from(uniqueSizes).sort(),
    };
  }, []);

  // Charger les produits
  const loadProducts = useCallback(
    async (newFilters?: FilterState) => {
      try {
        setLoading(true);
        setError(null);
        const queryParams: Record<string, string> = {};
        const filtersToUse = newFilters || filters;
        Object.entries(filtersToUse).forEach(([key, value]) => {
          if (value && value.toString().trim() !== "") {
            queryParams[key] = value.toString();
          }
        });
        // Toujours s'assurer que le store_type est défini
        queryParams.store_type = storeType;
        if (!queryParams.page) queryParams.page = "1";
        if (!queryParams.limit) queryParams.limit = "12";
        const result = await api.fetchProducts(queryParams);
        // Appliquer le filtrage côté client avec le worker
        const filterOptions = {
          categories:
            filtersToUse?.category_id && filtersToUse.category_id !== ""
              ? [filtersToUse.category_id]
              : undefined,
          brands:
            filtersToUse?.brand_id && filtersToUse.brand_id !== ""
              ? [filtersToUse.brand_id]
              : undefined,
          priceRange:
            (filtersToUse?.minPrice && filtersToUse.minPrice !== "") ||
            (filtersToUse?.maxPrice && filtersToUse.maxPrice !== "")
              ? {
                  min:
                    filtersToUse.minPrice && filtersToUse.minPrice !== ""
                      ? Number(filtersToUse.minPrice)
                      : 0,
                  max:
                    filtersToUse.maxPrice && filtersToUse.maxPrice !== ""
                      ? Number(filtersToUse.maxPrice)
                      : Infinity,
                }
              : undefined,
          colors:
            filtersToUse?.color && filtersToUse.color !== ""
              ? [filtersToUse.color]
              : undefined,
          sizes:
            filtersToUse?.size && filtersToUse.size !== ""
              ? [filtersToUse.size]
              : undefined,
          searchTerm:
            filtersToUse?.search && filtersToUse.search !== ""
              ? filtersToUse.search
              : undefined,
          inStock: filtersToUse?.featured === "true" ? true : undefined,
        };
        let filteredProducts = [];
        try {
          filteredProducts = await filterProducts(result.products, filterOptions);
        } catch (workerError) {
          console.error("Erreur avec le worker de filtrage:", workerError);
          filteredProducts = handleFilterFallback(result.products, filterOptions);
          toast({
            title: "Mode de filtrage simplifié",
            description: "Le filtrage avancé a rencontré un problème et a basculé en mode simplifié.",
            variant: "default",
          });
        }
        // Appliquer le tri si nécessaire
        let sortedProducts = filteredProducts;
        if (filtersToUse?.sort) {
          try {
            const [sortBy, sortOrder] = filtersToUse.sort.split("_");
            sortedProducts = await sortProducts(
              filteredProducts,
              sortBy,
              sortOrder as "asc" | "desc",
            );
          } catch (sortError) {
            console.error("Erreur avec le worker de tri:", sortError);
            const [sortBy, sortOrder] = filtersToUse.sort.split("_");
            const sortFactor = sortOrder === "asc" ? 1 : -1;
            sortedProducts = [...filteredProducts].sort((a, b) => {
              if (sortBy === "price") {
                return (a.price - b.price) * sortFactor;
              } else if (sortBy === "newest") {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
              } else if (sortBy === "popular") {
                return (b.popularity || 0) - (a.popularity || 0);
              }
              return 0;
            });
          }
        }
        setProducts(sortedProducts);
        setLocalProducts(result.products);
        setTotalItems(result.total);
        setTotalPages(
          Math.ceil(result.total / Number(filtersToUse?.limit || filters.limit)),
        );
        const { colors: newColors, sizes: newSizes } = extractVariants(result.products);
        setColors(newColors);
        setSizes(newSizes);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des produits",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      filters,
      storeType,
      extractVariants,
      filterProducts,
      sortProducts,
      handleFilterFallback,
      toast,
    ],
  );

  // Charger les produits uniquement quand les filtres changent
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    // Version optimisée avec rafThrottle
    const handleScroll = rafThrottle(() => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
      setShowScrollTop(scrollTop > 500);
    });
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Optimisé avec rafThrottle pour assurer une animation fluide
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = useCallback(() => {
    handleFilterChange({
      page: "1",
      limit: filters.limit,
      category_id: "",
      brand: "",
      brand_id: "",
      search: "",
      sort: "",
      color: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      store_type: storeType,
      featured: "",
    });
  }, [handleFilterChange, filters.limit, storeType]);

  // Extraire les couleurs et tailles uniques à partir des produits
  useEffect(() => {
    const uniqueColors = new Set<string>();
    const uniqueSizes = new Set<string>();
    products.forEach((product) => {
      if (Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant.color) uniqueColors.add(variant.color.toLowerCase());
          if (variant.size) uniqueSizes.add(variant.size);
        });
      }
    });
    setAvailableColors(Array.from(uniqueColors).sort());
    setAvailableSizes(Array.from(uniqueSizes).sort());
  }, [products]);

  // Notification pour les filtres restaurés
  useEffect(() => {
    if (filtersRestored) {
      const activeFiltersCount = Object.entries(filters).filter(
        ([key, value]) =>
          value && value !== "" && key !== "page" && key !== "limit" && key !== "store_type",
      ).length;
      if (activeFiltersCount > 0) {
        toast({
          title: "Filtres restaurés",
          description: `${activeFiltersCount} filtre${activeFiltersCount > 1 ? "s" : ""} de votre session précédente ${activeFiltersCount > 1 ? "ont été restaurés" : "a été restauré"}.`,
          action: (
            <ToastAction altText="Réinitialiser" onClick={handleResetFilters}>
              Réinitialiser
            </ToastAction>
          ),
          duration: 5000,
        });
      }
    }
  }, [filtersRestored, toast, handleResetFilters, filters]);

  // Gérer le cas où le worker échoue complètement
  const handleRetry = () => {
    window.location.reload();
  };

  // Afficher une notification en cas d'erreur du worker
  useEffect(() => {
    if (workerError) {
      toast({
        title: "Problème de performance détecté",
        description: "Le système de filtrage avancé rencontre un problème.",
        variant: "destructive",
        action: (
          <ToastAction altText="Réessayer" onClick={handleRetry}>
            Réessayer
          </ToastAction>
        ),
      });
    }
  }, [workerError, toast]);

  if (workerError && isWorkerLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-6 text-red-500">
          <span>⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">Problème technique détecté</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
          Le système de filtrage avancé rencontre des difficultés.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleRetry} variant="default">
            Réessayer
          </Button>
          <Button onClick={() => router.push("/")} variant="outline">
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReboulPageHeader
        title={title}
        subtitle={subtitle}
        backLink={backLink}
        backText={backText}
        breadcrumbs={breadcrumbs}
      />

      {/* Espacement entre header et filtres */}
      <div className="mt-4" />

      {/* Filtres horizontaux */}
      <MinimalFiltersBar
        categories={categories}
        brands={brands}
        colors={colors}
        sizes={sizes}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Suppression de la sidebar/aside, on ne garde que la grille */}
        <main className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={loading}
            error={error}
            page={Number(filters.page)}
            limit={Number(filters.limit)}
            totalProducts={totalItems}
            totalPages={totalPages}
            onPageChange={(page) =>
              handleFilterChange({ page: page.toString() })
            }
            _onFilterChange={handleFilterChange}
          />
        </main>
      </div>

      {/* Modal des filtres mobile */}
      <MobileFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
        categories={categories}
        brands={brands}
        colors={colors}
        sizes={sizes}
        storeTypes={[]}
      />

      {/* Bouton de retour en haut */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-md z-40"
          onClick={scrollToTop}
        >
          <span>↑</span>
        </Button>
      )}
    </div>
  );
} 