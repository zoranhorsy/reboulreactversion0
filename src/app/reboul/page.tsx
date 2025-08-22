// Configuration dynamique pour forcer le rendu côté serveur
import { dynamic, revalidate, fetchCache } from "@/app/config";
import { defaultViewport } from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoaderComponent } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { CatalogueShared } from "@/components/catalogue/CatalogueShared";
import type { Product } from "@/lib/types/product";
import type { Category } from "@/lib/types/category";
import type { Brand } from "@/lib/types/brand";

type SearchParams = { [key: string]: string | string[] | undefined };

interface ReboulPageProps {
  searchParams: SearchParams;
}

export async function generateMetadata({
  searchParams,
}: ReboulPageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined;
  const brand = searchParams.brand as string | undefined;
  const search = searchParams.search as string | undefined;

  let title = "Reboul Adulte - Collection Premium";
  let description = "Découvrez notre collection premium pour adultes chez Reboul.";

  if (category) {
    title = `${category} - Reboul Adulte`;
    description = `Explorez notre collection de ${category} pour adultes chez Reboul.`;
  } else if (brand) {
    title = `${brand} - Reboul Adulte`;
    description = `Découvrez les produits ${brand} pour adultes chez Reboul.`;
  } else if (search) {
    title = `Résultats pour "${search}" - Reboul Adulte`;
    description = `Explorez les résultats de recherche pour "${search}" dans notre collection adulte.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboul-store.com/reboul",
      images: [
        {
          url: "https://reboul-store.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Adult Collection",
        },
      ],
    },
  };
}

export const viewport: Viewport = defaultViewport;

export default async function ReboulPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ensureString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || "";
    if (value === undefined) return "";
    return value;
  };

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
    store_type: "adult", // Forcer le type de magasin
    featured: ensureString(searchParams.featured) || "false",
  };

  const brandId = ensureString(searchParams.brand_id);
  if (brandId) {
    queryParams.brand_id = Number(brandId);
  }

  // Nettoyer les paramètres vides
  Object.keys(queryParams).forEach((key) => {
    if (!queryParams[key]) {
      delete queryParams[key];
    }
  });

  console.log('🔍 Query params pour /reboul:', queryParams);
  
  const [productsData, categories, brands] = await Promise.all([
    api.fetchProducts(queryParams),
    api.fetchCategories(),
    api.fetchBrands(),
  ]);
  
  console.log('📦 Résultat productsData:', {
    total: productsData.total,
    productsCount: productsData.products?.length || 0,
    products: productsData.products?.slice(0, 3) // Afficher les 3 premiers produits pour debug
  });

  return (
    <Suspense fallback={<LoaderComponent />}>
      <CatalogueShared
        initialProducts={productsData.products || []}
        initialCategories={categories || []}
        initialBrands={brands || []}
        total={productsData.total || 0}
        storeType="adult"
        title="Reboul Adult"
        subtitle="Collection premium pour adultes"
        backLink="/"
        backText="Accueil"
        breadcrumbs={[
          { label: "Reboul Adult", href: "/reboul" },
        ]}
      />
    </Suspense>
  );
} 