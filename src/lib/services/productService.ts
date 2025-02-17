import { type AxiosInstance, isAxiosError } from 'axios'
import { type Product } from '../types/product'

export class ProductService {
  constructor(private readonly instance: AxiosInstance) {}

  async fetchProducts(params: Record<string, string | number> = {}): Promise<{ products: Product[]; total: number }> {
    try {
      console.log('Fetching products with params:', params)
      console.log('API URL:', this.instance.defaults.baseURL)
      const response = await this.instance.get("/products", { params })
      console.log('Products response:', response.data)

      // Validation de la réponse
      const data = response.data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected an object')
      }

      // Vérification de la structure de la réponse
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format: data should be an array')
      }

      if (!data.pagination || typeof data.pagination.totalItems !== 'number') {
        throw new Error('Invalid response format: pagination.totalItems should be a number')
      }

      // Adaptation du format pour le front
      return {
        products: data.data,
        total: data.pagination.totalItems
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      console.log(`Fetching product with ID: ${id}`)
      const response = await this.instance.get(`/products/${id}`)
      console.log('Product response:', response.data)

      // Validation de la réponse
      const data = response.data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected a product object')
      }

      if (!data.id || typeof data.id !== 'string') {
        throw new Error('Invalid product format: missing or invalid id')
      }

      return data
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await this.instance.post('/products', productData)
      return response.data
    } catch (error) {
      console.error('Error creating product:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await this.instance.put(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      console.error('Error updating product:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.instance.delete(`/products/${id}`)
    } catch (error) {
      console.error('Error deleting product:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await this.instance.get(`/products/search`, { params: { q: query } })
      
      // Validation de la réponse
      const data = response.data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of products')
      }

      return data
    } catch (error) {
      console.error('Error searching products:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async updateProductStock(id: string, stock: number): Promise<Product> {
    try {
      const response = await this.instance.put(`/products/${id}/stock`, { stock })
      return response.data
    } catch (error) {
      console.error('Error updating product stock:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }

  async uploadImages(id: string, images: File[]): Promise<string[]> {
    try {
      const formData = new FormData()
      images.forEach(image => formData.append('images', image))
      const response = await this.instance.post(`/products/${id}/images`, formData)
      return response.data
    } catch (error) {
      console.error('Error uploading images:', error)
      if (isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      throw error
    }
  }
}