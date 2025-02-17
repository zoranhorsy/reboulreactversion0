import { Suspense } from "react"
import { api } from "@/lib/api"
import { KidsContent } from "@/components/kids/KidsContent"
import { Loading } from "@/components/Loading"
import type { SearchParams } from "@/lib/types/search"

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function KidsPage({
  searchParams: rawSearchParams,
}: PageProps) {
  const searchParams: SearchParams = {
    page: String(Number(rawSearchParams.page) || 1),
    limit: String(rawSearchParams.limit) || "12",
    sort: String(rawSearchParams.sort) || "name",
    brand: String(rawSearchParams.brand) || "all",
    category: String(rawSearchParams.category) || "all",
    color: String(rawSearchParams.color) || "all",
    size: String(rawSearchParams.size) || "all",
    search: String(rawSearchParams.search) || "",
    minPrice: String(rawSearchParams.minPrice) || "0",
    maxPrice: String(rawSearchParams.maxPrice) || "1000",
    store_type: "kids",
    featured: String(rawSearchParams.featured) || "false"
  }

  const page = Number(searchParams.page)
  const productsData = await api.fetchProducts({ 
    page: String(page),
    limit: searchParams.limit,
    sort: searchParams.sort,
    brand: searchParams.brand,
    category: searchParams.category,
    color: searchParams.color,
    size: searchParams.size,
    search: searchParams.search,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    featured: searchParams.featured,
    store_type: "kids"
  })
  const allCategories = await api.fetchCategories()
  const allBrands = await api.fetchBrands()

  // Filter categories and brands that are available in kids store products
  const kidsProductCategoryIds = new Set(productsData.products.map(p => p.category_id))
  const kidsProductBrands = new Set(productsData.products.map(p => p.brand))

  const categories = allCategories.filter(cat => kidsProductCategoryIds.has(cat.id))
  const brands = allBrands.filter(brand => kidsProductBrands.has(brand.name))

  return (
    <main className="flex-1 py-8">
      <div className="container">
        <Suspense fallback={<Loading />}>
          <KidsContent
            initialProducts={productsData.products}
            total={productsData.total}
            categories={categories}
            brands={brands}
            _currentPage={page}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </main>
  )
} 