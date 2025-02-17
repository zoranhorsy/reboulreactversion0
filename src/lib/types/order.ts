import { type Address } from './address'
import { type UserInfo } from './user'

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

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
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

export interface ReturnRequest {
  orderId: string
  reason: string
} 