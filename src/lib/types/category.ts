export interface Category {
  id: number
  name: string
  description: string
  slug: string
  parent_id?: number
  image_url?: string
  count?: number
  children?: Category[]
} 