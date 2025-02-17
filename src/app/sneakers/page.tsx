import type { Metadata } from "next"
import { Suspense } from "react"
import ClientOnly from "@/components/ClientOnly"
import { Loader } from "@/components/ui/Loader"
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { fetchProducts, fetchCategories, fetchBrands } from "@/lib/api"
import { Hero } from '@/components/Hero'
import { SneakersContent } from "@/components/sneakers/SneakersContent"

type SearchParams = { [key: string]: string | string[] | undefined }

interface SneakersPageProps {
  searchParams: SearchParams
}

export async function generateMetadata({ searchParams }: SneakersPageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined
  const brand = searchParams.brand as string | undefined
  const search = searchParams.search as string | undefined

  let title = "Collection Sneakers - Reboul Store"
  let description = "Découvrez notre sélection de sneakers premium chez Reboul Store."

  if (category) {
    title = `${category} - Collection Sneakers Reboul Store`
    description = `Explorez notre collection de ${category} sneakers chez Reboul Store.`
  } else if (brand) {
    title = `${brand} - Collection Sneakers Reboul Store`
    description = `Découvrez les sneakers ${brand} disponibles chez Reboul Store.`
  } else if (search) {
    title = `Résultats pour "${search}" - Collection Sneakers Reboul Store`
    description = `Explorez les résultats de recherche pour "${search}" dans notre collection sneakers Reboul Store.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboul-store.com/sneakers",
      images: [
        {
          url: "https://reboul-store.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Store Collection Sneakers",
        },
      ],
    },
  }
}

export default async function SneakersPage({ searchParams }: SneakersPageProps) {
  const page = Number(searchParams.page) || 1
  const limit = 12
  const categoryId = searchParams.categories ? Number(searchParams.categories) || undefined : undefined
  const brandId = searchParams.brand ? Number(searchParams.brand) || undefined : undefined
  const search = searchParams.search as string | undefined

  // Préparer les paramètres de requête en forçant store_type: "sneakers"
  const queryParams = {
    page,
    limit,
    store_type: "sneakers", // Toujours forcer le type de magasin à "sneakers"
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

  // Filter categories and brands that are available in sneakers store products
  const sneakersProductCategoryIds = new Set(productsData.products.map(p => p.category_id))
  const sneakersProductBrands = new Set(productsData.products.map(p => p.brand))

  const categories = allCategories.filter(cat => sneakersProductCategoryIds.has(cat.id))
  const brands = allBrands.filter(brand => sneakersProductBrands.has(brand.name))

  return (
    <div className="space-y-8">
      <Hero
        title="Collection Sneakers"
        subtitle="Découvrez notre sélection exclusive de sneakers"
        imageUrl="/images/hero-sneakers.jpg"
        overlayColor="rgba(0, 0, 0, 0.4)"
        parallax
      />
      <ClientOnly>
        <Suspense fallback={<Loader />}>
          <LocalStorageChecker />
          <SneakersContent
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

