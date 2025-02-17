export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  avatarUrl?: string
  address?: string
}

export interface UserInfo {
  id: number
  name: string
  email: string
}

export interface Address {
  street: string
  city: string
  postal_code: string
  country: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
} 