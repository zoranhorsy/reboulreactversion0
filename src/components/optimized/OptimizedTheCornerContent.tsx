"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types/product";
import type { Category } from "@/lib/types/category";
import type { Brand } from "@/lib/types/brand";
import {
  createViewportLoadedComponent,
  useIdlePreload,
} from "@/lib/dynamic-loading-strategies";
import { useFilterWorker } from "@/hooks/useFilterWorker";
// Import optimisé de lodash
import debounce from "lodash/debounce";
// Import d'utilitaires optimisés
import { rafThrottle } from "@/lib/utils";
import { TheCornerPageHeader } from "../the-corner/components/TheCornerPageHeader";

interface TheCornerActiveTagsProps {
  categories: Category[];
  activeFilters: {
    category_id?: string;
    minPrice?: string;
    maxPrice?: string;
    color?: string;
    size?: string;
    search?: string;
  };
  onRemoveFilter: (key: string) => void;
}

// Skeletons pour le chargement
const FiltersSkeleton = () => (
  <div className="w-full lg:w-64 bg-gray-100 dark:bg-zinc-900 rounded-md p-4 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-md mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-md"
        ></div>
      ))}
    </div>
  </div>
);

const TagsSkeleton = () => (
  <div className="flex flex-wrap gap-2">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"
      ></div>
    ))}
  </div>
);

const ProductsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="flex flex-col space-y-2">
        <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-1/2"></div>
      </div>
    ))}
  </div>
);

// Composants avec chargement basé sur la visibilité
const LazyProductGrid = createViewportLoadedComponent<any>(
  () =>
    import("../the-corner/TheCornerProductGrid").then((mod) => ({
      default: mod.TheCornerProductGrid,
    })),
  {
    loadingComponent: (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    ),
    threshold: 0.1,
    rootMargin: "200px",
  },
);

const LazyPagination = createViewportLoadedComponent<any>(
  () =>
    import("../the-corner/TheCornerPagination").then((mod) => ({
      default: mod.TheCornerPagination,
    })),
  {
    loadingComponent: (
      <div className="h-10 w-full flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"
          ></div>
        ))}
      </div>
    ),
    threshold: 0.1,
    rootMargin: "200px",
  },
);

const LazyProductSort = createViewportLoadedComponent<any>(
  () =>
    import("../the-corner/TheCornerProductSort").then((mod) => ({
      default: mod.TheCornerProductSort,
    })),
  {
    loadingComponent: (
      <div className="h-10 w-40 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
    ),
    threshold: 0.1,
    rootMargin: "200px",
  },
);

const LazyActiveTags = createViewportLoadedComponent<TheCornerActiveTagsProps>(
  () =>
    import("../the-corner/TheCornerActiveTags").then((mod) => ({
      default: mod.TheCornerActiveTags,
    })),
  {
    loadingComponent: (
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
    ),
    threshold: 0.1,
    rootMargin: "100px",
  },
);

interface OptimizedTheCornerContentProps {
  initialProducts: Product[];
  total: number;
  categories: Category[];
  brands: Brand[];
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Version optimisée du contenu de la page TheCorner
 *
 * Cette implémentation utilise les stratégies de chargement dynamique pour réduire
 * significativement la taille du bundle JavaScript initial.
 */
export default function OptimizedTheCornerContent({
  initialProducts,
  total,
  categories,
  brands,
  searchParams,
}: OptimizedTheCornerContentProps) {
  const router = useRouter();
  const searchParamsObj = useSearchParams();
  const {
    filterProducts,
    sortProducts,
    isLoading: isWorkerLoading,
    error: workerError,
  } = useFilterWorker();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [localProducts, setLocalProducts] =
    useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState(total);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParamsObj.get("search") || "",
  );
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentPage = Number(searchParamsObj.get("page") || "1");
  const limit = Number(searchParamsObj.get("limit") || "12");

  // Préchargement intelligent pendant les périodes d'inactivité
  useIdlePreload([
    {
      fn: () => import("../the-corner/TheCornerProductGrid"),
      priority: "high",
    },
    {
      fn: () => import("../the-corner/TheCornerPagination"),
      priority: "medium",
    },
  ]);

  // Créer une chaîne de recherche à partir d'un objet de paramètres
  const createQueryString = useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const searchParams = new URLSearchParams(window.location.search);

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, String(value));
        }
      });

      return searchParams.toString();
    },
    [],
  );

  // Gérer les changements de page
  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = createQueryString({ page });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  // Gérer les changements de tri
  const handleSortChange = useCallback(
    (sort: string, order: "asc" | "desc") => {
      const newParams = createQueryString({ sort, order });
      router.push(`/the-corner?${newParams}`);

      // Trier localement pour une meilleure réactivité
      if (localProducts.length > 0) {
        const sortedProducts = sortProducts(localProducts, sort, order);
        if (Array.isArray(sortedProducts)) {
          setProducts(
            sortedProducts.slice(
              (currentPage - 1) * limit,
              currentPage * limit,
            ),
          );
        }
      }
    },
    [
      createQueryString,
      router,
      localProducts,
      sortProducts,
      currentPage,
      limit,
    ],
  );

  // Gérer les changements de filtres
  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newParams = createQueryString({ [key]: value, page: 1 }); // Revenir à la première page
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  // Gérer la suppression d'un filtre
  const handleRemoveFilter = useCallback(
    (key: string) => {
      const newParams = createQueryString({ [key]: null });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  // Compter les filtres actifs
  useEffect(() => {
    let count = 0;
    if (searchParamsObj.get("category_id")) count++;
    if (searchParamsObj.get("minPrice") || searchParamsObj.get("maxPrice"))
      count++;
    if (searchParamsObj.get("color")) count++;
    if (searchParamsObj.get("size")) count++;
    if (searchParamsObj.get("search")) count++;
    setActiveFiltersCount(count);
  }, [searchParamsObj]);

  // Mise à jour de l'UI lorsque les paramètres de recherche changent
  useEffect(() => {
    // Mise à jour de l'état de la recherche
    setSearchQuery(searchParamsObj.get("search") || "");

    // Filtrer les produits localement pour une meilleure réactivité
    const filterParams = {
      category_id: searchParamsObj.get("category_id") || undefined,
      minPrice: searchParamsObj.get("minPrice")
        ? Number(searchParamsObj.get("minPrice"))
        : undefined,
      maxPrice: searchParamsObj.get("maxPrice")
        ? Number(searchParamsObj.get("maxPrice"))
        : undefined,
      color: searchParamsObj.get("color") || undefined,
      size: searchParamsObj.get("size") || undefined,
      search: searchParamsObj.get("search") || undefined,
    };

    if (Object.values(filterParams).some((val) => val !== undefined)) {
      const filtered = filterProducts(localProducts, filterParams as any);
      if (Array.isArray(filtered)) {
        setProducts(
          filtered.slice((currentPage - 1) * limit, currentPage * limit),
        );
        setTotalItems(filtered.length);
      }
    } else {
      setProducts(
        localProducts.slice((currentPage - 1) * limit, currentPage * limit),
      );
      setTotalItems(localProducts.length);
    }
  }, [searchParamsObj, localProducts, currentPage, limit, filterProducts]);

  // Écouter les erreurs du worker
  useEffect(() => {
    if (workerError) {
      setError(`Erreur lors du filtrage: ${workerError}`);
    } else {
      setError(null);
    }
  }, [workerError]);

  // Créer les filtres actifs
  const activeFilters = {
    category_id: searchParamsObj.get("category_id") || undefined,
    minPrice: searchParamsObj.get("minPrice") || undefined,
    maxPrice: searchParamsObj.get("maxPrice") || undefined,
    color: searchParamsObj.get("color") || undefined,
    size: searchParamsObj.get("size") || undefined,
    search: searchParamsObj.get("search") || undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <TheCornerPageHeader />

      <div className="relative">
        <div className="w-full">
          <div className="flex flex-wrap gap-4">
            {/* Filtres - affiché sur lg, dans une modale sur mobile */}
            <div
              className={`fixed inset-0 z-50 bg-background lg:static lg:z-auto lg:bg-transparent transition-all duration-300 transform ${showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
              <div className="h-full overflow-auto p-4 lg:p-0">
                <div className="flex justify-between items-center lg:hidden">
                  <h2 className="font-semibold text-lg">Filtres</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-secondary rounded-full"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 lg:mt-0">
                  <div
                    className="lg:w-64 lg:block"
                    style={{
                      position: "sticky",
                      top: "100px", // Adjust as needed to position it correctly
                    }}
                  >
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4">
                      <h3 className="font-semibold text-lg mb-4">Filtres</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Catégories
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() =>
                                  handleFilterChange(
                                    "category_id",
                                    String(category.id),
                                  )
                                }
                                className={`px-3 py-1.5 text-sm rounded-full border ${
                                  Number(activeFilters.category_id) === category.id
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                                }`}
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Prix
                          </h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={activeFilters.minPrice || ""}
                              onChange={(e) =>
                                handleFilterChange(
                                  "minPrice",
                                  e.target.value,
                                )
                              }
                              className="w-24 px-2 py-1.5 text-sm rounded-md border border-gray-300 dark:border-zinc-700"
                            />
                            <span className="text-gray-500 dark:text-gray-400">
                              à
                            </span>
                            <input
                              type="number"
                              placeholder="Max"
                              value={activeFilters.maxPrice || ""}
                              onChange={(e) =>
                                handleFilterChange(
                                  "maxPrice",
                                  e.target.value,
                                )
                              }
                              className="w-24 px-2 py-1.5 text-sm rounded-md border border-gray-300 dark:border-zinc-700"
                            />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Recherche
                          </h4>
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) =>
                              handleFilterChange("search", e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-300 dark:border-zinc-700"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveFilter("all")}
                          className="w-full px-3 py-2 text-sm text-center rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          Réinitialiser tous les filtres
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 min-w-0">
                  <div className="mb-6">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors lg:hidden"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-filter"
                        >
                          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
                        </svg>
                        <span className="text-sm">Filtres</span>
                        {activeFiltersCount > 0 && (
                          <span className="flex items-center justify-center h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full">
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>

                      <LazyProductSort
                        onSortChange={handleSortChange}
                        initialSort={searchParamsObj.get("sort") || "name"}
                        initialOrder={searchParamsObj.get("order") || "asc"}
                      />
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {totalItems} produit{totalItems !== 1 ? "s" : ""} trouvé
                        {totalItems !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Tags des filtres actifs */}
                    <LazyActiveTags
                      categories={categories}
                      activeFilters={activeFilters}
                      onRemoveFilter={handleRemoveFilter}
                    />

                    {/* Affichage des erreurs */}
                    {error && (
                      <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-alert-triangle"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <path d="M12 9v4" />
                          <path d="m12 17 .01 0" />
                        </svg>
                        {error}
                      </div>
                    )}

                    {isLoading || isWorkerLoading ? (
                      <div className="flex justify-center items-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : products.length > 0 ? (
                      <div className="space-y-8">
                        <LazyProductGrid products={products} />

                        <div className="flex justify-center">
                          <LazyPagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            pageSize={limit}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-20"
                          >
                            <path d="M6.4 19 3 16m3.4 3 17-17m-5 10v6h-6l6-6Z" />
                            <path d="m7.383 11.844 3.242-3.242a1 1 0 0 1 1.414 0l5.186 5.186m-6.6 1.596 1.992-1.992a1 1 0 0 1 1.414 0l1.992 1.992" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          Aucun produit trouvé
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                          Essayez de modifier vos filtres ou d&apos;effectuer une
                          nouvelle recherche pour trouver ce que vous cherchez.
                        </p>
                        <button
                          onClick={() => {
                            router.push("/the-corner");
                          }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Réinitialiser les filtres
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
