import type { Metadata } from "next"
import { Suspense } from "react"
import ClientOnly from "@/components/ClientOnly"
import { Loader } from "@/components/ui/Loader"
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { fetchProducts, fetchCategories, fetchBrands } from "@/lib/api"
import { Hero } from '@/components/Hero'
import { AdulteContent } from "@/components/adulte/AdulteContent"

type SearchParams = { [key: string]: string | string[] | undefined }

interface AdultePageProps {
  searchParams: SearchParams
}

export async function generateMetadata({ searchParams }: AdultePageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined
  const brand = searchParams.brand as string | undefined
  const search = searchParams.search as string | undefined

  let title = "Collection Adulte - Reboul Store"
  let description = "Découvrez notre sélection de vêtements premium pour adultes chez Reboul Store."

  if (category) {
    title = `${category} - Collection Adulte Reboul Store`
    description = `Explorez notre collection de ${category} pour adultes chez Reboul Store.`
  } else if (brand) {
    title = `${brand} - Collection Adulte Reboul Store`
    description = `Découvrez les produits ${brand} pour adultes disponibles chez Reboul Store.`
  } else if (search) {
    title = `Résultats pour "${search}" - Collection Adulte Reboul Store`
    description = `Explorez les résultats de recherche pour "${search}" dans notre collection adulte Reboul Store.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboul-store.com/adulte",
      images: [
        {
          url: "https://reboul-store.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Store Collection Adulte",
        },
      ],
    },
  }
}

export default async function AdultePage({ searchParams }: AdultePageProps) {
  const page = Number(searchParams.page) || 1
  const limit = 12
  const categoryId = searchParams.categories ? Number(searchParams.categories) || undefined : undefined
  const brandId = searchParams.brand ? Number(searchParams.brand) || undefined : undefined
  const search = searchParams.search as string | undefined

  // Préparer les paramètres de requête en forçant store_type: "adult"
  const queryParams = {
    page,
    limit,
    store_type: "adult", // Toujours forcer le type de magasin à "adult"
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

  // Filter categories and brands that are available in adult store products
  const adultProductCategoryIds = new Set(productsData.products.map(p => p.category_id))
  const adultProductBrands = new Set(productsData.products.map(p => p.brand))

  const categories = allCategories.filter(cat => adultProductCategoryIds.has(cat.id))
  const brands = allBrands.filter(brand => adultProductBrands.has(brand.name))

  return (
    <div className="space-y-8">
      <Hero
        title="Collection Adulte"
        subtitle="Découvrez notre sélection élégante et confortable pour hommes et femmes"
        imageUrl="/images/hero-adult.jpg"
        overlayColor="rgba(0, 0, 0, 0.4)"
        parallax
      />
      <ClientOnly>
        <Suspense fallback={<Loader />}>
          <LocalStorageChecker />
          <AdulteContent
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

