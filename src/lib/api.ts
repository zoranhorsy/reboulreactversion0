import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: number
  category: string
  brand_id: number
  brand: string
  image_url: string
  images: (string | File | Blob)[]
  image: string
  variants: Variant[]
  tags: string[]
  reviews: { id: number; rating: number; comment: string; userName: string; date: string }[]
  questions: { id: number; question: string; answer?: string }[]
  faqs: { question: string; answer: string }[]
  size_chart: { size: string; chest: number; waist: number; hips: number }[]
  store_type: "adult" | "kids" | "sneakers"
  featured: boolean
  colors: string[]
}

export interface Address {
  id: string
  street: string
  city: string
  postal_code: string
  country: string
}

export interface UserInfo {
  id: number
  name: string
  email: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  user_id: number
  user?: UserInfo
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
  items?: OrderItem[]
  shipping_address?: Address
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
}

export interface TopProduct {
  id: number
  name: string
  totalSold: number
}

export interface WeeklySales {
  date: string
  total: number
}

export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  avatarUrl?: string
  address?: string
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface Brand {
  id: number
  name: string
}

export interface ReturnRequest {
  orderId: string
  reason: string
}

export interface Variant {
  color: string
  size: string
  stock: number
}

export interface ChangePasswordResponse {
  success: boolean
  message: string
}

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token")
  }
  return null
}

export class Api {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken()
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private handleError(error: unknown, customMessage: string): void {
    console.error(customMessage, error)
    if (error instanceof AxiosError) {
      const errorMessage = error.response?.data?.message || error.message
      toast({
        title: "Error",
        description: `${customMessage}: ${errorMessage}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Error",
        description: customMessage,
        variant: "destructive",
      })
    }
  }

  async fetchProducts(params: Record<string, string | number> = {}): Promise<{ products: Product[]; total: number }> {
    try {
      console.log("=== DEBUG fetchProducts ===")
      console.log("1. Paramètres bruts reçus:", params)

      // Transformer category en category_id si présent
      const transformedParams = { ...params }
      if (transformedParams.category && transformedParams.category !== 'all') {
        transformedParams.category_id = transformedParams.category
        delete transformedParams.category
      }

      console.log("2. Paramètres après transformation:", transformedParams)

      const activeParams = Object.entries(transformedParams).reduce(
        (acc, [key, value]) => {
          // Ne pas filtrer store_type même s'il est "all"
          if (key === "store_type" || (value && value !== "all" && value !== "" && value !== "false")) {
            acc[key] = String(value)
          }
          return acc
        },
        {} as Record<string, string>,
      )

      console.log("3. Paramètres actifs qui seront envoyés à l'API:", activeParams)
      const response = await this.client.get("/products", { params: activeParams })
      console.log("4. Réponse brute de l'API:", response.data)

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("Format de réponse API inattendu:", response.data)
        throw new Error("Format de réponse API inattendu")
      }

      const products = response.data.data.map((product: Product) => ({
        ...product,
        category: product.category_id,
        image_url: this.formatImageUrl(product.image_url),
        images: Array.isArray(product.images) ? product.images.map((img) => this.formatImageUrl(img)) : [],
      }))

      console.log("5. Produits transformés:", products)
      console.log("6. Nombre total de produits:", response.data.pagination.totalItems)
      console.log("=== FIN DEBUG fetchProducts ===")

      return {
        products,
        total: response.data.pagination.totalItems,
      }
    } catch (error) {
      console.error("Erreur détaillée dans fetchProducts:", error)
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message)
      }
      throw error
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.client.get(`/products/${id}`)
      return response.data
    } catch (error) {
      this.handleError(error, `Error fetching product with ID ${id}`)
      return null
    }
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const productData = {
      name: data.name,
      price: data.price || 0,
      description: data.description,
      category_id: data.category_id,
      brand: data.brand,
      store_type: data.store_type,
      featured: data.featured || false,
      stock: data.stock || 0,
      variants: data.variants || [],
      colors: data.colors || [],
      images: data.images || [],
      reviews: data.reviews || [],
      questions: data.questions || [],
      faqs: data.faqs || [],
      size_chart: data.size_chart || []
    }

    const response = await this.client.post("/products", productData)
    return response.data
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      console.log(`Tentative de mise à jour du produit avec l'ID: ${id}`)
      console.log("Données du produit reçues:", JSON.stringify(productData, null, 2))

      // Créer un nouvel objet avec les champs requis et validés
      const validatedData: Partial<Product> = {
        name: productData.name?.trim(),
        price: typeof productData.price === 'number' ? productData.price : parseFloat(String(productData.price)),
        description: productData.description?.trim(),
        category_id: typeof productData.category_id === 'number' 
          ? productData.category_id 
          : parseInt(String(productData.category_id), 10),
        brand: productData.brand?.trim(),
        store_type: productData.store_type || "adult",
        featured: Boolean(productData.featured),
        stock: typeof productData.stock === 'number' ? productData.stock : parseInt(String(productData.stock), 10),
        variants: productData.variants,
        colors: productData.colors,
        images: productData.images
      }

      // Vérifier les valeurs requises
      if (!validatedData.name || validatedData.name.length === 0) {
        throw new Error("Le nom du produit est requis")
      }

      if (isNaN(validatedData.price!) || validatedData.price! < 0) {
        throw new Error("Le prix doit être un nombre positif")
      }

      if (isNaN(validatedData.category_id!)) {
        throw new Error("La catégorie est requise")
      }

      // Gérer les tableaux optionnels
      if (productData.variants) {
        validatedData.variants = productData.variants.map(variant => ({
          color: variant.color.trim(),
          size: variant.size.trim(),
          stock: parseInt(String(variant.stock), 10)
        }))
      }

      if (productData.colors) {
        validatedData.colors = productData.colors.filter(color => color.trim().length > 0)
      }

      // Gérer les images
      const imagesToUpload = productData.images?.filter((img): img is File | Blob => 
        img instanceof File || img instanceof Blob
      ) || []
      const imageUrls = productData.images?.filter((img): img is string => 
        typeof img === "string"
      ) || []

      // Si il y a des images à uploader
      if (imagesToUpload.length > 0) {
        const uploadedImageUrls = await this.uploadImages(imagesToUpload)
        validatedData.images = [...imageUrls, ...uploadedImageUrls]
      } else if (imageUrls.length > 0) {
        validatedData.images = imageUrls
      }

      console.log("Données validées à envoyer:", JSON.stringify(validatedData, null, 2))

      const response = await this.client.put(`/products/${id}`, validatedData)

      if (!response.data) {
        throw new Error("Aucune donnée reçue du serveur après la mise à jour")
      }

      // Formater la réponse
      const updatedProduct = {
        ...response.data,
        category: response.data.category_id,
        images: response.data.images || [],
        variants: response.data.variants || [],
        colors: response.data.colors || [],
        featured: Boolean(response.data.featured)
      }

      return updatedProduct

    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error)
      if (error instanceof AxiosError) {
        console.error("Server response:", error.response?.data)
        const errorMessage = error.response?.data?.message || error.message
        throw new Error(`Erreur lors de la mise à jour du produit: ${errorMessage}`)
      }
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la mise à jour du produit: ${error.message}`)
      }
      throw new Error("Erreur inconnue lors de la mise à jour du produit")
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log(`Tentative de suppression du produit avec l'ID: ${id}`)
      const response = await this.client.delete(`/products/${id}`)
      console.log(`Réponse de suppression:`, response)

      if (response.status === 200) {
        toast({
          title: "Succès",
          description: `Le produit avec l'ID ${id} a été supprimé avec succès.`,
        })
        return true
      } else {
        throw new Error(response.data.message || "Erreur inconnue lors de la suppression")
      }
    } catch (error) {
      console.error(`Erreur détaillée lors de la suppression du produit avec l'ID ${id}:`, error)
      if (error instanceof AxiosError) {
        console.error(`Statut: ${error.response?.status}, Données:`, error.response?.data)
        const errorMessage = error.response?.data?.message || error.message
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        this.handleError(error, `Erreur lors de la suppression du produit avec l'ID ${id}`)
      }
      return false
    }
  }

  async fetchOrders(): Promise<{
    data: Order[]
    pagination: { totalItems: number; totalPages: number; currentPage: number }
  }> {
    try {
      const response = await this.client.get("/orders")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching orders")
      return { data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 0 } }
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const response = await this.client.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      this.handleError(error, `Error fetching order with ID ${id}`)
      return null
    }
  }

  async updateOrderStatus(orderId: number, newStatus: string): Promise<Order | null> {
    try {
      const response = await this.client.put(`/orders/${orderId}/status`, { status: newStatus })
      return response.data
    } catch (error) {
      this.handleError(error, `Error updating status for order ${orderId}`)
      return null
    }
  }

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.client.get("/admin/stats")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching dashboard stats")
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
      }
    }
  }

  async fetchRecentOrders(): Promise<Order[]> {
    try {
      const response = await this.client.get("/admin/recent-orders")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching recent orders")
      return []
    }
  }

  async fetchTopProducts(): Promise<TopProduct[]> {
    try {
      const response = await this.client.get("/admin/top-products")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching top products")
      return []
    }
  }

  async fetchWeeklySales(): Promise<WeeklySales[]> {
    try {
      const response = await this.client.get("/admin/weekly-sales")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching weekly sales")
      return []
    }
  }

  async updateProductStock(
    productId: string,
    quantity: number,
    variant: { size: string; color: string },
  ): Promise<boolean> {
    try {
      await this.client.put(`/products/${productId}/stock`, { quantity, variant })
      return true
    } catch (error) {
      this.handleError(error, "Error updating product stock")
      return false
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
    try {
      const response = await this.client.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      return {
        success: true,
        message: response.data.message || 'Mot de passe changé avec succès',
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          message: error.response?.data?.message || 'Erreur lors du changement de mot de passe',
        }
      }
      return {
        success: false,
        message: 'Une erreur inattendue est survenue',
      }
    }
  }

  async fetchAddresses(): Promise<Address[]> {
    try {
      const response = await this.client.get("/user/addresses")
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      this.handleError(error, "Error fetching addresses")
      return []
    }
  }

  async updateUserInfo(userInfo: Partial<User>): Promise<User | null> {
    try {
      const response = await this.client.put("/user/profile", userInfo)
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating user info")
      return null
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await this.client.post("/auth/login", { email, password })
      const { user, token } = response.data
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
      }
      return { user, token }
    } catch (error) {
      this.handleError(error, "Error during login")
      return null
    }
  }

  async register(userData: { name: string; email: string; password: string }): Promise<User | null> {
    try {
      const response = await this.client.post("/auth/register", userData)
      return response.data
    } catch (error) {
      this.handleError(error, "Error during registration")
      return null
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
    }
  }

  async fetchUserProfile(): Promise<User | null> {
    try {
      const response = await this.client.get("/user/profile")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching user profile")
      return null
    }
  }

  async addToCart(productId: string, quantity: number): Promise<boolean> {
    try {
      await this.client.post("/cart/add", { productId, quantity })
      return true
    } catch (error) {
      this.handleError(error, "Error adding product to cart")
      return false
    }
  }

  async removeFromCart(productId: string): Promise<boolean> {
    try {
      await this.client.delete(`/cart/remove/${productId}`)
      return true
    } catch (error) {
      this.handleError(error, "Error removing product from cart")
      return false
    }
  }

  async fetchCart(): Promise<{ items: Array<{ product: Product; quantity: number }>; total: number } | null> {
    try {
      const response = await this.client.get("/cart")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching cart")
      return null
    }
  }

  async createOrder(orderData: { addressId: string; paymentMethod: string }): Promise<Order | null> {
    try {
      const response = await this.client.post("/orders", orderData)
      return response.data
    } catch (error) {
      this.handleError(error, "Error creating order")
      return null
    }
  }

  async addAddress(addressData: Omit<Address, "id">): Promise<Address | null> {
    try {
      const response = await this.client.post("/user/addresses", addressData)
      return response.data
    } catch (error) {
      this.handleError(error, "Error adding address")
      return null
    }
  }

  async updateAddress(id: string, addressData: Partial<Address>): Promise<Address | null> {
    try {
      const response = await this.client.put(`/user/addresses/${id}`, addressData)
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating address")
      return null
    }
  }

  async deleteAddress(id: string): Promise<boolean> {
    try {
      await this.client.delete(`/user/addresses/${id}`)
      return true
    } catch (error) {
      this.handleError(error, "Error deleting address")
      return false
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.client.get("/products/search", { params: { q: query } })
      return response.data
    } catch (error) {
      this.handleError(error, "Error searching products")
      return []
    }
  }

  async addReview(productId: string, reviewData: { rating: number; comment: string }): Promise<boolean> {
    try {
      await this.client.post(`/products/${productId}/reviews`, reviewData)
      return true
    } catch (error) {
      this.handleError(error, "Error adding review")
      return false
    }
  }

  async fetchProductReviews(
    productId: string,
  ): Promise<{ id: number; rating: number; comment: string; userName: string; date: string }[]> {
    try {
      const response = await this.client.get(`/products/${productId}/reviews`)
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching product reviews")
      return []
    }
  }

  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await this.client.get("/categories")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching categories")
      return []
    }
  }

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await this.client.post("/categories", { name })
      return response.data
    } catch (error) {
      this.handleError(error, "Error creating category")
      throw error
    }
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    try {
      const response = await this.client.put(`/categories/${id}`, { name })
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating category")
      throw error
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/categories/${id}`)
      return true
    } catch (error) {
      this.handleError(error, "Error deleting category")
      return false
    }
  }

  async fetchBrands(): Promise<Brand[]> {
    try {
      const response = await this.client.get("/brands")
      return response.data
    } catch (error) {
      this.handleError(error, "Error fetching brands")
      return []
    }
  }

  async createBrand(name: string): Promise<Brand> {
    try {
      const response = await this.client.post("/brands", { name })
      return response.data
    } catch (error) {
      this.handleError(error, "Error creating brand")
      throw error
    }
  }

  async updateBrand(id: number, name: string): Promise<Brand> {
    try {
      const response = await this.client.put(`/brands/${id}`, { name })
      return response.data
    } catch (error) {
      this.handleError(error, "Error updating brand")
      throw error
    }
  }

  async deleteBrand(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/brands/${id}`)
      return true
    } catch (error) {
      this.handleError(error, "Error deleting brand")
      return false
    }
  }

  async uploadImages(files: (File | Blob)[]): Promise<string[]> {
    const formData = new FormData()
    files.forEach((file, index) => {
      const fileName = file instanceof File ? file.name : `image${index}.jpg`
      formData.append("images", file, fileName)
    })

    try {
      const response = await this.client.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Upload response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        return response.data.map((url: string) => this.formatImageUrl(url))
      } else if (response.data && response.data.urls && Array.isArray(response.data.urls)) {
        return response.data.urls.map((url: string) => this.formatImageUrl(url))
      } else if (response.data && typeof response.data === "string") {
        return [this.formatImageUrl(response.data)]
      } else {
        console.error("Unexpected response format:", response.data)
        throw new Error("Format de réponse inattendu du serveur")
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      if (error instanceof Error) {
        throw new Error(`Erreur lors de l'upload des images: ${error.message}`)
      }
      throw new Error("Erreur lors de l'upload des images")
    }
  }

  async processReturn(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await this.client.post(`/orders/${orderId}/return`, { reason })
      return response.data
    } catch (error) {
      this.handleError(error, "Error processing return")
      throw error
    }
  }

  async deleteOrder(orderId: number): Promise<boolean> {
    try {
      await this.client.delete(`/orders/${orderId}`)
      return true
    } catch (error) {
      this.handleError(error, `Error deleting order with ID ${orderId}`)
      return false
    }
  }

  formatImageUrl(url: string | File | Blob | null | undefined): string {
    if (!url) return "/placeholder.png"
    if (url instanceof File || url instanceof Blob) return URL.createObjectURL(url)
    if (url.startsWith("http")) return url
    const cleanUrl = url.startsWith("/uploads") ? url.slice(8) : url
    return `${API_URL}/uploads${cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`}`
  }
}

export const api = new Api()

export const fetchProducts = api.fetchProducts.bind(api)
export const getProductById = api.getProductById.bind(api)
export const createProduct = api.createProduct.bind(api)
export const updateProduct = api.updateProduct.bind(api)
export const deleteProduct = api.deleteProduct.bind(api)
export const fetchOrders = api.fetchOrders.bind(api)
export const getOrderById = api.getOrderById.bind(api)
export const updateOrderStatus = api.updateOrderStatus.bind(api)
export const fetchDashboardStats = api.fetchDashboardStats.bind(api)
export const fetchRecentOrders = api.fetchRecentOrders.bind(api)
export const fetchTopProducts = api.fetchTopProducts.bind(api)
export const fetchWeeklySales = api.fetchWeeklySales.bind(api)
export const updateProductStock = api.updateProductStock.bind(api)
export const changePassword = api.changePassword.bind(api)
export const fetchAddresses = api.fetchAddresses.bind(api)
export const updateUserInfo = api.updateUserInfo.bind(api)
export const login = api.login.bind(api)
export const register = api.register.bind(api)
export const logout = api.logout.bind(api)
export const fetchUserProfile = api.fetchUserProfile.bind(api)
export const addToCart = api.addToCart.bind(api)
export const removeFromCart = api.removeFromCart.bind(api)
export const fetchCart = api.fetchCart.bind(api)
export const createOrder = api.createOrder.bind(api)
export const addAddress = api.addAddress.bind(api)
export const updateAddress = api.updateAddress.bind(api)
export const deleteAddress = api.deleteAddress.bind(api)
export const searchProducts = api.searchProducts.bind(api)
export const addReview = api.addReview.bind(api)
export const fetchProductReviews = api.fetchProductReviews.bind(api)
export const fetchCategories = api.fetchCategories.bind(api)
export const createCategory = api.createCategory.bind(api)
export const updateCategory = api.updateCategory.bind(api)
export const deleteCategory = api.deleteCategory.bind(api)
export const uploadImages = api.uploadImages.bind(api)
export const fetchBrands = api.fetchBrands.bind(api)
export const createBrand = api.createBrand.bind(api)
export const updateBrand = api.updateBrand.bind(api)
export const deleteBrand = api.deleteBrand.bind(api)
export const processReturn = api.processReturn.bind(api)
export const deleteOrder = api.deleteOrder.bind(api)

export const getImagePath = (imagePath: string | File | Blob): string => {
  if (!imagePath) {
    return "/placeholder.png"
  }
  if (imagePath instanceof File || imagePath instanceof Blob) {
    return URL.createObjectURL(imagePath)
  }
  if (imagePath.startsWith("http")) {
    return imagePath
  }
  const cleanUrl = imagePath.startsWith("/uploads") ? imagePath.slice(8) : imagePath
  return `${API_URL}/uploads${cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`}`
}

