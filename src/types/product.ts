export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    category: string;
    brand: string;
    image_url: string;
    images: (string | File | Blob)[];
    image: string;
    variants: { size: string; color: string; stock: number }[];
    tags: string[];
    reviews: { id: number; rating: number; comment: string; userName: string; date: string }[];
    questions: { id: number; question: string; answer?: string }[];
    faqs: { question: string; answer: string }[];
    size_chart: { size: string; chest: number; waist: number; hips: number }[];
    store_type: "adult" | "kids" | "sneakers";
    featured: boolean;
    colors: string[];
}

export interface Category {
    id: number;
    name: string;
}

