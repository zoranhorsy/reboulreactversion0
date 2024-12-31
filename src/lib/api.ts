import { v4 as uuidv4 } from 'uuid';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
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
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export interface UserInfo {
    name: string;
    email: string;
    address: string;
    avatarUrl?: string;
}

export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant: {
        size: string;
        color: string;
    };
}

export interface Order {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
}

let cachedProducts: Product[] = [];
let cachedOrders: Order[] = [];

const saveProductsToLocalStorage = (products: Product[]) => {
    if (typeof window !== 'undefined') {
        console.log('Saving products to localStorage:', products);
        localStorage.setItem('products', JSON.stringify(products));
    }
};

const getProductsFromLocalStorage = (): Product[] => {
    if (typeof window !== 'undefined') {
        const storedProducts = localStorage.getItem('products');
        console.log('Stored products from localStorage:', storedProducts);
        if (storedProducts) {
            try {
                const parsedProducts = JSON.parse(storedProducts);
                console.log('Parsed products:', parsedProducts);
                return Array.isArray(parsedProducts) ? parsedProducts : [];
            } catch (error) {
                console.error('Error parsing stored products:', error);
            }
        }
    }
    console.log('No products found in localStorage or not in browser environment');
    return [];
};

const getImagePath = (imagePath: string): string => {
    if (!imagePath || imagePath.length === 0) {
        return '/placeholder.png';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    // Supprimez les doubles slashes et assurez-vous qu'il n'y a qu'un seul slash au début
    return imagePath.startsWith('/uploads') || imagePath === '/placeholder.png' ? imagePath : `/uploads/${imagePath}`;
};

const initializeProducts = (): Product[] => {
    return [
        {
            id: uuidv4(),
            name: "T-shirt basique adulte",
            description: "Un t-shirt confortable pour tous les jours",
            price: 19.99,
            category: "Vêtements",
            brand: "Reboul",
            images: ["/uploads/tshirt-blanc.jpg", "/uploads/tshirt-blanc-dos.jpg"],
            variants: [
                { size: "S", color: "Blanc", stock: 10 },
                { size: "M", color: "Blanc", stock: 15 },
                { size: "L", color: "Blanc", stock: 20 },
            ],
            tags: ["basique", "confort"],
            reviews: [],
            questions: [],
            faqs: [],
            sizeChart: [],
            storeType: 'adult',
            featured: true,
            colors: ["Blanc"]
        },
        {
            id: uuidv4(),
            name: "Jean slim adulte",
            description: "Un jean slim confortable et élégant",
            price: 49.99,
            category: "Vêtements",
            brand: "Reboul",
            images: ["/uploads/jean-slim-bleu.jpg"],
            variants: [
                { size: "38", color: "Bleu", stock: 8 },
                { size: "40", color: "Bleu", stock: 12 },
                { size: "42", color: "Bleu", stock: 10 },
            ],
            tags: ["jean", "slim", "élégant"],
            reviews: [],
            questions: [],
            faqs: [],
            sizeChart: [],
            storeType: 'adult',
            featured: true,
            colors: ["Bleu"]
        },
        {
            id: uuidv4(),
            name: "T-shirt enfant fun",
            description: "Un t-shirt coloré et amusant pour les enfants",
            price: 14.99,
            category: "Vêtements",
            brand: "Les Minots de Reboul",
            images: ["/uploads/tshirt-enfant-multicolore.jpg"],
            variants: [
                { size: "4 ans", color: "Multicolore", stock: 10 },
                { size: "6 ans", color: "Multicolore", stock: 15 },
                { size: "8 ans", color: "Multicolore", stock: 20 },
            ],
            tags: ["fun", "coloré"],
            reviews: [],
            questions: [],
            faqs: [],
            sizeChart: [],
            storeType: 'kids',
            featured: true,
            colors: ["Multicolore"]
        }
    ];
};

const validateProduct = (product: any): product is Product => {
    const requiredFields = ['name', 'price', 'description', 'category', 'brand', 'storeType'];
    const missingFields = requiredFields.filter(field => !product[field]);

    if (missingFields.length > 0) {
        console.warn(`Product is missing required fields: ${missingFields.join(', ')}`, product);

        missingFields.forEach(field => {
            switch (field) {
                case 'name':
                case 'description':
                case 'category':
                case 'brand':
                    product[field] = 'Uncategorized';
                    break;
                case 'price':
                    product[field] = 0;
                    break;
                case 'storeType':
                    product[field] = 'adult';
                    break;
            }
        });
    }

    product.id = product.id || uuidv4();
    product.images = Array.isArray(product.images)
        ? product.images.map(getImagePath).filter(img => img !== '/placeholder.png')
        : [];

    if (product.images.length === 0) {
        product.images = ['/placeholder.png'];
    }
    product.variants = Array.isArray(product.variants) ? product.variants : [];
    product.tags = Array.isArray(product.tags) ? product.tags.filter(tag => typeof tag === 'string') : [];
    product.reviews = Array.isArray(product.reviews) ? product.reviews : [];
    product.questions = Array.isArray(product.questions) ? product.questions : [];
    product.faqs = Array.isArray(product.faqs) ? product.faqs : [];
    product.sizeChart = Array.isArray(product.sizeChart) ? product.sizeChart : [];
    product.featured = Boolean(product.featured);
    product.colors = Array.isArray(product.colors) ? product.colors : [];

    return true;
};

export async function fetchProducts(params: Record<string, string>): Promise<{ products: Product[], total: number }> {
    console.log("API: Fetching products with params:", params);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (cachedProducts.length === 0) {
        cachedProducts = getProductsFromLocalStorage();
        if (cachedProducts.length === 0) {
            console.log("API: No products found, initializing products");
            cachedProducts = initializeProducts();
            saveProductsToLocalStorage(cachedProducts);
        }
    }

    console.log("Contenu initial de cachedProducts:", JSON.stringify(cachedProducts, null, 2));

    cachedProducts = cachedProducts.filter(product => {
        if (!validateProduct(product)) {
            console.error(`Invalid product detected:`, product);
            return false;
        }
        return true;
    });

    console.log("cachedProducts après nettoyage:", JSON.stringify(cachedProducts, null, 2));

    let filteredProducts = [...cachedProducts];

    if (params.storeType) {
        filteredProducts = filteredProducts.filter(p => p.storeType === params.storeType);
        console.log(`Products after filtering by storeType '${params.storeType}':`, filteredProducts);
    }

    if (params.categories && params.categories !== '') {
        const categories = params.categories.split(',');
        filteredProducts = filteredProducts.filter(p => categories.includes(p.category));
        console.log(`API: Filtered by categories ${params.categories}:`, filteredProducts);
    }

    if (params.featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured === true);
        console.log(`API: Filtered featured products:`, filteredProducts);
    }

    if (params.sort) {
        switch (params.sort) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    console.log("API: Final filtered and paginated products:", paginatedProducts);

    return {
        products: paginatedProducts,
        total: filteredProducts.length
    };
}

export async function getProductById(id: string): Promise<Product | null> {
    console.log("Fetching product with id:", id);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (cachedProducts.length === 0) {
        cachedProducts = getProductsFromLocalStorage();
        if (cachedProducts.length === 0) {
            cachedProducts = initializeProducts();
        }
    }

    const product = cachedProducts.find(p => p.id === id);

    if (product && validateProduct(product)) {
        console.log("Fetched product:", product);
        return product;
    } else {
        console.log("Product not found or invalid");
        return null;
    }
}

export async function createProduct(newProduct: Omit<Product, 'id'>): Promise<Product> {
    console.log("API: Creating new product:", newProduct);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (cachedProducts.length === 0) {
        cachedProducts = getProductsFromLocalStorage();
        if (cachedProducts.length === 0) {
            cachedProducts = initializeProducts();
        }
    }

    const productWithId: Product = {
        id: uuidv4(),
        ...newProduct,
    };

    if (validateProduct(productWithId)) {
        cachedProducts.push(productWithId);
        saveProductsToLocalStorage(cachedProducts);
        console.log("API: New product created:", productWithId);
        return productWithId;
    } else {
        console.error("Invalid product data:", productWithId);
        throw new Error("Invalid product data: failed validation");
    }
}

export async function updateProduct(id: string, updatedProduct: Partial<Product>): Promise<Product> {
    console.log("API: Updating product with id:", id, "Updated data:", updatedProduct);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (cachedProducts.length === 0) {
        cachedProducts = getProductsFromLocalStorage();
        if (cachedProducts.length === 0) {
            cachedProducts = initializeProducts();
        }
    }

    const index = cachedProducts.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error("Product not found");
    }

    const currentProduct = cachedProducts[index];
    const updatedProductFull: Product = {
        ...currentProduct,
        ...updatedProduct,
        id,
        name: (updatedProduct.name || currentProduct.name).trim(),
        description: (updatedProduct.description || currentProduct.description).trim(),
        price: Math.max(0, updatedProduct.price || currentProduct.price),
        category: (updatedProduct.category || currentProduct.category).trim(),
        brand: (updatedProduct.brand || currentProduct.brand).trim(),
        images: (updatedProduct.images || currentProduct.images || []).map(getImagePath),
        variants: updatedProduct.variants || currentProduct.variants || [],
        tags: updatedProduct.tags || currentProduct.tags || [],
        reviews: updatedProduct.reviews || currentProduct.reviews || [],
        questions: updatedProduct.questions || currentProduct.questions || [],
        faqs: updatedProduct.faqs || currentProduct.faqs || [],
        sizeChart: updatedProduct.sizeChart || currentProduct.sizeChart || [],
        storeType: updatedProduct.storeType || currentProduct.storeType || 'adult',
        featured: updatedProduct.featured !== undefined ? updatedProduct.featured : currentProduct.featured,
        colors: updatedProduct.colors || currentProduct.colors || []
    };

    if (validateProduct(updatedProductFull)) {
        cachedProducts[index] = updatedProductFull;
        saveProductsToLocalStorage(cachedProducts);
        console.log("API: Product updated:", updatedProductFull);
        return updatedProductFull;
    } else {
        console.error("Invalid product data:", updatedProductFull);
        throw new Error("Invalid product data after update");
    }
}

export async function deleteProduct(id: string): Promise<void> {
    console.log("API: Deleting product with id:", id);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (cachedProducts.length === 0) {
        cachedProducts = getProductsFromLocalStorage();
        if (cachedProducts.length === 0) {
            cachedProducts = initializeProducts();
        }
    }

    const index = cachedProducts.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error("Product not found");
    }

    cachedProducts.splice(index, 1);
    saveProductsToLocalStorage(cachedProducts);

    console.log("API: Product deleted");
}

export async function fetchOrders(): Promise<Order[]> {
    console.log("API: Fetching orders");

    if (cachedOrders.length === 0) {
        // Simuler un délai de réseau
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialiser avec des données factices si le cache est vide
        cachedOrders = [
            { id: '1', customer: 'John Doe', total: 99.99, status: 'delivered', date: new Date().toISOString(), items: [] },
            { id: '2', customer: 'Jane Smith', total: 149.99, status: 'processing', date: new Date().toISOString(), items: [] },
            { id: '3', customer: 'Bob Johnson', total: 199.99, status: 'pending', date: new Date().toISOString(), items: [] },
        ];
    }

    console.log("API: Fetched orders:", cachedOrders);
    return cachedOrders;
}

export async function createOrder(newOrder: Order): Promise<Order> {
    console.log("API: Creating new order:", newOrder);

    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    cachedOrders.unshift(newOrder);
    console.log("API: New order created:", newOrder);
    return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    console.log(`API: Updating order ${orderId} status to ${status}`);

    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    const orderIndex = cachedOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        console.log(`API: Order ${orderId} not found`);
        return null;
    }

    cachedOrders[orderIndex].status = status;
    console.log("API: Order updated:", cachedOrders[orderIndex]);
    return cachedOrders[orderIndex];
}

export async function updateProductStock(productId: string, quantity: number, variant: { size: string, color: string }): Promise<void> {
    console.log(`API: Updating stock for product ${productId}`);

    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    const product = cachedProducts.find(p => p.id === productId);
    if (!product) {
        throw new Error(`Product not found: ${productId}`);
    }

    const variantIndex = product.variants.findIndex(v => v.size === variant.size && v.color === variant.color);
    if (variantIndex === -1) {
        throw new Error(`Variant not found for product: ${productId}`);
    }

    if (product.variants[variantIndex].stock < quantity) {
        throw new Error(`Insufficient stock for product: ${productId}`);
    }

    product.variants[variantIndex].stock -= quantity;
    console.log(`Updated stock for product ${productId}, new stock: ${product.variants[variantIndex].stock}`);
}

export async function updateUserInfo(userInfo: UserInfo): Promise<UserInfo> {
    console.log("API: Updating user info:", userInfo);
    await new Promise(resolve => setTimeout(resolve, 500));
    return userInfo;
}

export interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

let cachedAddresses: Address[] = [
    {
        id: '1',
        name: 'Domicile',
        street: '123 Rue de la République',
        city: 'Marseille',
        postalCode: '13001',
        country: 'France',
        isDefault: true
    },
    {
        id: '2',
        name: 'Bureau',
        street: '45 Avenue des Champs-Élysées',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        isDefault: false
    }
];

export async function fetchAddresses(): Promise<Address[]> {
    console.log("API: Fetching addresses");
    await new Promise(resolve => setTimeout(resolve, 500));
    return cachedAddresses;
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    console.log("API: Adding new address", address);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAddress: Address = { ...address, id: Date.now().toString() };
    cachedAddresses.push(newAddress);
    return newAddress;
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address> {
    console.log("API: Updating address", id, address);
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = cachedAddresses.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Address not found");
    cachedAddresses[index] = { ...cachedAddresses[index], ...address };
    return cachedAddresses[index];
}

export async function deleteAddress(id: string): Promise<void> {
    console.log("API: Deleting address", id);
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = cachedAddresses.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Address not found");
    cachedAddresses.splice(index, 1);
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
    console.log("API: Setting default address", id);
    await new Promise(resolve => setTimeout(resolve, 500));
    cachedAddresses = cachedAddresses.map(address => ({
        ...address,
        isDefault: address.id === id
    }));
    return cachedAddresses;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean, message: string }> {
    console.log("API: Changing password");
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ici, vous feriez normalement une vérification du mot de passe actuel
    // et mettriez à jour le nouveau mot de passe dans la base de données
    if (currentPassword === "password123") {
        return { success: true, message: "Mot de passe changé avec succès" };
    } else {
        return { success: false, message: "Le mot de passe actuel est incorrect" };
    }
}

export async function logout(): Promise<void> {
    console.log("API: Logging out user");
    await new Promise(resolve => setTimeout(resolve, 500));
    // Ici, vous feriez normalement une requête à votre backend pour invalider la session
    console.log("API: User logged out successfully");
}

