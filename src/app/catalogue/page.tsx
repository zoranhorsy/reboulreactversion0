import type { Metadata } from 'next'
import { Suspense } from 'react'
import ClientOnly from '@/components/ClientOnly'
import { CatalogueContent } from '@/components/catalogue/CatalogueContent'
import { Loader } from '@/components/ui/Loader'
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/api'

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
      type: 'website',
      url: 'https://reboul-store.com/catalogue',
      images: [
        {
          url: 'https://reboul-store.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Reboul Store Catalogue',
        },
      ],
    },
  }
}

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const page = Number(searchParams.page) || 1
  const limit = 12
  const categoryId = searchParams.categories ? Number(searchParams.categories) : undefined
  const brandId = searchParams.brand ? Number(searchParams.brand) : undefined
  const search = searchParams.search as string | undefined

  const [productsData, categories, brands] = await Promise.all([
    fetchProducts({ page, limit, categoryId, brandId, search }),
    fetchCategories(),
    fetchBrands()
  ])

  return (
    <ClientOnly>
      <Suspense fallback={<Loader />}>
        <LocalStorageChecker />
        <CatalogueContent
          initialProducts={productsData.products}
          total={productsData.total}
          categories={categories}
          brands={brands}
          currentPage={page}
          searchParams={searchParams}
        />
      </Suspense>
    </ClientOnly>
  )
}

