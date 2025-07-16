import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "@/components/ui/use-toast";
import { convertToCloudinaryUrl } from "./utils";
import { Product } from "./types/product";
import { UserUpdateData } from "./types/user";
import { type User } from "next-auth";

const API_URL = "https://reboul-store-api-production.up.railway.app/api";

// Types
export type { Product, UserUpdateData };

export interface Address {
  id: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  full_name?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  variant_info?: {
    size?: string;
    color?: string;
  };
}

export interface Order {
  id: number;
  user_id: number;
  user?: UserInfo;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  shipping_address?: Address;
  order_number: string;
  shipping_cost?: number;
  tracking_number?: string;
  carrier?: string;
  payment_data?: {
    payment_method_types?: string[];
    payment_status?: string;
    stripe_session_id?: string;
    created?: number;
    customer?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    payment_intent_id?: string;
  };
  stripe_session_id?: string;
  shipping_info?: {
    city?: string;
    email?: string;
    phone?: string;
    address?: string;
    country?: string;
    isValid?: boolean;
    lastName?: string;
    firstName?: string;
    last_name?: string;
    first_name?: string;
    hasAddress?: boolean;
    addressType?: string;
    postal_code?: string;
    postalCode?: string;
    deliveryType?: string;
  };
  customer_info?: any;
  metadata?: any; // Ajout du champ metadata qui manquait
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
}

export interface WeeklySales {
  date: string;
  total: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  parent_id?: number;
  image_url?: string;
  count?: number;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  image_url?: string;
  logo_light?: string;
  logo_dark?: string;
  description?: string;
}

export interface ReturnRequest {
  orderId: string;
  reason: string;
}

export interface Variant {
  color: string;
  size: string;
  stock: number;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UserReview {
  id: string;
  productId: string;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  marketing: boolean;
  security: boolean;
}

export interface MonthlyStats {
  month: string;
  order_count: number;
  revenue: number;
  unique_customers: number;
}

export interface TopProductByCategory {
  category_name: string;
  product_name: string;
  total_sold: number;
  revenue: number;
}

export interface CustomerStats {
  month: string;
  new_users: number;
  active_users: number;
}

export interface SalesStats {
  date: string;
  amount: number;
  orders: number;
}

export interface CategoryStats {
  name: string;
  value: number;
}

export interface BrandStats {
  name: string;
  value: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  enableRegistration: boolean;
  enableCheckout: boolean;
  maintenanceMode: boolean;
  currency: string;
  taxRate: number;
}

export interface CollectionStats {
  [storeType: string]: {
    total: number;
    new: number;
  };
}

export const clearAuth = (): void => {
  if (typeof window !== "undefined") {
    console.log("🧹 Clearing all authentication data...");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("reboul_auth_token");
    sessionStorage.clear();
  }
};

export const debugAuth = (): void => {
  if (typeof window !== "undefined") {
    console.log("🔍 Auth Debug Info:");
    console.log("- localStorage token:", localStorage.getItem("token"));
    console.log("- localStorage authToken:", localStorage.getItem("authToken"));
    console.log("- localStorage reboul_auth_token:", localStorage.getItem("reboul_auth_token"));
    console.log("- sessionStorage length:", sessionStorage.length);
    console.log("- Current URL:", window.location.href);
  }
};

export const getToken = (): string | null => {
  try {
    // Vérifier si nous sommes côté client
    if (typeof window === "undefined") {
      return null;
    }

    let token = localStorage.getItem("token");
    
    // Gérer les cas où le token est une chaîne "null", "undefined", vide ou invalide
    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
      console.log("No valid token found in localStorage, clearing...");
      localStorage.removeItem("token");
      return null;
    }

    // Vérifier si le token est au format JWT (xxx.yyy.zzz)
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Token is not in JWT format, clearing...");
      localStorage.removeItem("token");
      return null;
    }

    // Essayer de décoder le payload pour vérifier la validité
    try {
      const payload = JSON.parse(atob(parts[1]));
      console.log("Token payload structure:", Object.keys(payload));

      // Vérifier l'expiration si présente
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          console.log("Token has expired, clearing...");
          localStorage.removeItem("token");
          return null;
        }
      }

      return token;
    } catch (e) {
      console.error("Error decoding token payload, clearing...", e);
      localStorage.removeItem("token");
      return null;
    }
  } catch (error) {
    console.error("Error in getToken, clearing...", error);
    localStorage.removeItem("token");
    return null;
  }
};

export const getImagePath = (path: string): string => {
  if (!path) return "/placeholder.png";

  // Si l'URL contient localhost, la convertir en URL Railway
      if (path.includes("localhost:5001")) {
      const cleanPath = path.split("localhost:5001")[1];
      return `https://reboul-store-api-production.up.railway.app${cleanPath}`;
    }

  // Si c'est déjà une URL complète (non-localhost)
  if (path.startsWith("http") && !path.includes("localhost")) {
    return path;
  }

  // Pour les chemins relatifs
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `https://reboul-store-api-production.up.railway.app${cleanPath}`;
};

// Ajouter cette interface après les autres interfaces, avant la classe Api
export interface ProductWithFiles extends Partial<Product> {
  files?: File[];
}

export class Api {
  private readonly client: AxiosInstance;
  private readonly RAILWAY_BASE_URL =
    "https://reboul-store-api-production.up.railway.app";
  private readonly CLOUDINARY_CLOUD_NAME = "dxen69pdo";
  private readonly CLOUDINARY_API_KEY = "699182784731453";
  private readonly CLOUDINARY_API_SECRET = "xaIN--yBARtEJKm410UT5ICpraw";
  private readonly CLOUDINARY_UPLOAD_PRESET = "ml_default";

  private readonly isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  private transformImageUrl(url: string): string {
    // Si l'URL contient localhost, la convertir en URL Railway
    if (url.includes("localhost:5001")) {
      const path = url.split("localhost:5001")[1];
      return `${this.RAILWAY_BASE_URL}${path}`;
    }
    return url;
  }

  private formatImageUrl(url: string | undefined): string {
    // Vérifier si l'URL est définie et non vide après suppression des espaces
    if (!url || !url.trim()) return "";

    // Utiliser la fonction convertToCloudinaryUrl
    return convertToCloudinaryUrl(url);
  }

  // Nouvelle fonction pour convertir les anciennes URLs en URLs Cloudinary
  private migrateToCloudinary(url: string | undefined): string {
    if (!url) return "";

    // Si c'est déjà une URL Cloudinary, la retourner directement
    if (url.includes("cloudinary.com")) {
      return url;
    }

    // Si c'est une URL de l'API Railway, essayer de trouver une image Cloudinary correspondante
    // Cette fonction est un placeholder - vous devrez implémenter la logique de migration réelle

    // Pour l'instant, retourner l'URL d'origine
    return this.formatImageUrl(url);
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        
        // Logs de débogage pour l'authentification
        console.log("🔐 Auth Debug:", {
          url: config.url,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
        });

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn("⚠️ No valid token available for request to:", config.url);
          // Supprimer tout header Authorization existant
          if (config.headers) {
            delete config.headers.Authorization;
          }
        }
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        console.error("🚨 Response error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });

        if (error.response?.status === 401) {
          console.log("🔒 Unauthorized - clearing token and redirecting...");
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            // Pour l'admin, rediriger vers admin/login
            if (window.location.pathname.includes('/admin')) {
              window.location.href = "/admin/login";
            } else {
              window.location.href = "/connexion";
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private handleError(error: unknown, message: string): void {
    console.error(message, error);
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.error || error.message;
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    }
  }

  async fetchProducts(params: Record<string, string | number> = {}): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Supprimer les paramètres vides, null, undefined ou chaînes vides
      const cleanParams: Record<string, string | number> = {};

      for (const [key, value] of Object.entries(params)) {
        // Ne pas inclure les paramètres vides ou undefined
        if (value !== undefined && value !== null && value !== "") {
          cleanParams[key] = value;
        }
      }

      // Ajouter un timeout plus long pour l'API
      const response = await this.client.get("/products", {
        params: cleanParams,
        timeout: 10000, // 10 secondes de timeout
      });

      if (!response.data) {
        console.warn("Réponse API sans données");
        return { products: [], total: 0, totalPages: 0, currentPage: 1 };
      }

      if (!Array.isArray(response.data.data)) {
        console.warn(
          "Format de réponse API inattendu: data n'est pas un tableau",
        );
        return { products: [], total: 0, totalPages: 0, currentPage: 1 };
      }

      // Filtrer les produits supprimés (ceux avec _actiontype === "hardDelete" ou "delete")
      const filteredData = response.data.data.filter(
        (product: Product) =>
          product._actiontype !== "hardDelete" &&
          product._actiontype !== "delete" &&
          product._actiontype !== "permDelete" &&
          product.deleted !== true &&
          product.store_type !== "deleted" &&
          (typeof product.name !== "string" ||
            !product.name.startsWith("[SUPPRIMÉ]")),
      );

      const products = filteredData.map((product: Product) => {
        // Normalisation des données
        const normalizedProduct = {
          ...product,
          price: this.normalizePrice(product.price),
          category: product.category_id,
          image_url: this.formatImageUrl(product.image_url),
          image: this.formatImageUrl(product.image),
          images: Array.isArray(product.images)
            ? product.images.map((img) =>
                typeof img === "string" ? this.formatImageUrl(img) : img,
              )
            : [],
          variants: Array.isArray(product.variants) ? product.variants : [],
          reviews: Array.isArray(product.reviews) ? product.reviews : [],
          tags: Array.isArray(product.tags) ? product.tags : [],
        };
        return normalizedProduct;
      });

      // Récupérer les informations de pagination depuis la réponse du backend
      const pagination = response.data.pagination || {};
      const totalItems = pagination.totalItems || filteredData.length;
      const page = parseInt(params.page as string) || 1;
      const limit = parseInt(params.limit as string) || 10;
      const totalPages = pagination.totalPages || Math.ceil(totalItems / limit);

      return {
        products,
        total: totalItems,
        totalPages: totalPages,
        currentPage: pagination.currentPage || page,
      };
    } catch (error) {
      console.error("Erreur dans fetchProducts");

      // Vérifier si c'est une erreur de timeout
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "ECONNABORTED") {
          console.error("Timeout de la requête API");
          this.handleError(
            error,
            "Le serveur met trop de temps à répondre. Veuillez réessayer.",
          );
        }
      }

      // Vérifier si c'est une erreur de réseau
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes("Network Error")
      ) {
        console.error("Erreur réseau détectée");
        this.handleError(
          error,
          "Problème de connexion au serveur. Vérifiez votre connexion internet.",
        );
      }

      // Informer de l'erreur et retourner un résultat par défaut
      this.handleError(error, "Erreur lors de la récupération des produits");

      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  }

  private normalizePrice(price: any): number {
    if (typeof price === "number") {
      return price;
    }
    if (typeof price === "string") {
      const normalized = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      return isNaN(normalized) ? 0 : normalized;
    }
    return 0;
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      console.log("Appel API getProductById:", id);

      // Vérifier si le produit est dans la cache locale (pour éviter des requêtes répétées en cas d'erreur 500)
      const cacheKey = `product_${id}`;

      if (typeof window !== "undefined") {
        const cachedProduct = localStorage.getItem(cacheKey);

        if (cachedProduct) {
          try {
            const parsedProduct = JSON.parse(cachedProduct);
            const cacheTimestamp = parsedProduct._cacheTimestamp || 0;

            // Utiliser la cache si elle date de moins de 2 minutes (augmenté de 30s à 120s)
            if (Date.now() - cacheTimestamp < 120000) {
              console.log("Utilisation du produit en cache pour:", id);
              delete parsedProduct._cacheTimestamp;
              return parsedProduct;
            }
          } catch (cacheError) {
            console.warn("Erreur lors de la lecture du cache:", cacheError);
            localStorage.removeItem(cacheKey);
          }
        }
      }

      // Ajout d'un timeout pour éviter les blocages
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 8000); // 8 secondes de timeout maximum (réduit de 10s à 8s)

      const response = await this.client
        .get(`/products/${id}`, {
          signal: controller.signal,
        })
        .finally(() => {
          clearTimeout(timeout);
        });

      console.log("Réponse API brute:", response.data);

      if (!response.data) {
        console.log("Pas de données dans la réponse");
        return null;
      }

      // Vérifier et nettoyer les données du produit
      const cleanProduct = {
        ...response.data,
        // S'assurer que l'ID est une chaîne
        id: String(response.data.id),
        // Nettoyer le nom et la description
        name: response.data.name?.trim() || "",
        description: response.data.description?.trim() || "",
        // Convertir le prix en nombre
        price:
          typeof response.data.price === "string"
            ? parseFloat(response.data.price)
            : Number(response.data.price) || 0,
        // Nettoyer la marque
        brand: response.data.brand?.trim() || "",
        // Nettoyer et filtrer les images
        image_url: this.formatImageUrl(response.data.image_url || ""),
        image: this.formatImageUrl(response.data.image || ""),
        images: Array.isArray(response.data.images)
          ? response.data.images
              .filter((img: any) => {
                // Vérification plus stricte pour éliminer les images problématiques
                if (!img) return false;
                if (typeof img === "string") {
                  return img.trim() !== "" && img.trim() !== "undefined";
                }
                if (typeof img === "object" && img !== null && "url" in img) {
                  return (
                    img.url &&
                    typeof img.url === "string" &&
                    img.url.trim() !== "" &&
                    img.url.trim() !== "undefined"
                  );
                }
                return false;
              })
              .map((img: any) => {
                if (typeof img === "string") {
                  return this.formatImageUrl(img);
                }
                if (typeof img === "object" && img !== null && "url" in img) {
                  return {
                    ...img,
                    url: this.formatImageUrl(img.url),
                  };
                }
                return null;
              })
              .filter(Boolean) // Éliminer les null potentiels
          : [],
        // S'assurer que variants est un tableau
        variants: Array.isArray(response.data.variants)
          ? response.data.variants
          : [],
        // Convertir les booléens
        featured: Boolean(response.data.featured),
        active: Boolean(response.data.active),
        new: Boolean(response.data.new),
      };

      console.log("Produit nettoyé:", cleanProduct);

      // Mettre en cache le produit pour les futures requêtes
      try {
        if (typeof window !== "undefined") {
          const productToCache = {
            ...cleanProduct,
            _cacheTimestamp: Date.now(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(productToCache));
        }
      } catch (cacheError) {
        console.warn("Erreur lors de la mise en cache du produit:", cacheError);
      }

      return cleanProduct;
    } catch (error) {
      console.error("Erreur détaillée dans getProductById:", error);

      // Gestion spécifique des erreurs de timeout
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Timeout lors de la récupération du produit");
        this.handleError(
          error,
          `Timeout lors de la récupération du produit avec ID ${id}`,
        );
      } else if (
        error instanceof AxiosError &&
        error.response?.status === 500
      ) {
        console.error(`Erreur serveur 500 pour le produit ${id}`);
        this.handleError(
          error,
          `Le serveur a rencontré une erreur interne (500) pour le produit ${id}`,
        );

        // Tenter d'utiliser un produit en cache même s'il est périmé
        if (typeof window !== "undefined") {
          try {
            const cacheKey = `product_${id}`;
            const cachedProduct = localStorage.getItem(cacheKey);
            if (cachedProduct) {
              console.log(
                "Utilisation du produit en cache (périmé) suite à une erreur 500",
              );
              const parsedProduct = JSON.parse(cachedProduct);
              delete parsedProduct._cacheTimestamp;
              return parsedProduct;
            }

            // Si pas de cache disponible, essayer de récupérer un produit similaire comme fallback
            const allCacheKeys = Object.keys(localStorage).filter((key) =>
              key.startsWith("product_"),
            );
            if (allCacheKeys.length > 0) {
              // Prendre le premier produit en cache comme fallback
              const fallbackCacheKey = allCacheKeys[0];
              const fallbackProduct = localStorage.getItem(fallbackCacheKey);
              if (fallbackProduct) {
                console.log(
                  "Utilisation d'un produit alternatif comme fallback suite à une erreur 500",
                );
                try {
                  const parsedFallback = JSON.parse(fallbackProduct);
                  delete parsedFallback._cacheTimestamp;
                  // Indiquer qu'il s'agit d'un fallback
                  parsedFallback.isFallback = true;
                  parsedFallback.originalId = id;
                  return parsedFallback;
                } catch (e) {
                  console.warn("Erreur lors du parsing du fallback:", e);
                }
              }
            }
          } catch (cacheError) {
            console.warn(
              "Erreur lors de la lecture du cache de secours:",
              cacheError,
            );
          }
        }
      } else {
        this.handleError(error, `Error fetching product with ID ${id}`);
      }

      return null;
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      console.log(
        "createProduct called with data:",
        JSON.stringify(productData, null, 2),
      );

      // Nettoyage des données avant l'envoi
      const cleanedProductData = {
        name: productData.name || "",
        description: productData.description || "",
        price: Number(productData.price) || 0,
        category_id: Number(productData.category_id) || 0,
        brand_id: Number(productData.brand_id) || 0,
        store_type: productData.store_type || "adult",
        featured: Boolean(productData.featured),
        active: Boolean(productData.active),
        new: Boolean(productData.new),
      };

      // Ajouter les champs optionnels
      if (productData.variants && Array.isArray(productData.variants)) {
        console.log(
          "Variants reçus avant nettoyage:",
          JSON.stringify(productData.variants, null, 2),
        );

        const cleanedVariants = productData.variants
          .filter(
            (v) =>
              v &&
              typeof v === "object" &&
              v.size &&
              typeof v.size === "string" &&
              v.size.trim() !== "" &&
              v.color &&
              typeof v.color === "string" &&
              v.color.trim() !== "" &&
              typeof v.stock === "number" &&
              v.stock >= 0,
          )
          .map((v) => ({
            size: String(v.size).trim(),
            color: String(v.color).trim(),
            stock: Number(v.stock) || 0,
          }));

        console.log(
          "Variants après nettoyage:",
          JSON.stringify(cleanedVariants, null, 2),
        );

        if (cleanedVariants.length > 0) {
          (cleanedProductData as any).variants = cleanedVariants;
        }
      }

      if (productData.tags && Array.isArray(productData.tags)) {
        (cleanedProductData as any).tags = productData.tags;
      }

      if (productData.details && Array.isArray(productData.details)) {
        (cleanedProductData as any).details = productData.details;
      }

      if (productData.sku) {
        (cleanedProductData as any).sku = productData.sku;
      }

      if (productData.store_reference) {
        (cleanedProductData as any).store_reference =
          productData.store_reference;
      }

      if (productData.images && Array.isArray(productData.images)) {
        (cleanedProductData as any).images = productData.images;
      }

      console.log(
        "Données simplifiées pour création de produit:",
        JSON.stringify(cleanedProductData, null, 2),
      );

      // Vérifier l'authentification
      const token = getToken();
      if (!token) {
        console.error("Pas de token d'authentification");
        throw new Error("Vous devez être connecté pour créer un produit");
      }

      console.log("Token d'authentification présent:", !!token);

      // Envoyer directement au serveur
      const response = await fetch(`${this.RAILWAY_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedProductData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("Création réussie, réponse du serveur:", result);
      return result;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      // Log des données reçues
      console.log(
        "Données reçues dans updateProduct:",
        JSON.stringify(data, null, 2),
      );

      // Créer un objet avec les données minimales nécessaires
      const validatedData: Record<string, any> = {
        name: String(data.name || "").trim(),
        description: String(data.description || "").trim(),
        price: Number(data.price) || 0,
        category_id: Number(data.category_id) || 1, // Valeur par défaut à 1 au lieu de 0
        brand_id: Number(data.brand_id) || 1, // Valeur par défaut à 1 au lieu de 0
        store_type: data.store_type?.trim() || "adult", // Valeur par défaut à "adult"
        active: true,
      };

      // Ajouter les champs optionnels seulement s'ils ont des valeurs valides
      if (data.variants && Array.isArray(data.variants)) {
        console.log(
          "Variants reçus avant nettoyage:",
          JSON.stringify(data.variants, null, 2),
        );

        const cleanedVariants = data.variants
          .filter(
            (v) =>
              v &&
              typeof v === "object" &&
              v.size &&
              typeof v.size === "string" &&
              v.size.trim() !== "" &&
              v.color &&
              typeof v.color === "string" &&
              v.color.trim() !== "" &&
              typeof v.stock === "number" &&
              v.stock >= 0,
          )
          .map((v) => ({
            size: String(v.size).trim(),
            color: String(v.color).trim(),
            stock: Number(v.stock) || 0,
          }));

        console.log(
          "Variants après nettoyage:",
          JSON.stringify(cleanedVariants, null, 2),
        );

        if (cleanedVariants.length > 0) {
          validatedData.variants = cleanedVariants;
        }
      }

      if (Array.isArray(data.tags) && data.tags.length > 0) {
        validatedData.tags = data.tags;
      }

      if (Array.isArray(data.details) && data.details.length > 0) {
        validatedData.details = data.details;
      }

      if (data.featured !== undefined) {
        validatedData.featured = Boolean(data.featured);
      }

      if (data.new !== undefined) {
        validatedData.new = Boolean(data.new);
      }

      if (data.sku) {
        validatedData.sku = String(data.sku).trim();
      }

      // Ajout de la prise en charge du champ store_reference
      if (data.store_reference) {
        validatedData.store_reference = String(data.store_reference).trim();
      }

      // Ajouter les images si elles existent
      if (data.images && Array.isArray(data.images)) {
        validatedData.images = data.images
          .map((img) => {
            if (typeof img === "string") {
              return img;
            }
            if (typeof img === "object" && img !== null && "url" in img) {
              return img.url;
            }
            return null;
          })
          .filter(
            (url): url is string =>
              url !== null && typeof url === "string" && url.trim() !== "",
          );
      }

      // S'assurer que les images sont envoyées comme un tableau de chaînes
      if (validatedData.images) {
        validatedData.images = validatedData.images.map(
          (img: { url: string } | string) => {
            if (typeof img === "object" && img !== null && "url" in img) {
              return img.url;
            }
            return String(img);
          },
        );
      }

      console.log(
        "URL de la requête:",
        `${this.RAILWAY_BASE_URL}/api/products/${id}`,
      );
      console.log(
        "Données finales avant envoi:",
        JSON.stringify(validatedData, null, 2),
      );

      // Utiliser fetch directement au lieu de axios
      const token = getToken();
      const response = await fetch(
        `${this.RAILWAY_BASE_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(validatedData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log(
        `Tentative de suppression du produit avec l'ID: ${id} (type: ${typeof id})`,
      );

      // S'assurer que l'ID est bien une chaîne
      const productId = String(id).trim();
      console.log(`ID formaté pour la requête: '${productId}'`);

      try {
        // Utiliser la méthode PUT avec marquage spécial pour désigner un produit supprimé
        console.log("Marquage du produit comme supprimé");

        // Obtenir d'abord les informations du produit pour pouvoir modifier ses champs
        const productResponse = await this.client.get(`/products/${productId}`);
        const productData = productResponse.data;

        if (!productData) {
          throw new Error("Produit non trouvé");
        }

        // Créer un objet avec les données minimales requises pour la mise à jour
        const updateData = {
          name: `[SUPPRIMÉ] ${productData.name}`,
          description: productData.description || "Description",
          price: productData.price || 0,
          stock: 0,
          category_id: productData.category_id || 1,
          brand_id: productData.brand_id || 1,
          active: false,
          deleted: true,
          hidden: true,
          store_type: "deleted",
          sku: `DELETED-${productId}`,
          _actionType: "permDelete",
        };

        // Mettre à jour le produit
        const response = await this.client.put(
          `/products/${productId}`,
          updateData,
        );

        console.log(`Réponse de suppression:`, {
          status: response.status,
          statusText: response.statusText,
        });

        if (response.status === 200 || response.status === 204) {
          toast({
            title: "Succès",
            description: `Le produit avec l'ID ${id} a été supprimé et placé dans la corbeille.`,
          });
          return true;
        }
      } catch (error) {
        console.log(
          "Échec de la suppression complète, tentative alternative...",
          error,
        );
      }

      // Méthode alternative simplifiée
      console.log("Tentative avec PUT et active=false");
      try {
        const response = await this.client.put(`/products/${productId}`, {
          active: false,
          _actionType: "delete",
        });

        console.log(`Réponse suppression alternative:`, {
          status: response.status,
        });

        if (response.status === 200 || response.status === 204) {
          toast({
            title: "Succès",
            description: `Le produit avec l'ID ${id} a été désactivé. Utilisez "Vider la corbeille" pour le supprimer définitivement.`,
          });
          return true;
        }
      } catch (error) {
        console.error("Erreur avec la méthode alternative:", error);
      }

      // Si toutes les tentatives échouent
      console.warn(`Toutes les tentatives de suppression ont échoué.`);
      throw new Error(
        "Échec de toutes les tentatives de suppression du produit",
      );
    } catch (error) {
      console.error(
        `Erreur détaillée lors de la suppression du produit avec l'ID ${id}:`,
        error,
      );

      if (error instanceof AxiosError) {
        console.error(`Statut HTTP: ${error.response?.status}`);
        console.error(`URL ayant échoué: ${error.config?.url}`);
        console.error(`Données de réponse:`, error.response?.data);

        // Analyser le message d'erreur
        const errorMessage = error.response?.data?.message || error.message;
        toast({
          title: "Erreur de suppression",
          description: errorMessage,
          variant: "destructive",
        });

        // Tenter d'extraire plus d'informations si possible
        if (typeof error.response?.data === "string") {
          try {
            const htmlMatch = error.response.data.match(/<pre>(.*?)<\/pre>/);
            if (htmlMatch && htmlMatch[1]) {
              console.error(`Message d'erreur HTML trouvé: ${htmlMatch[1]}`);
            }
          } catch (parseError) {
            console.error("Impossible d'analyser la réponse HTML", parseError);
          }
        }
      } else {
        this.handleError(
          error,
          `Erreur lors de la suppression du produit avec l'ID ${id}`,
        );
      }

      return false;
    }
  }

  async fetchOrders(): Promise<{
    data: Order[];
    pagination: { totalItems: number; totalPages: number; currentPage: number };
  }> {
    try {
      const response = await this.client.get("/orders");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching orders");
      return {
        data: [],
        pagination: { totalItems: 0, totalPages: 0, currentPage: 0 },
      };
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await this.client.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Error fetching order with ID ${id}`);
      return null;
    }
  }

  async updateOrderStatus(
  orderId: number,
  statusData: string | { status: string; tracking_number?: string; carrier?: string },
): Promise<Order | null> {
  try {
    // Support des deux formats : string ou objet
    const requestData = typeof statusData === 'string' 
      ? { status: statusData }
      : statusData;

    const response = await this.client.put(`/orders/${orderId}/status`, requestData);
    return response.data;
  } catch (error) {
    this.handleError(error, `Error updating status for order ${orderId}`);
    return null;
  }
}

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      console.log("Fetching dashboard stats...");
      const token = getToken();
      console.log("Auth token:", token ? "Present" : "Missing");

      const response = await this.client.get("/admin/dashboard/stats");
      console.log("Dashboard stats response:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques du tableau de bord",
      );
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
      };
    }
  }

  async fetchRecentOrders(): Promise<Order[]> {
    try {
      const response = await this.client.get("/admin/dashboard/recent-orders");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching recent orders");
      return [];
    }
  }

  async fetchTopProducts(): Promise<TopProduct[]> {
    try {
      const response = await this.client.get("/admin/dashboard/top-products");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching top products");
      return [];
    }
  }

  async fetchWeeklySales(): Promise<WeeklySales[]> {
    try {
      const response = await this.client.get("/admin/dashboard/weekly-sales");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching weekly sales");
      return [];
    }
  }

  async updateProductStock(
    productId: string,
    quantity: number,
    variant: { size: string; color: string },
  ): Promise<boolean> {
    try {
      await this.client.put(`/products/${productId}/stock`, {
        quantity,
        variant,
      });
      return true;
    } catch (error) {
      this.handleError(error, "Error updating product stock");
      return false;
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await this.client.put("/users/password", {
        currentPassword,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message || "Mot de passe changé avec succès",
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            "Erreur lors du changement de mot de passe",
        };
      }
      return {
        success: false,
        message: "Une erreur inattendue est survenue",
      };
    }
  }

  async fetchAddresses(): Promise<Address[]> {
    try {
      console.log("Fetching addresses...");
      const token = getToken();
      console.log("Auth token:", token ? "Present" : "Missing");

      const response = await this.client.get("/addresses");
      console.log("Response:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      this.handleError(error, "Erreur lors de la récupération des adresses");
      return [];
    }
  }

  async updateUserInfo(userInfo: UserUpdateData): Promise<User | null> {
    try {
      const { username, email, avatar_url } = userInfo;
      if (!username) {
        throw new Error("Le nom d'utilisateur est requis");
      }

      // Validation de l'email
      if (email && !this.isValidEmail(email)) {
        throw new Error("Format d'email invalide");
      }

      // Construction des données à envoyer
      const userData = {
        username,
        email,
        avatar_url,
      };

      const response = await this.client.put(`/users/me`, userData);

      return {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        created_at: response.data.created_at,
        is_admin: response.data.is_admin || false,
        status: response.data.status,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        this.handleError(error, `Erreur: ${errorMessage}`);
      } else if (error instanceof Error) {
        this.handleError(error, error.message);
      } else {
        this.handleError(
          error,
          "Erreur lors de la mise à jour des informations utilisateur",
        );
      }
      return null;
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string } | null> {
    try {
      console.log(`Attempting login for user: ${email}`);
      const response = await this.client.post("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);

      const { user, token } = response.data;
      if (!token) {
        console.error("No token received in login response");
        throw new Error("No authentication token received");
      }

      console.log("Login successful, storing token");
      if (typeof window !== "undefined") {
        // Store in localStorage for persistent sessions
        localStorage.setItem("token", token);

        // Also store in sessionStorage as a backup
        try {
          sessionStorage.setItem("token_backup", token);
        } catch (storageError) {
          console.warn(
            "Could not store token in sessionStorage:",
            storageError,
          );
        }

        console.log("Token stored successfully");
      }

      return { user, token };
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof AxiosError) {
        console.error("API response:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      this.handleError(error, "Error during login");
      return null;
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User | null> {
    try {
      const response = await this.client.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      this.handleError(error, "Error during registration");
      return null;
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }

  async fetchUserProfile(): Promise<User | null> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      const { userId } = JSON.parse(jsonPayload);

      const response = await this.client.get(`/users/${userId}`);

      return {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        created_at: response.data.created_at,
        is_admin: response.data.is_admin || false,
        status: response.data.status,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      this.handleError(
        error,
        "Erreur lors de la récupération du profil utilisateur",
      );
      return null;
    }
  }

  async addToCart(productId: string, quantity: number): Promise<boolean> {
    try {
      await this.client.post("/cart/add", { productId, quantity });
      return true;
    } catch (error) {
      this.handleError(error, "Error adding product to cart");
      return false;
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    try {
      await this.client.delete(`/cart/remove/${productId}`);
      return true;
    } catch (error) {
      this.handleError(error, "Error removing product from cart");
      return false;
    }
  }

  async fetchCart(): Promise<{
    items: Array<{ product: Product; quantity: number }>;
    total: number;
  } | null> {
    try {
      const response = await this.client.get("/cart");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching cart");
      return null;
    }
  }

  async createOrder(orderData: {
    addressId: string;
    paymentMethod: string;
  }): Promise<Order | null> {
    try {
      const response = await this.client.post("/orders", orderData);
      return response.data;
    } catch (error) {
      this.handleError(error, "Error creating order");
      return null;
    }
  }

  async addAddress(addressData: Omit<Address, "id">): Promise<Address | null> {
    try {
      const response = await this.client.post("/addresses", addressData);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erreur lors de l'ajout de l'adresse");
      return null;
    }
  }

  async updateAddress(
    id: string,
    addressData: Partial<Address>,
  ): Promise<Address | null> {
    try {
      const response = await this.client.put(`/addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erreur lors de la mise à jour de l'adresse");
      return null;
    }
  }

  async deleteAddress(id: string): Promise<boolean> {
    try {
      await this.client.delete(`/addresses/${id}`);
      return true;
    } catch (error) {
      this.handleError(error, "Erreur lors de la suppression de l'adresse");
      return false;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log("searchProducts - Début de la recherche pour:", query);

      // Solution simplifiée: utiliser l'endpoint standard des produits avec le paramètre de recherche
      const response = await this.client.get("/products", {
        params: {
          search: query,
          limit: 20, // Récupérer plus de résultats pour le filtrage client
        },
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        console.warn(
          "searchProducts - Format de réponse inattendu:",
          response.data,
        );
        return [];
      }

      // Filtrer côté client pour des résultats plus pertinents
      const products = response.data.data;
      const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

      const filteredProducts = products
        .filter((product: Product) => {
          // Ne pas inclure les produits supprimés ou inactifs
          if (
            product._actiontype === "hardDelete" ||
            product._actiontype === "delete" ||
            product.deleted === true ||
            product.active === false
          ) {
            return false;
          }

          // Créer un texte de recherche combiné
          const searchableText = [
            product.name,
            product.description,
            product.sku,
            ...(Array.isArray(product.tags) ? product.tags : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          // Le produit doit contenir tous les termes de recherche
          return searchTerms.every((term) => searchableText.includes(term));
        })
        // Trier par pertinence (nombre de correspondances dans le nom)
        .sort((a: Product, b: Product) => {
          const aMatches = searchTerms.filter((term) =>
            a.name?.toLowerCase().includes(term),
          ).length;
          const bMatches = searchTerms.filter((term) =>
            b.name?.toLowerCase().includes(term),
          ).length;
          return bMatches - aMatches;
        })
        // Limiter à 10 résultats
        .slice(0, 10)
        // Normaliser les prix et autres champs
        .map((product: Product) => ({
          ...product,
          price: this.normalizePrice(product.price),
          image_url: this.formatImageUrl(product.image_url),
          image: this.formatImageUrl(product.image),
          images: Array.isArray(product.images)
            ? product.images.map((img) =>
                typeof img === "string" ? this.formatImageUrl(img) : img,
              )
            : [],
        }));

      console.log(
        "searchProducts - Résultats trouvés:",
        filteredProducts.length,
      );
      return filteredProducts;
    } catch (error) {
      console.error("searchProducts - Erreur complète:", error);
      this.handleError(error, "Error searching products");
      return [];
    }
  }

  async addReview(
    productId: string,
    reviewData: { rating: number; comment: string },
  ): Promise<boolean> {
    try {
      console.log("Adding review for product:", productId, reviewData);
      const response = await this.client.post("/reviews", {
        product_id: productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      console.log("Review added successfully:", response.data);
      return true;
    } catch (error) {
      console.error("Error adding review:", error);
      if (error instanceof AxiosError) {
        console.error("Server response:", error.response?.data);
      }
      this.handleError(error, "Impossible d'ajouter votre avis");
      return false;
    }
  }

  async fetchProductReviews(productId: string): Promise<
    {
      id: number;
      rating: number;
      comment: string;
      userName: string;
      date: string;
    }[]
  > {
    try {
      const response = await this.client.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching product reviews");
      return [];
    }
  }

  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await this.client.get("/categories");
      // Générer le slug pour chaque catégorie
      return response.data.map((category: any) => ({
        ...category,
        slug: category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    } catch (error) {
      this.handleError(error, "Error fetching categories");
      return [];
    }
  }

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await this.client.post("/categories", { name });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error creating category");
      throw error;
    }
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    try {
      const response = await this.client.put(`/categories/${id}`, { name });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error updating category");
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      this.handleError(error, "Error deleting category");
      return false;
    }
  }

  async fetchBrands(): Promise<Brand[]> {
    try {
      const response = await this.client.get("/brands");
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching brands");
      return [];
    }
  }

  async createBrand(data: {
    name: string;
    logo: File | null;
    description: string;
  }): Promise<Brand> {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (data.logo) {
        formData.append("logo", data.logo);
      }

      const response = await this.client.post("/brands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error creating brand");
      throw error;
    }
  }

  async updateBrand(
    id: number,
    data: { name: string; logo: File | null; description: string },
  ): Promise<Brand> {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (data.logo) {
        formData.append("logo", data.logo);
      }

      const response = await this.client.put(`/brands/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error updating brand");
      throw error;
    }
  }

  async deleteBrand(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/brands/${id}`);
      return true;
    } catch (error) {
      this.handleError(error, "Error deleting brand");
      return false;
    }
  }

  async uploadToCloudinary(file: File): Promise<string> {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = "reboul-store"; // Dossier pour organiser les uploads

      // Générer la signature avec les paramètres nécessaires
      const paramsToSign = {
        timestamp: timestamp,
        folder: folder,
      };

      // Créer la chaîne à signer dans l'ordre alphabétique des paramètres
      const stringToSign =
        Object.keys(paramsToSign)
          .sort()
          .map(
            (key) => `${key}=${paramsToSign[key as keyof typeof paramsToSign]}`,
          )
          .join("&") + this.CLOUDINARY_API_SECRET;

      const signature = await this.sha1(stringToSign);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", this.CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      console.log("Uploading to Cloudinary with params:", {
        cloudName: this.CLOUDINARY_CLOUD_NAME,
        timestamp,
        folder,
      });

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/upload`,
        formData,
      );

      console.log("Cloudinary response:", response.data);

      if (response.data && response.data.secure_url) {
        return response.data.secure_url;
      }
      throw new Error("Invalid response from Cloudinary");
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      if (error instanceof AxiosError) {
        console.error("Cloudinary error details:", error.response?.data);
      }
      throw new Error("Upload failed");
    }
  }

  // Fonction utilitaire pour générer le hash SHA1
  private async sha1(str: string): Promise<string> {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async uploadImages(files: (File | Blob)[]): Promise<string[]> {
    try {
      console.log("Starting upload of", files.length, "files");
      const uploadPromises = files.map(async (file) => {
        try {
          const url = await this.uploadToCloudinary(file as File);
          console.log("Successfully uploaded file:", url);
          return url;
        } catch (error) {
          console.error("Error uploading individual file:", error);
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      console.log("All files uploaded successfully:", urls);
      return urls;
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error);
      this.handleError(error, "Erreur lors de l'upload des images");
      throw error;
    }
  }

  async processReturn(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await this.client.post(`/orders/${orderId}/return`, {
        reason,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error processing return");
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/orders/${orderId}`);
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Error deleting order");
      return false;
    }
  }

  async fetchNotificationSettings(): Promise<NotificationSettings> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await this.client.get("/users/notification-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching notification settings");
      return {
        email: false,
        push: false,
        marketing: false,
        security: false,
      };
    }
  }

  async updateNotificationSettings(
    settings: NotificationSettings,
  ): Promise<boolean> {
    try {
      console.log("Updating notification settings:", settings);
      const response = await this.client.put(
        "/users/notification-settings",
        settings,
      );
      console.log("Update response:", response);
      return response.status === 200;
    } catch (error) {
      console.error("Update error details:", error);
      if (error instanceof AxiosError) {
        console.error("Server response:", error.response?.data);
      }
      this.handleError(error, "Error updating notification settings");
      return false;
    }
  }

  async uploadUserAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await this.client.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || !Array.isArray(response.data.urls)) {
        throw new Error("Error uploading user avatar");
      }

      return response.data.urls[0];
    } catch (error) {
      this.handleError(error, "Error uploading user avatar");
      throw error;
    }
  }

  async deleteAccount(): Promise<boolean> {
    try {
      const response = await this.client.delete("/users");
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Error deleting account");
      return false;
    }
  }

  async fetchUserOrders(): Promise<Order[]> {
    try {
      console.log("Fetching user orders...");
      const token = getToken();

      if (!token) {
        console.error("No authentication token found");
        return [];
      }

      // Décoder le token pour obtenir l'ID utilisateur
      let userId: number | null = null;
      try {
        const parts = token.split(".");
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);

        // Vérifier les différentes possibilités pour l'ID utilisateur
        userId = payload.id || payload.userId || payload.user_id;

        if (!userId && payload.user) {
          userId = payload.user.id;
        }

        console.log("User ID from token:", userId);

        if (!userId) {
          // Si pas d'ID, essayer de récupérer par email
          const userEmail = payload.email || payload.user?.email;
          if (userEmail) {
            console.log("Trying to fetch orders by email:", userEmail);
            // Récupérer les commandes depuis l'API
            const response = await this.client.get("/orders", {
              params: { email: userEmail },
            });

            if (response.data && response.data.data) {
              const orders = response.data.data;
              console.log(
                `Found ${orders.length} orders for email ${userEmail}`,
              );
              return orders;
            }
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return [];
      }

      // Si on a un userId, récupérer les commandes normalement
      if (userId) {
        const response = await this.client.get("/orders");
        console.log("Orders data from API:", response.data);

        if (!response.data || !response.data.data) {
          console.log("No orders data found in response");
          return [];
        }

        // Extraire les commandes de la réponse
        const orders = response.data.data;

        // Filtrer les commandes pour l'utilisateur connecté
        const userOrders = orders.filter(
          (order: Order) => order.user_id === userId,
        );
        console.log(`Found ${userOrders.length} orders for user ${userId}`);

        // Récupérer les détails pour chaque commande
        const ordersWithDetails = await Promise.all(
          userOrders.map(async (order: Order) => {
            try {
              const orderDetails = await this.getOrderById(order.id.toString());
              if (!orderDetails) {
                console.log(`No details found for order #${order.id}`);
                return order;
              }
              return {
                ...order,
                ...orderDetails,
              };
            } catch (error) {
              console.error(
                `Error fetching details for order #${order.id}:`,
                error,
              );
              return order;
            }
          }),
        );

        // Filtrer les commandes nulles ou undefined et trier par date
        const validOrders = ordersWithDetails
          .filter((order): order is Order => !!order)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        console.log(`Returning ${validOrders.length} valid orders`);
        return validOrders;
      }

      return [];
    } catch (error) {
      console.error("Error in fetchUserOrders:", error);
      return [];
    }
  }

  // Fonction utilitaire pour extraire l'email d'une commande
  private getOrderEmail(order: Order): string | null {
    // Vérifier dans shipping_info
    if (order.shipping_info?.email) {
      return order.shipping_info.email;
    }

    // Vérifier dans payment_data
    if (order.payment_data?.customerEmail) {
      return order.payment_data.customerEmail;
    }

    // Vérifier dans customer_info (objet)
    if (order.customer_info && typeof order.customer_info === "object") {
      const info = order.customer_info as any;
      if (info.email) return info.email;
      if (info.accountEmail) return info.accountEmail;
      if (info.stripe_email) return info.stripe_email;
      if (info.reboul_email) return info.reboul_email;
    }

    // Vérifier dans customer_info (string)
    if (order.customer_info && typeof order.customer_info === "string") {
      try {
        const parsed = JSON.parse(order.customer_info);
        if (parsed.email) return parsed.email;
        if (parsed.accountEmail) return parsed.accountEmail;
        if (parsed.stripe_email) return parsed.stripe_email;
        if (parsed.reboul_email) return parsed.reboul_email;
      } catch (e) {
        console.warn("Error parsing customer_info", e);
      }
    }

    // Vérifier dans metadata
    if (order.metadata) {
      try {
        const metadata =
          typeof order.metadata === "string"
            ? JSON.parse(order.metadata)
            : order.metadata;
        if (metadata.user_email) return metadata.user_email;
        if (metadata.account_email) return metadata.account_email;
        if (metadata.email) return metadata.email;
      } catch (e) {
        console.warn("Error parsing metadata", e);
      }
    }

    return null;
  }

  async fetchUserReviews(): Promise<UserReview[]> {
    try {
      console.log("Fetching user reviews...");
      const token = getToken();
      console.log("Auth token:", token ? "Present" : "Missing");

      const response = await this.client.get("/reviews");
      console.log("Reviews response:", response.data);

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      if (error instanceof AxiosError) {
        console.error("Server response:", error.response?.data);
      }
      this.handleError(error, "Error fetching user reviews");
      return [];
    }
  }

  async updateReview(
    reviewId: string,
    rating: number,
    comment: string,
  ): Promise<boolean> {
    try {
      const response = await this.client.put(`/reviews/${reviewId}`, {
        rating,
        comment,
      });
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Error updating review");
      return false;
    }
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/reviews/${reviewId}`);
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Error deleting review");
      return false;
    }
  }

  async fetchUsers(): Promise<User[]> {
    try {
      const response = await this.client.get("/users");
      return response.data.map((user: any) => ({
        id: user.id,
        username: user.username || user.name,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
        status: user.status,
      }));
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des utilisateurs",
      );
      return [];
    }
  }

  async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      const response = await this.client.put(`/users/${userId}/role`, {
        is_admin: isAdmin,
      });
      return response.status === 200;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la modification du rôle utilisateur",
      );
      return false;
    }
  }

  async fetchMonthlyStats(): Promise<MonthlyStats[]> {
    try {
      console.log("Fetching monthly stats...");
      const response = await this.client.get("/stats/monthly-sales");
      console.log("Monthly stats response:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      this.handleError(error, "Error fetching monthly statistics");
      return [];
    }
  }

  async fetchTopProductsByCategory(): Promise<TopProductByCategory[]> {
    try {
      console.log("Fetching top products by category...");
      const response = await this.client.get("/stats/top-products-by-category");
      console.log("Top products response:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching top products:", error);
      this.handleError(error, "Error fetching top products");
      return [];
    }
  }

  async fetchCustomerStats(): Promise<CustomerStats[]> {
    try {
      console.log("Fetching customer stats...");
      const response = await this.client.get("/stats/customer-stats");
      console.log("Customer stats response:", response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      this.handleError(error, "Error fetching customer statistics");
      return [];
    }
  }

  async fetchSalesStats(dateRange: {
    from: Date;
    to: Date;
  }): Promise<SalesStats[]> {
    try {
      const response = await this.client.get("/stats/sales", {
        params: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques de ventes",
      );
      return [];
    }
  }

  async fetchCategoryStats(): Promise<CategoryStats[]> {
    try {
      const response = await this.client.get("/stats/categories");
      return response.data;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques par catégorie",
      );
      return [];
    }
  }

  async fetchBrandStats(): Promise<BrandStats[]> {
    try {
      const response = await this.client.get("/stats/brands");
      return response.data;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des statistiques par marque",
      );
      return [];
    }
  }

  async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error("Le nom, l'email et le mot de passe sont requis");
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error("Format d'email invalide");
      }

      const response = await this.client.post("/admin/users", userData);

      return {
        id: response.data.id,
        username: response.data.username || response.data.name,
        email: response.data.email,
        is_admin: response.data.isAdmin || false,
        created_at: response.data.created_at,
        avatar_url: response.data.avatar_url,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        this.handleError(error, `Erreur: ${errorMessage}`);
      } else if (error instanceof Error) {
        this.handleError(error, error.message);
      } else {
        this.handleError(error, "Erreur lors de la création de l'utilisateur");
      }
      return null;
    }
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    try {
      const response = await this.client.put("/admin/settings", settings);
      return response.data;
    } catch (error) {
      this.handleError(error, "Erreur lors de la mise à jour des paramètres");
      throw error;
    }
  }

  async getFavorites(): Promise<Product[]> {
    try {
      // Récupérer le token sans logger à chaque fois
      const token = getToken();

      // Si pas de token, retourner immédiatement un tableau vide sans logging
      if (!token) {
        return [];
      }

      const response = await this.client.get("/users/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return [];
      }
      this.handleError(error, "Erreur lors du chargement des favoris");
      return [];
    }
  }

  async addToFavorites(
    productId: string,
    storeType: string = "main",
  ): Promise<any> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      console.log("Ajout aux favoris:", { productId, storeType });

      const isCornerProduct = storeType === "corner";
      const response = await this.client.post(
        "/users/favorites",
        {
          product_id: productId,
          is_corner_product: isCornerProduct,
          corner_product_id: isCornerProduct ? productId : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Réponse de l'API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée lors de l'ajout aux favoris:", error);
      if (error instanceof AxiosError) {
        console.error("Réponse du serveur:", error.response?.data);
      }
      this.handleError(error, "Erreur lors de l'ajout aux favoris");
      throw error;
    }
  }

  async removeFromFavorites(
    productId: string,
    storeType: string = "main",
  ): Promise<void> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      console.log("Suppression des favoris:", { productId, storeType });

      await this.client.delete("/users/favorites", {
        params: {
          product_id: productId,
          is_corner_product: storeType === "corner",
        },
      });
    } catch (error) {
      console.error(
        "Erreur détaillée lors de la suppression des favoris:",
        error,
      );
      if (error instanceof AxiosError) {
        console.error("Réponse du serveur:", error.response?.data);
      }
      this.handleError(error, "Erreur lors de la suppression des favoris");
      throw error;
    }
  }

  async fetchArchives() {
    try {
      console.log("Début du chargement des archives");
      const response = await this.client.get("/archives");
      console.log("Réponse reçue:", response.data);

      // Transformer les données pour utiliser les URLs Railway
      let archives = response.data;
      if (response.data && response.data.status === "success") {
        archives = response.data.data;
      }

      // Transformer les URLs des images
      return Array.isArray(archives)
        ? archives.map((archive) => ({
            ...archive,
            image: this.formatImageUrl(archive.image),
          }))
        : [];
    } catch (error) {
      console.error("Erreur détaillée lors du chargement des archives:", error);
      if (error instanceof AxiosError) {
        console.error("Détails de l'erreur:", error.response?.data);
      }
      throw error;
    }
  }

  async fetchSettings(): Promise<Settings> {
    try {
      const response = await this.client.get("/admin/settings");
      return response.data;
    } catch (error) {
      this.handleError(error, "Erreur lors de la récupération des paramètres");
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/users/${userId}`);
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Erreur lors de la suppression de l'utilisateur");
      return false;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    try {
      const response = await this.client.put(`/users/${userId}/status`, {
        status,
      });
      return response.status === 200;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la mise à jour du statut de l'utilisateur",
      );
      return false;
    }
  }

  async updateArchive(id: string, data: any): Promise<any> {
    try {
      console.log("Mise à jour de l'archive:", id);
      console.log("Données envoyées:", data);

      const response = await this.client.put(`/archives/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      console.log("Réponse reçue:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour:", error);
      if (error instanceof AxiosError) {
        console.error("Réponse du serveur:", error.response?.data);
      }
      this.handleError(error, "Erreur lors de la mise à jour de l'archive");
      throw error;
    }
  }

  async createArchive(data: any): Promise<any> {
    try {
      console.log("Création d'archive avec les données:", data);
      const response = await this.client.post("/archives", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log("Réponse reçue:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée lors de la création:", error);
      if (error instanceof AxiosError) {
        console.error("Réponse du serveur:", error.response?.data);
      }
      this.handleError(error, "Erreur lors de la création de l'archive");
      throw error;
    }
  }

  async deleteArchive(id: string): Promise<boolean> {
    try {
      const response = await this.client.delete(`/archives/${id}`);
      return response.status === 200;
    } catch (error) {
      this.handleError(error, "Erreur lors de la suppression de l'archive");
      return false;
    }
  }

  async toggleProductActive(id: string, active: boolean): Promise<any> {
    try {
      console.log(`Toggling active status for product ${id} to ${active}`);

      // Utiliser fetch directement pour éviter la validation de l'API
      const token = getToken();
      const apiUrl = `${this.RAILWAY_BASE_URL}/api/products/${id}`;

      console.log(
        `Envoi d'une requête PUT directe à ${apiUrl} avec active=${active}`,
      );

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          active: active,
          _actionType: "toggleActive",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling product active status:", error);
      throw error;
    }
  }

  /**
   * Supprime définitivement les produits marqués comme supprimés (avec _actiontype: "hardDelete" ou "delete")
   * Cette fonction permet de nettoyer la base de données pour éviter d'accumuler trop de données inutilisées.
   */
  async purgeDeletedProducts(): Promise<{
    success: boolean;
    purgedCount: number;
    errors: string[];
  }> {
    try {
      console.log("Démarrage du processus de purge des produits supprimés...");

      // Utiliser une limite plus petite pour éviter les erreurs 500
      const pageSize = 100; // Limite réduite
      let page = 1;
      let allProductsToDelete: Product[] = [];
      let hasMoreProducts = true;

      // Récupérer les produits par pages
      while (hasMoreProducts) {
        try {
          console.log(
            `Récupération des produits - page ${page} (limite: ${pageSize})`,
          );
          const response = await this.client.get("/products", {
            params: {
              limit: pageSize,
              page: page,
            },
          });

          if (
            !response.data ||
            !Array.isArray(response.data.data) ||
            response.data.data.length === 0
          ) {
            hasMoreProducts = false;
            break;
          }

          // Filtrer pour ne garder que les produits marqués comme supprimés
          const productsToDelete = response.data.data.filter(
            (product: Product) =>
              product._actiontype === "hardDelete" ||
              product._actiontype === "delete",
          );

          allProductsToDelete = [...allProductsToDelete, ...productsToDelete];

          // Si on a récupéré moins de produits que la limite, on arrête
          if (response.data.data.length < pageSize) {
            hasMoreProducts = false;
          } else {
            page++;
          }
        } catch (error) {
          console.error(
            `Erreur lors de la récupération de la page ${page}:`,
            error,
          );
          hasMoreProducts = false;
        }
      }

      console.log(`${allProductsToDelete.length} produits à purger.`);

      if (allProductsToDelete.length === 0) {
        toast({
          title: "Information",
          description: "Aucun produit à purger n'a été trouvé.",
        });
        return {
          success: true,
          purgedCount: 0,
          errors: [],
        };
      }

      // Stratégie simple: pour chaque produit, mettre à jour ses données pour
      // - le rendre inactif
      // - lui donner un identifiant spécial facilement reconnaissable
      // - mettre un préfixe SUPPRIMÉ dans son nom
      const results = [];
      const errors = [];

      for (const product of allProductsToDelete) {
        try {
          console.log(`Tentative de purge du produit ID: ${product.id}`);

          // Approche par mise à jour avec le minimum de champs requis
          const updateData = {
            name: `[SUPPRIMÉ] ${product.name}`,
            description: product.description || "Description",
            price: product.price || 0,
            stock: 0,
            category_id: product.category_id || 1,
            brand_id: product.brand_id || 1,
            active: false,
            deleted: true,
            hidden: true,
            store_type: "deleted",
            sku: `DELETED-${product.id}`,
            _actionType: "permDelete",
          };

          const response = await this.client.put(
            `/products/${product.id}`,
            updateData,
          );

          if (response.status === 200 || response.status === 204) {
            results.push(product.id);
          } else {
            throw new Error(`Mise à jour échouée - statut: ${response.status}`);
          }
        } catch (error) {
          console.error(
            `Erreur lors de la purge du produit ID ${product.id}:`,
            error,
          );
          errors.push(
            `ID ${product.id}: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
          );
        }

        // Attendre un court instant entre chaque requête pour ne pas surcharger l'API
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      console.log(
        `Purge terminée. ${results.length} produits purgés. ${errors.length} erreurs.`,
      );

      // Afficher un toast uniquement s'il y a des produits purgés
      if (results.length > 0) {
        toast({
          title: "Purge terminée",
          description: `${results.length} produits ont été purgés du système.`,
        });
      }

      return {
        success: errors.length === 0,
        purgedCount: results.length,
        errors,
      };
    } catch (error) {
      console.error("Erreur lors de la purge des produits supprimés:", error);

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la purge des produits.",
        variant: "destructive",
      });

      return {
        success: false,
        purgedCount: 0,
        errors: [error instanceof Error ? error.message : "Erreur inconnue"],
      };
    }
  }

  /**
   * Récupère les statistiques des collections (nombre total de produits et nouveautés par store_type)
   */
  async fetchCollectionStats(): Promise<CollectionStats> {
    try {
      console.log("Tentative avec l'endpoint /collections/stats...");

      // Essayer d'abord l'endpoint dédié
      try {
        const response = await fetch(
          `${this.RAILWAY_BASE_URL}/collections/stats`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Endpoint /collections/stats indisponible: ${response.status}`,
          );
        }

        const data = await response.json();

        // Si la réponse contient des données (pas d'erreur), les utiliser
        if (!data.error) {
          console.log(
            "Statistiques des collections récupérées depuis l'endpoint dédié:",
            data,
          );
          return data;
        }

        // Si la réponse contient une erreur mais des données de démonstration, les utiliser temporairement
        if (data.error && data.demoData) {
          console.warn(
            "Utilisation des données de démonstration de l'API en attendant la correction du backend",
          );
          return data.demoData;
        }

        // Sinon, passer au fallback
        throw new Error(data.error || "Format de réponse incorrect");
      } catch (endpointError) {
        console.warn(
          "Endpoint dédié indisponible ou erroné, calcul côté client...",
        );
        throw endpointError; // Passer au calcul côté client
      }
    } catch (error) {
      console.warn("Fallback: calcul des statistiques côté client");

      // Calcul des statistiques côté client en fallback
      try {
        console.log("Récupération des produits pour calcul côté client...");

        // Récupérer tous les produits
        const productsResponse = await this.client.get("/products", {
          params: { limit: 1000 },
        });

        if (
          !productsResponse.data ||
          !productsResponse.data.data ||
          !Array.isArray(productsResponse.data.data)
        ) {
          throw new Error("Format de réponse API inattendu");
        }

        // Filtrer les produits supprimés
        const validProducts = productsResponse.data.data.filter(
          (product: Product) =>
            product._actiontype !== "hardDelete" &&
            product._actiontype !== "delete" &&
            product._actiontype !== "permDelete" &&
            product.store_type !== "deleted" &&
            (typeof product.name !== "string" ||
              !product.name.startsWith("[SUPPRIMÉ]")),
        );

        console.log(
          `${validProducts.length} produits valides pour calculer les statistiques`,
        );

        // Calculer les statistiques par store_type
        const stats = validProducts.reduce(
          (acc: CollectionStats, product: Product) => {
            const storeType = product.store_type || "other";

            if (!acc[storeType]) {
              acc[storeType] = { total: 0, new: 0 };
            }

            // Incrémenter le compteur total
            acc[storeType].total += 1;

            // Si le produit est marqué comme nouveau, incrémenter le compteur de nouveautés
            if (product.new === true) {
              acc[storeType].new += 1;
            }

            return acc;
          },
          {} as CollectionStats,
        );

        // S'assurer que toutes les catégories connues sont présentes dans les stats
        const knownTypes = ["adult", "kids", "sneakers", "cpcompany"];
        knownTypes.forEach((type) => {
          if (!stats[type]) {
            stats[type] = { total: 0, new: 0 };
          }
        });

        console.log(
          "Statistiques des collections calculées côté client:",
          stats,
        );
        return stats;
      } catch (fallbackError) {
        console.error("Erreur lors du calcul côté client:", fallbackError);
        this.handleError(
          fallbackError,
          "Erreur lors du calcul des statistiques",
        );

        // En dernier recours, utiliser les données de démonstration
        const demoStats = {
          adult: { total: 178, new: 12 },
          kids: { total: 94, new: 8 },
          sneakers: { total: 67, new: 0 },
          cpcompany: { total: 42, new: 0 },
        };

        console.info(
          "Utilisation des données de démonstration (dernier recours)",
        );
        return demoStats;
      }
    }
  }

  // Méthodes pour les produits The Corner
  async fetchCornerProducts(
    params: Record<string, string | number> = {},
  ): Promise<{ products: Product[]; total: number }> {
    try {
      const response = await this.client.get("/corner-products", { params });

      // Transformation des données reçues
      const products = response.data.data.map((product: any) => {
        // Normalisation de l'URL des images
        if (product.image_url) {
          product.image_url = this.formatImageUrl(product.image_url);
        }

        // Normalisation des images
        if (product.images && Array.isArray(product.images)) {
          product.images = product.images.map((img: string) =>
            this.formatImageUrl(img),
          );
        }

        // Normalisation du prix
        product.price = this.normalizePrice(product.price);

        // Traitement des variants
        if (product.variants && typeof product.variants === "string") {
          try {
            product.variants = JSON.parse(product.variants);
          } catch (e) {
            console.error("Erreur parsing variants:", e);
            product.variants = [];
          }
        }

        // Convertir le format des variants du backend (taille/couleur) au format frontend (size/color)
        if (product.variants && Array.isArray(product.variants)) {
          product.variants = product.variants.map((variant: any) => ({
            id: variant.id,
            size: variant.taille || variant.size,
            color: variant.couleur || variant.color,
            stock: variant.stock,
            price: variant.price
              ? this.normalizePrice(variant.price)
              : undefined,
          }));
        }

        return product;
      });

      return {
        products,
        total: response.data.pagination.totalItems || products.length,
      };
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la récupération des produits The Corner",
      );
      return { products: [], total: 0 };
    }
  }

  async getCornerProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.client.get(`/corner-products/${id}`);
      const product = response.data;

      // Normalisation de l'URL des images
      if (product.image_url) {
        product.image_url = this.formatImageUrl(product.image_url);
      }

      // Normalisation des images
      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.map((img: string) =>
          this.formatImageUrl(img),
        );
      }

      // Normalisation du prix
      product.price = this.normalizePrice(product.price);

      // Traitement des variants
      if (product.variants && typeof product.variants === "string") {
        try {
          product.variants = JSON.parse(product.variants);
        } catch (e) {
          console.error("Erreur parsing variants:", e);
          product.variants = [];
        }
      }

      // Convertir le format des variants du backend (taille/couleur) au format frontend (size/color)
      if (product.variants && Array.isArray(product.variants)) {
        product.variants = product.variants.map((variant: any) => ({
          id: variant.id,
          size: variant.taille || variant.size,
          color: variant.couleur || variant.color,
          stock: variant.stock,
          price: variant.price ? this.normalizePrice(variant.price) : undefined,
        }));
      }

      return product;
    } catch (error) {
      this.handleError(
        error,
        `Erreur lors de la récupération du produit The Corner (ID: ${id})`,
      );
      return null;
    }
  }

  async createCornerProduct(productData: ProductWithFiles): Promise<Product> {
    try {
      const formData = new FormData();

      // Ajout des champs textuels au formData
      for (const [key, value] of Object.entries(productData)) {
        if (key === "images" || key === "files") continue; // Traité séparément

        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      }

      // Traitement des images
      if (productData.files && Array.isArray(productData.files)) {
        for (const file of productData.files) {
          formData.append("images", file);
        }
      }

      const response = await this.client.post("/corner-products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      this.handleError(
        error,
        "Erreur lors de la création du produit The Corner",
      );
      throw error;
    }
  }

  async updateCornerProduct(
    id: string,
    data: ProductWithFiles,
  ): Promise<Product> {
    try {
      const formData = new FormData();

      // Ajout des champs textuels au formData
      for (const [key, value] of Object.entries(data)) {
        if (key === "images" || key === "files") continue; // Traité séparément

        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      }

      // Traitement des images
      if (data.files && Array.isArray(data.files)) {
        for (const file of data.files) {
          formData.append("images", file);
        }
      }

      const response = await this.client.put(
        `/corner-products/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      this.handleError(
        error,
        `Erreur lors de la mise à jour du produit The Corner (ID: ${id})`,
      );
      throw error;
    }
  }

  async deleteCornerProduct(id: string): Promise<boolean> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      await this.client.delete(`/corner/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      this.handleError(error, "Erreur lors de la suppression du produit");
      return false;
    }
  }

  async addToCornerFavorites(productId: string): Promise<any> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Non authentifié");
      }

      console.log("Ajout aux favoris The Corner:", { productId });

      const response = await this.client.post(
        "/users/favorites",
        {
          product_id: productId,
          is_corner_product: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Réponse de l'API:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur détaillée lors de l'ajout aux favoris The Corner:",
        error,
      );
      if (error instanceof AxiosError) {
        console.error("Réponse du serveur:", error.response?.data);
      }
      this.handleError(error, "Erreur lors de l'ajout aux favoris The Corner");
      throw error;
    }
  }

  async sendTrackingEmail(
  orderId: number,
  trackingNumber: string,
  carrier?: string,
): Promise<boolean> {
  try {
    await this.client.post(`/orders/${orderId}/send-tracking-email`, {
      tracking_number: trackingNumber,
      carrier: carrier,
    });
    return true;
  } catch (error) {
    this.handleError(error, `Error sending tracking email for order ${orderId}`);
    return false;
  }
}
}

export const api = new Api();

// Exports principaux
export const fetchUserOrders = api.fetchUserOrders.bind(api);
export const fetchUserAddresses = api.fetchAddresses.bind(api);
export const createAddress = api.addAddress.bind(api);
export const updateUserRole = api.updateUserRole.bind(api);

// Autres exports
export const fetchProducts = api.fetchProducts.bind(api);
export const getProductById = api.getProductById.bind(api);
export const createProduct = api.createProduct.bind(api);
export const updateProduct = api.updateProduct.bind(api);
export const deleteProduct = api.deleteProduct.bind(api);
export const fetchOrders = api.fetchOrders.bind(api);
export const getOrderById = api.getOrderById.bind(api);
export const updateOrderStatus = api.updateOrderStatus.bind(api);
export const fetchDashboardStats = api.fetchDashboardStats.bind(api);
export const fetchRecentOrders = api.fetchRecentOrders.bind(api);
export const fetchTopProducts = api.fetchTopProducts.bind(api);
export const fetchWeeklySales = api.fetchWeeklySales.bind(api);
export const updateProductStock = api.updateProductStock.bind(api);
export const changePassword = api.changePassword.bind(api);
export const fetchAddresses = api.fetchAddresses.bind(api);
export const updateUserInfo = api.updateUserInfo.bind(api);
export const login = api.login.bind(api);
export const register = api.register.bind(api);
export const logout = api.logout.bind(api);
export const fetchUserProfile = api.fetchUserProfile.bind(api);
export const addToCart = api.addToCart.bind(api);
export const removeFromCart = api.removeFromCart.bind(api);
export const fetchCart = api.fetchCart.bind(api);
export const createOrder = api.createOrder.bind(api);
export const addAddress = api.addAddress.bind(api);
export const updateAddress = api.updateAddress.bind(api);
export const deleteAddress = api.deleteAddress.bind(api);
export const searchProducts = api.searchProducts.bind(api);
export const addReview = api.addReview.bind(api);
export const fetchProductReviews = api.fetchProductReviews.bind(api);
export const fetchCategories = api.fetchCategories.bind(api);
export const createCategory = api.createCategory.bind(api);
export const updateCategory = api.updateCategory.bind(api);
export const deleteCategory = api.deleteCategory.bind(api);
export const uploadImages = api.uploadImages.bind(api);
export const fetchBrands = api.fetchBrands.bind(api);
export const createBrand = api.createBrand.bind(api);
export const updateBrand = api.updateBrand.bind(api);
export const deleteBrand = api.deleteBrand.bind(api);
export const processReturn = api.processReturn.bind(api);
export const deleteOrder = api.deleteOrder.bind(api);
export const fetchNotificationSettings =
  api.fetchNotificationSettings.bind(api);
export const updateNotificationSettings =
  api.updateNotificationSettings.bind(api);
export const uploadUserAvatar = api.uploadUserAvatar.bind(api);
export const deleteAccount = api.deleteAccount.bind(api);
export const fetchUserReviews = api.fetchUserReviews.bind(api);
export const updateReview = api.updateReview.bind(api);
export const deleteReview = api.deleteReview.bind(api);
export const fetchUsers = api.fetchUsers.bind(api);
export const fetchMonthlyStats = api.fetchMonthlyStats.bind(api);
export const fetchTopProductsByCategory =
  api.fetchTopProductsByCategory.bind(api);
export const fetchCustomerStats = api.fetchCustomerStats.bind(api);
export const fetchSalesStats = api.fetchSalesStats.bind(api);
export const fetchCategoryStats = api.fetchCategoryStats.bind(api);
export const fetchBrandStats = api.fetchBrandStats.bind(api);
export const createUser = api.createUser.bind(api);
export const updateSettings = api.updateSettings.bind(api);

// Favoris
export const getFavorites = api.getFavorites.bind(api);
export const addToFavorites = api.addToFavorites.bind(api);
export const addToCornerFavorites = api.addToCornerFavorites.bind(api);
export const removeFromFavorites = api.removeFromFavorites.bind(api);

export const fetchArchives = api.fetchArchives.bind(api);

export const toggleProductActive = api.toggleProductActive.bind(api);

export const purgeDeletedProducts = api.purgeDeletedProducts.bind(api);
