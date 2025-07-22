import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { AnimatePresence } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterComponent } from "./Filters";
import { Category } from "@/lib/types/category";
import { Brand } from "@/lib/types/brand";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FilterState } from "@/lib/types/filters";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  categories: Category[];
  brands: Brand[];
  colors: string[];
  sizes: string[];
  storeTypes: string[];
}

export function MobileFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  categories,
  brands,
  colors,
  sizes,
  storeTypes,
}: MobileFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Prévisualiser les résultats avec les filtres actuels
  const previewResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.fetchProducts({
        ...localFilters,
        page: "1",
        limit: "1",
      });
      setPreviewCount(result.total);
    } catch (error) {
      console.error("Erreur lors de la prévisualisation:", error);
      setPreviewCount(null);
    } finally {
      setIsLoading(false);
    }
  }, [localFilters]);

  // Mettre à jour les filtres locaux quand les filtres globaux changent
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      previewResults();
    }
  }, [localFilters, isOpen, filters, previewResults]);

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    const filterKeys = Object.keys(localFilters);
    let count = 0;

    for (const key of filterKeys) {
      if (
        localFilters[key] &&
        key !== "sort" &&
        key !== "view" &&
        key !== "page" &&
        key !== "limit"
      ) {
        count++;
      }
    }

    setActiveFilterCount(count);

    // Prévisualiser le nombre de résultats si des filtres sont appliqués
    if (isOpen && JSON.stringify(localFilters) !== JSON.stringify(filters)) {
      previewResults();
    }
  }, [localFilters, isOpen, filters, previewResults]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setLocalFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    // Conserver le tri et le mode d'affichage
    const { sort, view } = localFilters;
    setLocalFilters({
      page: "1",
      limit: "12",
      category_id: "",
      brand: "",
      brand_id: "",
      color: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      featured: "",
      store_type: "",
      sort,
      view,
    });
    setPreviewCount(null);
  }, [localFilters]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Délai pour permettre à l'animation de se terminer
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const applyFilters = useCallback(() => {
    onApplyFilters(localFilters);
    handleClose();
  }, [localFilters, onApplyFilters, handleClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sombre */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal de filtres */}
          <motion.div
            className="fixed inset-y-0 left-0 z-[70] w-[90%] max-w-[360px] bg-background shadow-xl flex flex-col h-full"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Filtres</h2>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-9 w-9 rounded-full hover:bg-muted"
              >
                <span>×</span>
              </Button>
            </div>

            {/* Contenu des filtres */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <FilterComponent
                    filters={localFilters}
                    categories={categories}
                    brands={brands}
                    colors={colors}
                    sizes={sizes}
                    storeTypes={storeTypes}
                    availableColors={colors}
                    availableSizes={sizes}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Pied de page avec boutons d'action */}
            <div className="border-t p-4 bg-background/95 shadow-lg">
              {/* Prévisualisation des résultats */}
              {(previewCount !== null || isLoading) && (
                <div className="mb-3 text-center">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      Calcul des résultats...
                    </div>
                  ) : (
                    <p className="text-sm font-medium">
                      <span className="text-primary">{previewCount}</span>{" "}
                      produit{previewCount !== 1 ? "s" : ""} correspondant
                      {previewCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 h-12 rounded-full"
                >
                  <span>RotateCcw</span>
                  Réinitialiser
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex-1 h-12 rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    ""
                  )}
                  Appliquer
                  {activeFilterCount > 0 && ` (${activeFilterCount})`}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
