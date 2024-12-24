import { Product } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    averageOrderValue: number;
    conversionRate: number;
}

export interface Order {
    id: number;
    customer: string;
    total: number;
    status: string;
    date: string;
}

export interface SalesData {
    name: string;
    sales: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/admin/stats`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques du dashboard');
    }
    return response.json();
};

export const fetchRecentOrders = async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/admin/recent-orders`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes récentes');
    }
    return response.json();
};

export const fetchTopProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/admin/top-products`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits les plus vendus');
    }
    return response.json();
};

export const fetchWeeklySales = async (): Promise<SalesData[]> => {
    const response = await fetch(`${API_URL}/admin/weekly-sales`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ventes hebdomadaires');
    }
    return response.json();
};

export const fetchProducts = async (params: Record<string, string>): Promise<{ products: Product[], total: number }> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/products?${queryString}`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
    }
    return response.json();
};

export const getProductById = async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit');
    }
    return response.json();
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la création du produit');
    }
    return response.json();
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du produit');
    }
    return response.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression du produit');
    }
};

export const fetchBrands = async (): Promise<string[]> => {
    const { products } = await fetchProducts({});
    const brands = [...new Set(products.map(product => product.brand))];
    return brands;
};

export const fetchCategories = async (): Promise<string[]> => {
    const { products } = await fetchProducts({});
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
};

export const fetchTags = async (): Promise<string[]> => {
    const { products } = await fetchProducts({});
    const tags = [...new Set(products.flatMap(product => product.tags))];
    return tags;
};

