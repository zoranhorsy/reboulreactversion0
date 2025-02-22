import { type Product } from './product'

export interface CartItemVariant {
  size: string
  color: string
  colorLabel: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variant: CartItemVariant
}

export interface Cart {
  items: CartItem[]
  total: number
  count: number
} 