"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/lib/types/product";
import { Category } from "@/lib/types/category";
import { TheCornerProductGrid } from "@/components/the-corner/TheCornerProductGrid";
import { TheCornerPagination } from "@/components/the-corner/TheCornerPagination";
import { api } from "@/lib/api";
import { TheCornerProductSort } from "@/components/the-corner/TheCornerProductSort";
import Image from "next/image";
import { motion } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import debounce from "lodash/debounce";
import { TheCornerPageHeader } from "./components/TheCornerPageHeader";
import { TheCornerActiveTags } from "./TheCornerActiveTags";
import { useFilterWorker } from "@/hooks/useFilterWorker";
import { rafThrottle } from "@/lib/utils";
import { default as TheCornerProductCard } from "@/components/optimized/TheCornerProductCard";
import { MinimalFiltersBar } from "@/components/catalogue/Filters";

interface TheCornerClientContentProps {
  initialProducts: Product[];
  initialCategories: Category[];
  total: number;
  searchParams: { [key: string]: string | string[] | undefined };
}

interface FilterChangeEvent {
  category_id?: string;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  size?: string;
  search?: string;
}

export function TheCornerClientContent({
  initialProducts,
  initialCategories,
  total,
  searchParams,
}: TheCornerClientContentProps) {
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
  const [categories] = useState<Category[]>(initialCategories);
  const [totalItems, setTotalItems] = useState(total);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParamsObj.get("search") || "",
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  const currentPage = Number(searchParamsObj.get("page") || "1");
  const limit = Number(searchParamsObj.get("limit") || "12");

  // Variables dérivées des paramètres de recherche
  const selectedCategory = searchParamsObj.get("category_id") || "";
  const selectedColor = searchParamsObj.get("color") || "";
  const selectedSize = searchParamsObj.get("size") || "";
  const minPrice = searchParamsObj.get("minPrice") || "";
  const maxPrice = searchParamsObj.get("maxPrice") || "";

  // Vérifier si des filtres sont actifs
  const hasActiveFilters =
    searchParamsObj.has("category_id") ||
    searchParamsObj.has("brand_id") ||
    searchParamsObj.has("color") ||
    searchParamsObj.has("size") ||
    searchParamsObj.has("minPrice") ||
    searchParamsObj.has("maxPrice") ||
    searchParamsObj.has("search");

  // Appliquer le filtrage et le tri aux produits
  const applyFiltersAndSort = useCallback(async () => {
    if (!localProducts.length) return;

    try {
      setIsLoading(true);
      setError(null);

      // Préparer les options de filtrage
      const filterOptions = {
        categories: searchParamsObj.getAll("category_id"),
        brands: searchParamsObj.getAll("brand_id"),
        priceRange:
          searchParamsObj.get("minPrice") &&
          searchParamsObj.get("maxPrice") &&
          searchParamsObj.get("minPrice") !== "" &&
          searchParamsObj.get("maxPrice") !== ""
            ? {
                min: Number(searchParamsObj.get("minPrice")),
                max: Number(searchParamsObj.get("maxPrice")),
              }
            : undefined,
        colors: searchParamsObj.getAll("color"),
        sizes: searchParamsObj.getAll("size"),
        searchTerm: searchParamsObj.get("search") || undefined,
      };

      // Appliquer le filtrage
      let filteredProducts = await filterProducts(localProducts, filterOptions);

      // Appliquer le tri si nécessaire
      const sort = searchParamsObj.get("sort");
      const order = searchParamsObj.get("order");
      if (sort && order) {
        filteredProducts = await sortProducts(
          filteredProducts,
          sort,
          order as "asc" | "desc",
        );
      }

      setProducts(filteredProducts);
      setTotalItems(filteredProducts.length);
    } catch (error) {
      console.error("Erreur lors du filtrage des produits:", error);
      setError(
        "Une erreur s'est produite lors du filtrage des produits. Veuillez réessayer.",
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [localProducts, searchParamsObj, filterProducts, sortProducts]);

  // Effet pour appliquer les filtres initiaux
  useEffect(() => {
    if (initialProducts && total) {
      applyFiltersAndSort();
    }
  }, [initialProducts, total, applyFiltersAndSort, hasActiveFilters]);

  // Gérer l'erreur du worker
  useEffect(() => {
    if (workerError) {
      console.error("Erreur du worker:", workerError);
      setError(`Erreur du worker: ${workerError}`);
    }
  }, [workerError]);

  // Appliquer les filtres quand les paramètres de recherche changent
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort, searchParamsObj]);

  useEffect(() => {
    setSearchQuery(searchParamsObj.get("search") || "");
  }, [searchParamsObj]);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParamsObj.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParamsObj],
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (query: string) => {
      const handler = debounce((q: string) => {
        const newParams = createQueryString({
          search: q || null,
          page: 1,
        });
        router.push(`/the-corner?${newParams}`);
      }, 500);

      handler(query);

      return () => {
        handler.cancel();
      };
    },
    [router, createQueryString],
  );

  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .flatMap((product) => product.variants || [])
            .map((variant) => variant.color),
        ),
      ).sort(),
    [products],
  );

  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .flatMap((product) => product.variants || [])
            .map((variant) => variant.size),
        ),
      ).sort((a, b) => {
        const aType = a.startsWith("EU") ? 0 : a.startsWith("IT") ? 1 : 2;
        const bType = b.startsWith("EU") ? 0 : b.startsWith("IT") ? 1 : 2;
        if (aType !== bType) return aType - bType;

        if (aType === 0 || aType === 1) {
          const aNum = parseFloat(a.split(" ")[1]);
          const bNum = parseFloat(b.split(" ")[1]);
          return aNum - bNum;
        }

        const sizeOrder = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };
        return (
          (sizeOrder[a as keyof typeof sizeOrder] || 0) -
          (sizeOrder[b as keyof typeof sizeOrder] || 0)
        );
      }),
    [products],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newParams = createQueryString({
        search: searchQuery || null,
        page: 1,
      });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router, searchQuery],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page === currentPage) return;

      const newParams = createQueryString({ page });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, currentPage, router],
  );

  const handleSortChange = useCallback(
    (sort: string, order: string) => {
      const newParams = createQueryString({ sort, order, page: 1 });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  const handleFilterChange = useCallback(
    (filters: Record<string, string | number | null>) => {
      const allParams = { ...filters, page: 1 };
      const newParams = createQueryString(allParams);
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    router.push("/the-corner");
  }, [router]);

  // Scroll to top handler
  useEffect(() => {
    // Version originale non optimisée
    // const handleScroll = () => {
    //   setShowScrollTop(window.scrollY > 500)
    // }

    // Version optimisée avec rafThrottle pour éviter le blocage du thread principal
    const handleScroll = rafThrottle(() => {
      setShowScrollTop(window.scrollY > 500);
    });

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Update active filters count
  useEffect(() => {
    const count = [
      "category_id",
      "minPrice",
      "maxPrice",
      "color",
      "size",
      "search",
    ].filter((param) => searchParamsObj.has(param)).length;
    setActiveFiltersCount(count);
  }, [searchParamsObj]);

  const handleRemoveFilter = useCallback(
    (key: string) => {
      const newParams = createQueryString({ [key]: null });
      router.push(`/the-corner?${newParams}`);
    },
    [createQueryString, router],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header principal de The Corner */}
      <TheCornerPageHeader
        title="The Corner"
        subtitle="Découvrez notre sélection exclusive de vêtements premium"
        backLink="/"
        backText="Accueil"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "The Corner", href: "/the-corner" },
        ]}
      />

      {/* Espacement entre header et filtres */}
      <div className="mt-4" />

      {/* Barre de filtres minimaliste */}
      <MinimalFiltersBar
        categories={categories}
        brands={[]}
        colors={availableColors}
        sizes={availableSizes}
        filters={{
          page: "1",
          limit: "12",
          category_id: selectedCategory,
          color: selectedColor,
          size: selectedSize,
          brand: "",
          brand_id: "",
          search: searchQuery,
          sort: "",
          minPrice: "",
          maxPrice: "",
          store_type: "cpcompany",
          featured: "false",
        }}
        onFilterChange={(newFilters) => handleFilterChange(newFilters as Record<string, string | number | null>)}
      />

      {/* Section des produits */}
      <motion.div
        id="products-section"
        className="relative pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lg:flex min-h-[calc(100vh-8rem)]">

          {/* Liste des produits */}
          <main className="w-full">
            {/* Header fixe */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3 space-y-3">
                {/* Barre de recherche */}
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-full bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background text-foreground placeholder:text-muted-foreground/70"
                  />
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  {(isLoading || isWorkerLoading) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                {/* Contrôles */}
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

                  <TheCornerProductSort
                    onSortChange={handleSortChange}
                    initialSort={searchParamsObj.get("sort") || "name"}
                    initialOrder={searchParamsObj.get("order") || "asc"}
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="px-4 py-4 lg:container lg:mx-auto lg:py-8">
              <div className="space-y-6">
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-muted-foreground">
                    {totalItems} produit{totalItems !== 1 ? "s" : ""} trouvé
                    {totalItems !== 1 ? "s" : ""}
                  </p>
                </motion.div>

                {/* Tags des filtres actifs */}
                <TheCornerActiveTags
                  categories={categories}
                  activeFilters={{
                    category_id:
                      searchParamsObj.get("category_id") || undefined,
                    minPrice: searchParamsObj.get("minPrice") || undefined,
                    maxPrice: searchParamsObj.get("maxPrice") || undefined,
                    color: searchParamsObj.get("color") || undefined,
                    size: searchParamsObj.get("size") || undefined,
                    search: searchParamsObj.get("search") || undefined,
                  }}
                  onRemoveFilter={handleRemoveFilter}
                />

                {/* Affichage des erreurs */}
                {error && (
                  <motion.div
                    className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="m12 17 .01 0" />
                    </svg>
                    {error}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {isLoading || isWorkerLoading ? (
                    <motion.div
                      key="loading"
                      className="flex justify-center items-center min-h-[300px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </motion.div>
                  ) : products.length > 0 ? (
                    <motion.div
                      key="products"
                      className="space-y-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Grille de produits avec ProductCard optimisé */}
                      <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((product, index) => (
                          <TheCornerProductCard key={product.id} product={product} index={index} />
                        ))}
                      </div>
                      {/* Pagination */}
                      <div className="flex justify-center">
                        <TheCornerPagination
                          currentPage={currentPage}
                          totalItems={totalItems}
                          pageSize={limit}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="text-center py-16 bg-secondary/5 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Essayez de modifier vos filtres ou d&apos;effectuer une
                        autre recherche.
                      </p>
                      <motion.button
                        onClick={clearFilters}
                        className="px-6 py-2.5 text-sm bg-secondary/50 text-secondary-foreground rounded-full hover:bg-secondary transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Réinitialiser les filtres
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>
      </motion.div>

      {/* Bouton Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
