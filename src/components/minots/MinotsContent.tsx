"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filters } from "@/components/catalogue/Filters"
import { ProductGrid } from "@/components/catalogue/ProductGrid"
import { api, type Product, type Category, type Brand } from "@/lib/api"
import { type FilterState } from '@/lib/types/filters'

const defaultFilters: FilterState = {
  page: "1",
  limit: "12",
  category_id: "",
  brand: "",
  brand_id: "",
  search: "",
  sort: "",
  color: "",
  size: "",
  minPrice: "0",
  maxPrice: "1000",
  store_type: "kids",
  featured: "false"
}

export interface MinotsContentProps {
  initialProducts: Product[]
  total: number
  categories: Category[]
  brands: Brand[]
  _currentPage: number
  searchParams: Record<string, string | string[] | undefined>
}

export function MinotsContent({
  initialProducts,
  total: initialTotal,
  categories: initialCategories,
  brands: initialBrands,
  _currentPage,
  searchParams,
}: MinotsContentProps) {
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [total, setTotal] = useState(initialTotal)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories] = useState<Category[]>(initialCategories)
  const [brands] = useState<Brand[]>(initialBrands)
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  const prevFiltersRef = useRef<typeof defaultFilters>()

  const [filters, setFilters] = useState(() => {
    const initialFilters = { ...defaultFilters }
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (key in defaultFilters && value !== undefined && key !== 'store_type') {
          initialFilters[key as keyof typeof defaultFilters] = Array.isArray(value) ? value[0] : value
        }
      })
    }
    return initialFilters
  })

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const activeFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value && value !== "all" && value !== "" && value !== "false") {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, string>,
      )

      // Force store_type à "kids"
      activeFilters.store_type = "kids"

      const result = await api.fetchProducts(activeFilters)
      setProducts(result.products)
      setTotal(result.total)

      // Extraire les couleurs et tailles uniques des produits
      const uniqueColors = new Set<string>()
      const uniqueSizes = new Set<string>()
      result.products.forEach((product) => {
        if (Array.isArray(product.variants)) {
          product.variants.forEach((variant) => {
            if (variant.color) uniqueColors.add(variant.color.toLowerCase())
            if (variant.size) uniqueSizes.add(variant.size)
          })
        }
      })
      setColors(Array.from(uniqueColors).sort())
      setSizes(Array.from(uniqueSizes).sort())
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err)
      setError("Erreur lors du chargement des produits")
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current)) {
      loadProducts()
      prevFiltersRef.current = filters
    }
  }, [loadProducts, filters])

  const updateFilter = useCallback(
    (newFilters: Partial<FilterState>) => {
      setFilters((prevFilters) => {
        const newFilterValues = { ...prevFilters, ...newFilters }
        if (!('page' in newFilters)) {
          newFilterValues.page = "1"
        }

        const params = new URLSearchParams()
        Object.entries(newFilterValues).forEach(([k, val]) => {
          if (val && val !== defaultFilters[k as keyof FilterState] && k !== 'store_type') {
            params.set(k, val)
          }
        })

        const newUrl = `/minots?${params.toString()}`
        router.push(newUrl, { scroll: false })

        return newFilterValues
      })
    },
    [router],
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateFilter({ page: newPage.toString() })
    },
    [updateFilter],
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4">
      <aside className="lg:w-[280px]">
        <div className="hidden lg:block">
          <Filters
            filters={filters}
            categories={categories}
            brands={brands}
            colors={colors}
            sizes={sizes}
            storeTypes={[]}
            onFilterChange={updateFilter}
          />
        </div>
        <div className="lg:hidden">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Filters
                filters={filters}
                categories={categories}
                brands={brands}
                colors={colors}
                sizes={sizes}
                storeTypes={[]}
                onFilterChange={updateFilter}
              />
            </SheetContent>
          </Sheet>
        </div>
      </aside>
      <main className="lg:flex-1">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          page={Number.parseInt(filters.page)}
          limit={Number.parseInt(filters.limit)}
          totalProducts={total}
          totalPages={Math.ceil(total / Number.parseInt(filters.limit))}
          onPageChange={handlePageChange}
          _onFilterChange={updateFilter}
        />
      </main>
    </div>
  )
} 