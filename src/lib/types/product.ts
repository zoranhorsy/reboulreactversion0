import { ProductImage } from "./product-image"

export interface Variant {
  id: number
  size: string
  color: string
  stock: number
  price?: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id: number
  category: string
  brand_id: number
  brand: string
  image_url: string
  images: (string | File | Blob | ProductImage)[]
  image: string
  variants: Variant[]
  tags: string[]
  details: string[]
  reviews: Review[]
  questions: Question[]
  faqs: FAQ[]
  size_chart: SizeChart[]
  store_type: "adult" | "kids" | "sneakers" | "cpcompany" | "deleted"
  featured: boolean
  created_at: string
  updated_at?: string
  active?: boolean
  sku?: string | null
  weight?: number | null
  dimensions?: string | null
  material?: string | null
  new?: boolean
  rating?: number
  reviews_count?: number
  store_reference?: string | null
  old_price?: number
  _actiontype?: string
  deleted?: boolean
  has_variants?: boolean
  is_corner_product?: boolean
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