import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://reboul-store-api-production.up.railway.app/api";

// Fonction pour créer des produits de fallback
const createFallbackProducts = (count: number = 8) => {
  const categories = ["Sneakers", "Streetwear", "Accessoires"];
  const brands = ["Nike", "Adidas", "New Balance", "Converse"];

  return Array.from({ length: count }, (_, i) => ({
    id: `fallback-${i}`,
    name: `${brands[i % brands.length]} Collection Premium`,
    description: "Produit en vedette de notre collection.",
    price: 129.99 + i * 10,
    category: categories[i % categories.length],
    brand: brands[i % brands.length],
    image_url: `https://picsum.photos/800/1000?random=${i}`,
    image: `https://picsum.photos/800/1000?random=${i}`,
    images: [`https://picsum.photos/800/1000?random=${i}`],
    featured: true,
    active: true,
    new: i < 3,
  }));
};

export async function GET(request: NextRequest) {
  try {
    // Utiliser searchParams directement de la requête
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured") === "true";

    // Construire l'URL de l'API
    const apiUrl = `${API_URL}/products?${searchParams.toString()}`;
    console.log("Fetching products from:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Products received:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products from API:", error);

    // Générer des produits de fallback
    const fallbackProducts = createFallbackProducts(12);

    return NextResponse.json({
      products: fallbackProducts,
      total: fallbackProducts.length,
      page: 1,
      totalPages: 1,
      hasMore: false,
    });
  }
}
