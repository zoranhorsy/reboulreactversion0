import { type AxiosInstance } from 'axios'
import { type Order } from '../types/order'

export class OrderService {
  constructor(private instance: AxiosInstance) {}

  async fetchRecentOrders(): Promise<Order[]> {
    try {
      const response = await this.instance.get('/orders/recent')
      return response.data
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      throw error
    }
  }

  async fetchOrders(): Promise<{
    data: Order[]
    pagination: { totalItems: number; totalPages: number; currentPage: number }
  }> {
    try {
      const response = await this.instance.get('/orders')
      return response.data
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.instance.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const response = await this.instance.put(`/orders/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  async createOrder(orderData: { addressId: string; paymentMethod: string }): Promise<Order> {
    try {
      const response = await this.instance.post('/orders', orderData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await this.instance.delete(`/orders/${id}`)
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }
} 