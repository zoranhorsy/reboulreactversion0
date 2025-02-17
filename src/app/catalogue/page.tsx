import type { Metadata } from "next"
import { Suspense } from "react"
import ClientOnly from "@/components/ClientOnly"
import { CatalogueContent } from "@/components/catalogue/CatalogueContent"
import { Loader } from "@/components/ui/Loader"
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { api } from "@/lib/api"

type SearchParams = { [key: string]: string | string[] | undefined }

interface CataloguePageProps {
  searchParams: SearchParams
}

export async function generateMetadata({ searchParams }: CataloguePageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined
  const brand = searchParams.brand as string | undefined
  const search = searchParams.search as string | undefined

  let title = "Catalogue - Reboul Store"
  let description = "Découvrez notre sélection de vêtements premium chez Reboul Store."

  if (category) {
    title = `${category} - Catalogue Reboul Store`
    description = `Explorez notre collection de ${category} chez Reboul Store.`
  } else if (brand) {
    title = `${brand} - Catalogue Reboul Store`
    description = `Découvrez les produits ${brand} disponibles chez Reboul Store.`
  } else if (search) {
    title = `Résultats pour "${search}" - Catalogue Reboul Store`
    description = `Explorez les résultats de recherche pour "${search}" dans notre catalogue Reboul Store.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboul-store.com/catalogue",
      images: [
        {
          url: "https://reboul-store.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Store Catalogue",
        },
      ],
    },
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || ""
    if (value === undefined) return ""
    return value
  }

  const queryParams: Record<string, string> = {
    page: ensureString(searchParams.page) || "1",
    limit: ensureString(searchParams.limit) || "12",
    category_id: ensureString(searchParams.category_id),
    brand: ensureString(searchParams.brand),
    search: ensureString(searchParams.search),
    sort: ensureString(searchParams.sort),
    color: ensureString(searchParams.color),
    size: ensureString(searchParams.size),
    minPrice: ensureString(searchParams.minPrice) || "0",
    maxPrice: ensureString(searchParams.maxPrice) || "10000",
    store_type: ensureString(searchParams.store_type),
    featured: ensureString(searchParams.featured) || "false"
  }

  // Nettoyer les paramètres vides
  Object.keys(queryParams).forEach(key => {
    if (!queryParams[key]) {
      delete queryParams[key]
    }
  })

  const [productsData, categories, brands] = await Promise.all([
    api.fetchProducts(queryParams),
    api.fetchCategories(),
    api.fetchBrands(),
  ])

  return (
    <ClientOnly>
      <Suspense fallback={<Loader />}>
        <LocalStorageChecker />
        <CatalogueContent
          initialProducts={productsData.products}
          initialCategories={categories}
          initialBrands={brands}
          total={productsData.total}
        />
      </Suspense>
    </ClientOnly>
  )
}

