import { Product } from "../types/product";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://reboul-store-api-production.up.railway.app/api";
const ITEMS_PER_PAGE = 12;

// Type pour la réponse paginée
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Cache en mémoire avec TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fonction utilitaire pour le cache avec stale-while-revalidate
async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL,
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  // Si on a des données en cache qui ne sont pas trop vieilles, on les retourne
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  // Si on a des données périmées, on les retourne mais on revalide en arrière-plan
  if (cached) {
    // Revalidation en arrière-plan
    fetchFn()
      .then((newData) => {
        cache.set(key, { data: newData, timestamp: now });
      })
      .catch(console.error);

    return cached.data;
  }

  // Si on n'a pas de données, on fait l'appel et on met en cache
  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}

// Produits de fallback plus réalistes pour la production
const createFallbackProducts = (count: number = 8): Product[] => {
  const categories = ["Sneakers", "Streetwear", "Accessoires"];
  const brands = ["Nike", "Adidas", "New Balance", "Converse"];
  const sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
  const colors = ["Noir", "Blanc", "Gris", "Bleu"];

  return Array.from({ length: count }, (_, i) => ({
    id: `fallback-${i}`,
    name: `${brands[i % brands.length]} Collection Premium`,
    description:
      "Produit temporairement indisponible. Nos équipes travaillent pour rétablir l'accès à notre catalogue complet.",
    price: 99.99,
    category_id: (i % 3) + 1,
    category: categories[i % categories.length],
    brand_id: (i % 4) + 1,
    brand: brands[i % brands.length],
    image_url: "/images/fallback-product.jpg", // Image de placeholder à ajouter dans public/images
    image: "/images/fallback-product.jpg",
    images: ["/images/fallback-product.jpg"],
    variants: [
      {
        id: i * 3,
        size: sizes[i % sizes.length],
        color: colors[i % colors.length],
        stock: 0, // Stock à 0 pour indiquer l'indisponibilité
      },
    ],
    tags: ["temporaire"],
    details: ["Produit temporairement indisponible"],
    reviews: [],
    questions: [],
    faqs: [],
    size_chart: [],
    store_type: "sneakers" as const,
    featured: false,
    created_at: new Date().toISOString(),
    rating: 0,
    reviews_count: 0,
    is_corner_product: false,
    active: false,
    new: false,
  }));
};

export async function getFeaturedProducts(
  page: number = 1,
): Promise<PaginatedResponse<Product>> {
  const cacheKey = `featured-products-${page}`;

  try {
    return await fetchWithCache(cacheKey, async () => {
      console.log(
        "Fetching featured products from:",
        `${API_URL}/products?featured=true&page=${page}&limit=${ITEMS_PER_PAGE}`,
      );

      const response = await fetch(
        `${API_URL}/products?featured=true&page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Adaptation de la structure de la réponse
      const products = responseData.data || [];
      const pagination = responseData.pagination || {
        currentPage: page,
        pageSize: ITEMS_PER_PAGE,
        totalItems: products.length,
        totalPages: Math.ceil(products.length / ITEMS_PER_PAGE),
      };

      // Validation et transformation des données
      const validProducts = products.filter(
        (product: any) => product?.id && product?.name && product?.price,
      ) as Product[];

      return {
        items: validProducts,
        total: pagination.totalItems,
        page: pagination.currentPage,
        totalPages: pagination.totalPages,
        hasMore: pagination.currentPage < pagination.totalPages,
      };
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits en vedette:",
      error,
    );

    // Fallback avec pagination
    const fallbackProducts = createFallbackProducts(ITEMS_PER_PAGE);
    return {
      items: fallbackProducts,
      total: fallbackProducts.length,
      page: 1,
      totalPages: 1,
      hasMore: false,
    };
  }
}

export async function getAllProducts(
  page: number = 1,
  filters: {
    category?: string;
    brand?: string;
    priceRange?: [number, number];
  } = {},
): Promise<PaginatedResponse<Product>> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: ITEMS_PER_PAGE.toString(),
    ...(filters.category && { category: filters.category }),
    ...(filters.brand && { brand: filters.brand }),
    ...(filters.priceRange && {
      minPrice: filters.priceRange[0].toString(),
      maxPrice: filters.priceRange[1].toString(),
    }),
  });

  const cacheKey = `all-products-${queryParams.toString()}`;

  try {
    return await fetchWithCache(cacheKey, async () => {
      const response = await fetch(
        `${API_URL}/products?${queryParams.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          next: { revalidate: 3600 },
        },
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const validProducts = (data.products || []).filter(
        (product: any) =>
          product?.id && product?.name && product?.price && product?.image_url,
      );

      return {
        items: validProducts,
        total: data.total || validProducts.length,
        page,
        totalPages: Math.ceil(
          (data.total || validProducts.length) / ITEMS_PER_PAGE,
        ),
        hasMore: validProducts.length === ITEMS_PER_PAGE,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);

    // Fallback avec pagination
    const fallbackProducts = createFallbackProducts(ITEMS_PER_PAGE);
    return {
      items: fallbackProducts,
      total: fallbackProducts.length,
      page: 1,
      totalPages: 1,
      hasMore: false,
    };
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const cacheKey = `product-${id}`;

  try {
    return await fetchWithCache(cacheKey, async () => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.product;
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du produit ${id}:`, error);
    return null;
  }
}
