// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from '@/app/config';

import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import type { Metadata } from "next"
import { Suspense } from "react"
import { LoaderComponent } from "@/components/ui/Loader"
import { api } from "@/lib/api"
import { CatalogueClientContent } from "@/components/catalogue/CatalogueClientContent"
import type { Product } from "@/lib/types/product"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"

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

interface CatalogueWrapperProps {
  initialProducts: Product[]
  initialCategories: Category[]
  initialBrands: Brand[]
  total: number
}

function CatalogueClientWrapper(props: CatalogueWrapperProps) {
  return <CatalogueClientContent {...props} />
}

export const viewport: Viewport = defaultViewport;

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

  const queryParams: Record<string, string | number> = {
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
    store_type: "reboul",
    featured: ensureString(searchParams.featured) || "false"
  }

  const brandId = ensureString(searchParams.brand_id);
  if (brandId) {
    queryParams.brand_id = Number(brandId);
  }

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
    <ClientPageWrapper>
      <Suspense fallback={<LoaderComponent />}>
      <CatalogueClientWrapper
        initialProducts={productsData.products}
        initialCategories={categories}
        initialBrands={brands}
        total={productsData.total}
      />
    </Suspense>
    </ClientPageWrapper>
  );}

