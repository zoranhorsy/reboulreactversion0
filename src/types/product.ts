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
    store_type?: 'adult' | 'kids' | 'sneakers';
}

export interface Category {
    id: number;
    name: string;
}

