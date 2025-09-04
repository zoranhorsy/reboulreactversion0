// Importer la configuration globale pour forcer le rendu dynamique
import { revalidate, fetchCache } from "@/app/config";

import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoaderComponent } from "@/components/ui/Loader";
import { api } from "@/lib/api";

// Import dynamique pour le composant optimisé
import dynamic from "next/dynamic";

// Import des types nécessaires
import type { Product } from "@/lib/types/product";
import type { Category } from "@/lib/types/category";
import type { Brand } from "@/lib/types/brand";

// Import direct pour débugger
import { TheCornerClientContent } from "@/components/the-corner/TheCornerClientContent";

// Chargement dynamique du contenu optimisé
const OptimizedTheCornerContent = dynamic(
  () => import("@/components/optimized/OptimizedTheCornerContent"),
  {
    loading: () => <LoaderComponent />,
    ssr: true,
  },
);

type SearchParams = { [key: string]: string | string[] | undefined };

interface TheCornerPageProps {
  searchParams: SearchParams;
}

export async function generateMetadata({
  searchParams,
}: TheCornerPageProps): Promise<Metadata> {
  const category = searchParams.categories as string | undefined;
  const brand = searchParams.brand as string | undefined;
  const search = searchParams.search as string | undefined;

  let title = "The Corner - Reboul Store";
  let description =
    "Découvrez notre sélection de vêtements premium de The Corner chez Reboul Store.";

  if (category) {
    title = `${category} - The Corner | Reboul Store`;
    description = `Explorez notre collection ${category} de The Corner chez Reboul Store.`;
  } else if (brand) {
    title = `${brand} - The Corner | Reboul Store`;
    description = `Découvrez les produits ${brand} disponibles dans notre espace The Corner.`;
  } else if (search) {
    title = `Résultats pour "${search}" - The Corner | Reboul Store`;
    description = `Explorez les résultats de recherche pour "${search}" dans notre espace The Corner.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://reboulstore.com/the-corner",
      images: [
        {
          url: "https://reboulstore.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "The Corner by Reboul Store",
        },
      ],
    },
  };
}

export const viewport: Viewport = defaultViewport;

export default async function TheCornerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  console.log("searchParams reçus:", searchParams);

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
    featured: ensureString(searchParams.featured) || "false",
  };

  // Traiter brand_id séparément car c'est un nombre
  const brandId = ensureString(searchParams.brand_id);
  if (brandId) {
    queryParams.brand_id = Number(brandId);
  }

  console.log("queryParams avant nettoyage:", queryParams);

  // Nettoyer les paramètres vides
  Object.keys(queryParams).forEach((key) => {
    if (!queryParams[key]) {
      delete queryParams[key];
    }
  });

  console.log("queryParams après nettoyage:", queryParams);

  const [productsData, categories, brands] = await Promise.all([
    api.fetchCornerProducts(queryParams),
    api.fetchCategories(),
    api.fetchBrands(),
  ]);

  return (
    <ClientPageWrapper>
      <Suspense fallback={<LoaderComponent />}>
        <TheCornerClientContent
          initialProducts={productsData?.products || []}
          total={productsData?.total || 0}
          initialCategories={categories}
          searchParams={searchParams}
        />
      </Suspense>
    </ClientPageWrapper>
  );
}
