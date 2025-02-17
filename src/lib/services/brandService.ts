import { type AxiosInstance } from 'axios'
import { type Brand } from '../types/brand'

export class BrandService {
  constructor(private readonly instance: AxiosInstance) {}

  async fetchBrands(): Promise<Brand[]> {
    try {
      const response = await this.instance.get("/brands")
      return response.data
    } catch (error) {
      console.error("Error fetching brands:", error)
      return []
    }
  }

  async createBrand(name: string): Promise<Brand> {
    try {
      const response = await this.instance.post("/brands", { name })
      return response.data
    } catch (error) {
      console.error('Error creating brand:', error)
      throw error
    }
  }

  async updateBrand(id: number, name: string): Promise<Brand> {
    try {
      const response = await this.instance.put(`/brands/${id}`, { name })
      return response.data
    } catch (error) {
      console.error('Error updating brand:', error)
      throw error
    }
  }

  async deleteBrand(id: number): Promise<boolean> {
    try {
      await this.instance.delete(`/brands/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting brand:', error)
      return false
    }
  }
} 