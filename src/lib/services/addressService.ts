import { type AxiosInstance } from 'axios'
import { type Address } from '../types/address'

export class AddressService {
  constructor(private readonly instance: AxiosInstance) {}

  async fetchAddresses(): Promise<Address[]> {
    try {
      const response = await this.instance.get('/addresses')
      return response.data
    } catch (error) {
      console.error('Error fetching addresses:', error)
      throw error
    }
  }

  async addAddress(address: Address): Promise<Address> {
    try {
      const response = await this.instance.post('/addresses', address)
      return response.data
    } catch (error) {
      console.error('Error adding address:', error)
      throw error
    }
  }

  async updateAddress(id: string, address: Address): Promise<Address> {
    try {
      const response = await this.instance.put(`/addresses/${id}`, address)
      return response.data
    } catch (error) {
      console.error('Error updating address:', error)
      throw error
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      await this.instance.delete(`/addresses/${id}`)
    } catch (error) {
      console.error('Error deleting address:', error)
      throw error
    }
  }
} 