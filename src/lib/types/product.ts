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
  variants: { size: string; color: string; stock: number }[]
  tags: string[]
  reviews: { id: number; rating: number; comment: string; userName: string; date: string }[]
  questions: { id: number; question: string; answer?: string }[]
  faqs: { question: string; answer: string }[]
  size_chart: { size: string; chest: number; waist: number; hips: number }[]
  store_type: "adult" | "kids" | "sneakers"
  featured: boolean
  colors: string[]
  created_at?: string
  updated_at?: string
}

export interface Variant {
  color: string
  size: string
  stock: number
}

export interface Review {
  id: number
  rating: number
  comment: string
  userName: string
  date: string
}

export interface Question {
  id: number
  question: string
  answer?: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface SizeChart {
  size: string
  chest: number
  waist: number
  hips: number
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
}

export interface ReturnRequest {
  orderId: string
  reason: string
}

export interface Address {
  id?: string
  street: string
  city: string
  postal_code: string
  country: string
} 