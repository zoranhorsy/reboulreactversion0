import { v4 as uuidv4 } from 'uuid';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    images: string[];  // Le premier élément est considéré comme l'image principale
    variants: { size: string; color: string; stock: number }[];
    tags: string[];
    reviews: { id: number; rating: number; comment: string; userName: string; date: string }[];
    questions: { id: number; question: string; answer?: string }[];
    faqs: { question: string; answer: string }[];
    sizeChart: { size: string; chest: number; waist: number; hips: number }[];
}

// Fonction pour sauvegarder les produits dans localStorage
const saveProductsToLocalStorage = (products: Product[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('products', JSON.stringify(products));
    }
};

// Fonction pour récupérer les produits depuis localStorage
const getProductsFromLocalStorage = (): Product[] => {
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('products');
        console.log('Stored products from localStorage:', storedProducts);
        if (storedProducts) {
            const parsedProducts = JSON.parse(storedProducts);
            console.log('Parsed products:', parsedProducts);
            return parsedProducts;
        }
    }
    console.log('No products found in localStorage or not in browser environment');
    return [];
};

let products: Product[] = [];

if (typeof window !== 'undefined') {
    products = getProductsFromLocalStorage();
    console.log('Initialized products:', products);
}


export async function fetchProducts(params: Record<string, string>): Promise<{ products: Product[], total: number }> {
    console.log("Fetching products with params:", params);
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredProducts = getProductsFromLocalStorage();

    // Appliquer les filtres
    if (params.brand && params.brand !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.brand === params.brand);
    }
    if (params.categories) {
        const categories = params.categories.split(',');
        filteredProducts = filteredProducts.filter(p => categories.includes(p.category));
    }
    if (params.tags) {
        const tags = params.tags.split(',');
        filteredProducts = filteredProducts.filter(p => p.tags.some(tag => tags.includes(tag)));
    }
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
    }
    if (params.minPrice || params.maxPrice) {
        const minPrice = params.minPrice ? parseFloat(params.minPrice) : 0;
        const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : Infinity;
        filteredProducts = filteredProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }
    if (params.color && params.color !== 'all') {
        filteredProducts = filteredProducts.filter(p =>
            p.variants.some(v => v.color.toLowerCase() === params.color.toLowerCase())
        );
    }

    // Appliquer le tri
    if (params.sortBy === 'price') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
        products: paginatedProducts,
        total: filteredProducts.length
    };
}

export async function fetchFeaturedProducts(): Promise<{ products: Product[], total: number }> {
    console.log("Fetching featured products");

    const params: Record<string, string> = {
        limit: '4',
        // You might want to add a 'featured' field to your Product interface and filter by it
        // featured: 'true'
    };

    return await fetchProducts(params);
}

export async function fetchCategories(): Promise<string[]> {
    console.log("Fetching categories");
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const categories = Array.from(new Set(products.map(p => p.category)));
    return categories;
}

export async function fetchBrands(): Promise<string[]> {
    console.log("Fetching brands");
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const brands = Array.from(new Set(products.map(p => p.brand)));
    return brands;
}

export async function fetchTags(): Promise<string[]> {
    console.log("Fetching tags");
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const tags = Array.from(new Set(products.flatMap(p => p.tags)));
    return tags;
}

export async function getProductById(id: string): Promise<Product | undefined> {
    console.log(`Searching for product with ID: ${id}`);
    const storedProducts = getProductsFromLocalStorage();
    console.log(`Products in localStorage:`, storedProducts.map(p => ({ id: p.id, name: p.name })));

    const product = storedProducts.find(product =>
        product.id === id || product.id === parseInt(id, 10).toString()
    );

    if (product) {
        console.log(`Product found:`, product);
        return product;
    } else {
        console.log(`No product found with ID: ${id}`);
        return undefined;
    }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = { ...product, id: uuidv4() };
    products.push(newProduct);
    saveProductsToLocalStorage(products);
    return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        saveProductsToLocalStorage(products);
        return products[index];
    }
    return undefined;
}

export async function deleteProduct(id: string): Promise<boolean> {
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    saveProductsToLocalStorage(products);
    return products.length < initialLength;
}

