import { type AxiosInstance } from 'axios'
import { type User, type LoginCredentials, type RegisterData } from '../types/user'

export class AuthService {
  constructor(private instance: AxiosInstance) {}

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await this.instance.post('/auth/login', credentials)
      const { user, token } = response.data

      if (token) {
        localStorage.setItem('token', token)
      }

      return { user, token }
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await this.instance.post('/auth/register', data)
      const { user, token } = response.data

      if (token) {
        localStorage.setItem('token', token)
      }

      return { user, token }
    } catch (error) {
      console.error('Error during registration:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.instance.post('/auth/logout')
      localStorage.removeItem('token')
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  async fetchUserProfile(): Promise<User> {
    try {
      const response = await this.instance.get('/auth/profile')
      return response.data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  async updateUserInfo(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await this.instance.put(`/users/${userId}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating user info:', error)
      throw error
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.instance.post('/auth/change-password', {
        oldPassword,
        newPassword,
      })
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
} 