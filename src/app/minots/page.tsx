import type { Metadata } from "next"
import { Suspense } from "react"
import ClientOnly from "@/components/ClientOnly"
import { Loader } from "@/components/ui/Loader"
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { fetchProducts, fetchCategories, fetchBrands } from "@/lib/api"
import { Hero } from '@/components/Hero'
import { MinotsContent } from "@/components/minots/MinotsContent"

type SearchParams = { [key: string]: string | string[] | undefined }

interface MinotsPageProps {
  searchParams: SearchParams
}

export async function generateMetadata({ searchParams }: MinotsPageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined
  const brand = searchParams.brand as string | undefined
  const search = searchParams.search as string | undefined

  let title = "Collection Minots - Reboul Store"
  let description = "Découvrez notre sélection de vêtements premium pour enfants chez Reboul Store."

  if (category) {
    title = `${category} - Collection Minots Reboul Store`
    description = `Explorez notre collection de ${category} pour enfants chez Reboul Store.`
  } else if (brand) {
    title = `${brand} - Collection Minots Reboul Store`
    description = `Découvrez les produits ${brand} pour enfants disponibles chez Reboul Store.`
  } else if (search) {
    title = `Résultats pour "${search}" - Collection Minots Reboul Store`
    description = `Explorez les résultats de recherche pour "${search}" dans notre collection minots Reboul Store.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboul-store.com/minots",
      images: [
        {
          url: "https://reboul-store.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Store Collection Minots",
        },
      ],
    },
  }
}

export default async function MinotsPage({ searchParams }: MinotsPageProps) {
  const page = Number(searchParams.page) || 1
  const limit = 12
  const categoryId = searchParams.categories ? Number(searchParams.categories) || undefined : undefined
  const brandId = searchParams.brand ? Number(searchParams.brand) || undefined : undefined
  const search = searchParams.search as string | undefined

  // Préparer les paramètres de requête en forçant store_type: "kids"
  const queryParams = {
    page,
    limit,
    store_type: "kids", // Toujours forcer le type de magasin à "kids"
    ...(categoryId !== undefined && { category_id: categoryId.toString() }),
    ...(brandId !== undefined && { brand: brandId.toString() }),
    ...(search && { search }),
  }

  // Fetch all data in parallel with forced store_type parameter
  const [productsData, allCategories, allBrands] = await Promise.all([
    fetchProducts(queryParams),
    fetchCategories(),
    fetchBrands(),
  ])

  // Filter categories and brands that are available in kids store products
  const kidsProductCategoryIds = new Set(productsData.products.map(p => p.category_id))
  const kidsProductBrandIds = new Set(productsData.products.map(p => p.brand_id))

  const categories = allCategories.filter(cat => kidsProductCategoryIds.has(cat.id))
  const brands = allBrands.filter(brand => kidsProductBrandIds.has(brand.id))

  return (
    <div className="space-y-8">
      <Hero
        title="Collection Minots"
        subtitle="Découvrez notre sélection tendance et confortable pour les enfants"
        imageUrl="/images/hero-kids.jpg"
        overlayColor="rgba(0, 0, 0, 0.4)"
        parallax
      />
      <ClientOnly>
        <Suspense fallback={<Loader />}>
          <LocalStorageChecker />
          <MinotsContent
            initialProducts={productsData.products}
            total={productsData.total}
            categories={categories}
            brands={brands}
            _currentPage={page}
            searchParams={searchParams}
          />
        </Suspense>
      </ClientOnly>
    </div>
  )
}

