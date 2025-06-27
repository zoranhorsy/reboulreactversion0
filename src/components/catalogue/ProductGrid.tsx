"use client";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { DefinitiveProductCard } from "@/components/DefinitiveProductCard";
import { type FilterChangeHandler } from "@/lib/types/filters";

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  _onFilterChange?: FilterChangeHandler;
}

const ProductGrid = memo(function ProductGrid({
  products = [],
  isLoading,
  error,
  page,
  limit,
  totalProducts,
  totalPages,
  onPageChange,
  _onFilterChange,
}: ProductGridProps) {
  const productsCount = Array.isArray(products) ? products.length : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div
          className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="sr-only">Chargement des produits...</p>
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="w-full rounded-xl aspect-[3/4]" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-[80%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg bg-destructive/10 p-6 text-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(products) || productsCount === 0) {
    return (
      <div className="rounded-lg bg-muted/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {totalProducts} article{totalProducts > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={limit.toString()}
            onValueChange={(value) =>
              _onFilterChange && _onFilterChange({ limit: value, page: "1" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Articles par page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 par page</SelectItem>
              <SelectItem value="24">24 par page</SelectItem>
              <SelectItem value="36">36 par page</SelectItem>
              <SelectItem value="48">48 par page</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value="default"
            onValueChange={(value) =>
              _onFilterChange && _onFilterChange({ sort: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Pertinence</SelectItem>
              <SelectItem value="price_asc">Prix ↑</SelectItem>
              <SelectItem value="price_desc">Prix ↓</SelectItem>
              <SelectItem value="newest">Nouveautés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grille de produits */}
      <div
        className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        aria-live="polite"
      >
        {products.map((product, index) => (
          <DefinitiveProductCard 
            key={product.id} 
            product={product} 
            index={index}
            size="medium"
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
});

export { ProductGrid };
