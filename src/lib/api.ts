import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: number | null;
    image_url: string;
    brand: string;
    images: string[];
    variants: { size: string; color: string; stock: number }[];
    tags: string[];
    reviews: { id: number; rating: number; comment: string; userName: string; date: string }[];
    questions: { id: number; question: string; answer?: string }[];
    faqs: { question: string; answer: string }[];
    sizeChart: { size: string; chest: number; waist: number; hips: number }[];
    storeType: 'adult' | 'kids' | 'sneakers';
    featured: boolean;
    colors: string[];
    category_id?: number;
}

export interface Order {
    id: string;
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    id: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
}

export interface TopProduct {
    id: string;
    name: string;
    totalSold: number;
}

export interface WeeklySales {
    date: string;
    total: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    avatarUrl?: string;
    address?: string;
}

export interface Category {
    id: number;
    name: string;
}

class Api {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                const token = localStorage.getItem('token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        this.instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                        const { token } = response.data;
                        localStorage.setItem('token', token);
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return this.instance(originalRequest);
                    } catch (refreshError) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private handleError(error: unknown, customMessage: string): void {
        console.error(customMessage, error);
        if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || error.message;
            toast({
                title: "Error",
                description: `${customMessage}: ${errorMessage}`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Error",
                description: customMessage,
                variant: "destructive",
            });
        }
    }

    async fetchProducts(params: Record<string, string | number> = {}): Promise<{ products: Product[], total: number }> {
        try {
            const stringParams = Object.fromEntries(
                Object.entries(params).map(([key, value]) => [key, String(value)])
            );
            console.log('Fetching products with params:', stringParams);
            const response = await this.instance.get('/products', { params: stringParams });
            const products = response.data.data.map((product: any) => ({
                ...product,
                category: product.category_id || null
            }));
            return {
                products,
                total: response.data.pagination.totalItems
            };
        } catch (error) {
            this.handleError(error, 'Error fetching products');
            return { products: [], total: 0 };
        }
    }

    async getProductById(id: string): Promise<Product | null> {
        try {
            const response = await this.instance.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, `Error fetching product with ID ${id}`);
            return null;
        }
    }

    async createProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
        try {
            let imagesToUpload = productData.images.filter(img => img instanceof File) as File[];
            let imageUrls = productData.images.filter(img => typeof img === 'string');

            if (imagesToUpload.length > 0) {
                const uploadedImageUrls = await this.uploadImages(imagesToUpload);
                imageUrls = [...imageUrls, ...uploadedImageUrls];
            }

            const dataToSend = {
                ...productData,
                images: imageUrls,
                category_id: productData.category,
                store_type: productData.storeType
            };
            delete dataToSend.category;
            delete dataToSend.storeType;

            const response = await this.instance.post('/products', dataToSend);
            const createdProduct = {
                ...response.data,
                category: response.data.category_id,
            };
            delete createdProduct.category_id;
            return createdProduct;
        } catch (error) {
            this.handleError(error, 'Error creating product');
            return null;
        }
    }

    async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
        try {
            console.log(`Tentative de mise à jour du produit avec l'ID: ${id}`);
            console.log('Données du produit:', productData);

            let imagesToUpload = productData.images?.filter(img => img instanceof Blob || img instanceof File) || [];
            let imageUrls = productData.images?.filter(img => typeof img === 'string') || [];

            if (imagesToUpload.length > 0) {
                const uploadedImageUrls = await this.uploadImages(imagesToUpload);
                imageUrls = [...imageUrls, ...uploadedImageUrls];
            }

            const dataToSend = { ...productData, images: imageUrls };

            // Convertir category en category_id si nécessaire
            if (dataToSend.category !== undefined) {
                dataToSend.category_id = dataToSend.category;
                delete dataToSend.category;
            }

            // Convertir storeType en store_type si nécessaire
            if (dataToSend.storeType !== undefined) {
                dataToSend.store_type = dataToSend.storeType;
                delete dataToSend.storeType;
            }

            // Supprimer les champs undefined ou null
            Object.keys(dataToSend).forEach(key =>
                (dataToSend[key] === undefined || dataToSend[key] === null) && delete dataToSend[key]
            );

            console.log('Données envoyées au serveur:', dataToSend);

            const response = await this.instance.put(`/products/${id}`, dataToSend);

            console.log('Réponse de mise à jour:', response.data);

            // Convertir category_id en category dans la réponse
            const updatedProduct = {
                ...response.data,
                category: response.data.category_id,
            };
            delete updatedProduct.category_id;

            return updatedProduct;
        } catch (error) {
            this.handleError(error, `Error updating product with ID ${id}`);
            return null;
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        try {
            await this.instance.delete(`/products/${id}`);
            return true;
        } catch (error) {
            this.handleError(error, `Error deleting product with ID ${id}`);
            return false;
        }
    }

    async fetchOrders(): Promise<Order[]> {
        try {
            const response = await this.instance.get('/orders');
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error fetching orders');
            return [];
        }
    }

    async getOrderById(id: string): Promise<Order | null> {
        try {
            const response = await this.instance.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, `Error fetching order with ID ${id}`);
            return null;
        }
    }

    async fetchDashboardStats(): Promise<DashboardStats> {
        try {
            const response = await this.instance.get('/admin/stats');
            const stats = response.data;
            return {
                totalRevenue: typeof stats.totalRevenue === 'number' ? stats.totalRevenue : 0,
                totalOrders: typeof stats.totalOrders === 'number' ? stats.totalOrders : 0,
                totalProducts: typeof stats.totalProducts === 'number' ? stats.totalProducts : 0,
                totalUsers: typeof stats.totalUsers === 'number' ? stats.totalUsers : 0
            };
        } catch (error) {
            this.handleError(error, 'Error fetching dashboard stats');
            return {
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalUsers: 0
            };
        }
    }

    async fetchRecentOrders(): Promise<Order[]> {
        try {
            const response = await this.instance.get('/admin/recent-orders');
            return Array.isArray(response.data) ? response.data.map(order => ({
                id: order.id || '',
                userId: order.userId || '',
                items: order.items || [],
                totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : 0,
                status: order.status || '',
                createdAt: order.createdAt || '',
                updatedAt: order.updatedAt || ''
            })) : [];
        } catch (error) {
            this.handleError(error, 'Error fetching recent orders');
            return [];
        }
    }

    async fetchTopProducts(): Promise<TopProduct[]> {
        try {
            const response = await this.instance.get('/admin/top-products');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            this.handleError(error, 'Error fetching top products');
            return [];
        }
    }

    async fetchWeeklySales(): Promise<WeeklySales[]> {
        try {
            const response = await this.instance.get('/admin/weekly-sales');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            this.handleError(error, 'Error fetching weekly sales');
            return [];
        }
    }

    async updateProductStock(
        productId: string,
        quantity: number,
        variant: { size: string; color: string }
    ): Promise<boolean> {
        try {
            await this.instance.put(`/products/${productId}/stock`, { quantity, variant });
            return true;
        } catch (error) {
            this.handleError(error, 'Error updating product stock');
            return false;
        }
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            const response = await this.instance.post('/auth/change-password', { currentPassword, newPassword });
            return response.data.success;
        } catch (error) {
            this.handleError(error, 'Error changing password');
            return false;
        }
    }

    async fetchAddresses(): Promise<Address[]> {
        try {
            const response = await this.instance.get('/user/addresses');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            this.handleError(error, 'Error fetching addresses');
            return [];
        }
    }

    async updateUserInfo(userInfo: Partial<User>): Promise<User | null> {
        try {
            const response = await this.instance.put('/user/profile', userInfo);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error updating user info');
            return null;
        }
    }

    async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
        try {
            const response = await this.instance.post('/auth/login', { email, password });
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            return { user, token };
        } catch (error) {
            this.handleError(error, 'Error during login');
            return null;
        }
    }

    async register(userData: { name: string; email: string; password: string }): Promise<User | null> {
        try {
            const response = await this.instance.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error during registration');
            return null;
        }
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }

    async fetchUserProfile(): Promise<User | null> {
        try {
            const response = await this.instance.get('/user/profile');
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error fetching user profile');
            return null;
        }
    }

    async addToCart(productId: string, quantity: number): Promise<boolean> {
        try {
            await this.instance.post('/cart/add', { productId, quantity });
            return true;
        } catch (error) {
            this.handleError(error, 'Error adding product to cart');
            return false;
        }
    }

    async removeFromCart(productId: string): Promise<boolean> {
        try {
            await this.instance.delete(`/cart/remove/${productId}`);
            return true;
        } catch (error) {
            this.handleError(error, 'Error removing product from cart');
            return false;
        }
    }

    async fetchCart(): Promise<{ items: Array<{ product: Product; quantity: number }>; total: number } | null> {
        try {
            const response = await this.instance.get('/cart');
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error fetching cart');
            return null;
        }
    }

    async createOrder(orderData: { addressId: string; paymentMethod: string }): Promise<Order | null> {
        try {
            const response = await this.instance.post('/orders', orderData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error creating order');
            return null;
        }
    }

    async addAddress(addressData: Omit<Address, 'id'>): Promise<Address | null> {
        try {
            const response = await this.instance.post('/user/addresses', addressData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error adding address');
            return null;
        }
    }

    async updateAddress(id: string, addressData: Partial<Address>): Promise<Address | null> {
        try {
            const response = await this.instance.put(`/user/addresses/${id}`, addressData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error updating address');
            return null;
        }
    }

    async deleteAddress(id: string): Promise<boolean> {
        try {
            await this.instance.delete(`/user/addresses/${id}`);
            return true;
        } catch (error) {
            this.handleError(error, 'Error deleting address');
            return false;
        }
    }

    async searchProducts(query: string): Promise<Product[]> {
        try {
            const response = await this.instance.get('/products/search', { params: { q: query } });
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error searching products');
            return [];
        }
    }

    async addReview(productId: string, reviewData: { rating: number; comment: string }): Promise<boolean> {
        try {
            await this.instance.post(`/products/${productId}/reviews`, reviewData);
            return true;
        } catch (error) {
            this.handleError(error, 'Error adding review');
            return false;
        }
    }

    async fetchProductReviews(productId: string): Promise<{ id: number; rating: number; comment: string; userName: string; date: string }[]> {
        try {
            const response = await this.instance.get(`/products/${productId}/reviews`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error fetching product reviews');
            return [];
        }
    }

    async fetchCategories(): Promise<Category[]> {
        console.log('Attempting to fetch categories');
        try {
            // Try fetching from /categories first
            console.log('Trying to fetch from /categories endpoint');
            const response = await this.instance.get('/categories');
            console.log('Categories fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching from /categories:', error);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // If /categories is not found, try fetching from /products
                console.log('Categories endpoint not found, attempting to fetch from products');
                try {
                    const productsResponse = await this.instance.get('/products');
                    const products: Product[] = productsResponse.data.data;

                    // Extract unique categories from products
                    const categoriesSet = new Set(products.map(p => p.category).filter(c => c !== null && c !== undefined));
                    const categories: Category[] = Array.from(categoriesSet).map(categoryName => ({ id: categoryName, name: categoryName }));

                    console.log('Categories extracted from products:', categories);
                    return categories;
                } catch (productsError) {
                    console.error('Error fetching products for category extraction:', productsError);
                    throw productsError;
                }
            }
            console.error('Unhandled error in fetchCategories:', error);
            throw error;
        }
    }

    async getCategoryById(id: number): Promise<Category | null> {
        try {
            const response = await this.instance.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, `Error fetching category with ID ${id}`);
            return null;
        }
    }

    async createCategory(name: string): Promise<Category | null> {
        try {
            const response = await this.instance.post('/categories', { name });
            return response.data;
        } catch (error) {
            this.handleError(error, 'Error creating category');
            return null;
        }
    }

    async updateCategory(id: number, name: string): Promise<Category | null> {
        try {
            const response = await this.instance.put(`/categories/${id}`, { name });
            return response.data;
        } catch (error) {
            this.handleError(error, `Error updating category with ID ${id}`);
            return null;
        }
    }

    async deleteCategory(id: number): Promise<boolean> {
        try {
            await this.instance.delete(`/categories/${id}`);
            return true;
        } catch (error) {
            this.handleError(error, `Error deleting category with ID ${id}`);
            return false;
        }
    }

    async uploadImages(files: (File | Blob)[]): Promise<string[]> {
        const formData = new FormData();
        files.forEach((file, index) => {
            const fileName = file instanceof File ? file.name : `image${index}.jpg`;
            formData.append('images', file, fileName);
        });

        try {
            const response = await this.instance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response.data);

            if (response.data && response.data.urls && Array.isArray(response.data.urls)) {
                return response.data.urls;
            } else {
                console.error('Unexpected response format:', response.data);
                throw new Error('Unexpected response format from server');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    }

}

export const api = new Api();

// Export individual methods for backwards compatibility
export const fetchProducts = api.fetchProducts.bind(api);
export const getProductById = api.getProductById.bind(api);
export const createProduct = api.createProduct.bind(api);
export const updateProduct = api.updateProduct.bind(api);
export const deleteProduct = api.deleteProduct.bind(api);
export const fetchOrders = api.fetchOrders.bind(api);
export const getOrderById = api.getOrderById.bind(api);
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
export const getCategoryById = api.getCategoryById.bind(api);
export const createCategory = api.createCategory.bind(api);
export const updateCategory = api.updateCategory.bind(api);
export const deleteCategory = api.deleteCategory.bind(api);
export const uploadImages = api.uploadImages.bind(api);

export const getImagePath = (imagePath: string): string => {
    if (!imagePath || imagePath.length === 0) {
        return '/placeholder.png';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    return imagePath.startsWith('/uploads') || imagePath === '/placeholder.png'
        ? imagePath
        : `/uploads/${imagePath}`;
};

