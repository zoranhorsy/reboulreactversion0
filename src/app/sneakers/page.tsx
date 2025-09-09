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

interface SneakersPageProps {
  searchParams: SearchParams;
}

export async function generateMetadata({
  searchParams,
}: SneakersPageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined;
  const brand = searchParams.brand as string | undefined;
  const search = searchParams.search as string | undefined;

  let title = "Sneakers – Salomon, Autry, Asics, Axel Arigato, Off-White";
  let description =
    "Sélection sneakers best-sellers: Salomon, Autry, Asics, Axel Arigato, Off-White. Marseille, Cassis, Sanary.";

  if (category) {
    title = `${category} - Sneakers Reboul`;
    description = `Explorez notre collection de ${category} sneakers chez Reboul.`;
  } else if (brand) {
    title = `${brand} - Sneakers Reboul`;
    description = `Découvrez les sneakers ${brand} chez Reboul.`;
  } else if (search) {
    title = `Résultats pour "${search}" - Sneakers Reboul`;
    description = `Explorez les résultats de recherche pour "${search}" dans notre collection sneakers.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboulstore.com/sneakers",
      images: [
        {
          url: "https://reboulstore.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Reboul Sneakers Collection",
        },
      ],
    },
  };
}

export const viewport: Viewport = defaultViewport;

export default async function SneakersPage({
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
    store_type: "sneakers", // Forcer le type de magasin
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

  const [productsData, categories, brands] = await Promise.all([
    api.fetchProducts(queryParams),
    api.fetchCategories(),
    api.fetchBrands(),
  ]);

  return (
    <Suspense fallback={<LoaderComponent />}>
      <CatalogueShared
        initialProducts={productsData.products || []}
        initialCategories={categories || []}
        initialBrands={brands || []}
        total={productsData.total || 0}
        storeType="sneakers"
        title="Sneakers"
        subtitle="Collection urbaine et street style"
        backLink="/"
        backText="Accueil"
        breadcrumbs={[
          { label: "Sneakers", href: "/sneakers" },
        ]}
      />
    </Suspense>
  );
} 