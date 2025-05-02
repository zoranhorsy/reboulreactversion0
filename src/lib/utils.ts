import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { isCloudinaryUrl } from "@/config/cloudinary"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(numericPrice)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Fonction pour convertir les anciennes URLs en URLs Cloudinary
export function convertToCloudinaryUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Si c'est déjà une URL Cloudinary, on la retourne telle quelle
  if (url.includes('cloudinary.com')) {
    console.log('convertToCloudinaryUrl - URL Cloudinary détectée:', url.substring(0, 50) + '...');
    return url;
  }
  
  // Si c'est une URL relative, on la convertit en URL absolue
  if (url.startsWith('/')) {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`;
    console.log('convertToCloudinaryUrl - URL relative convertie:', fullUrl.substring(0, 50) + '...');
    return fullUrl;
  }
  
  // Si c'est un publicId Cloudinary (sans http/https)
  if (!url.startsWith('http') && (url.includes('/') || url.includes('reboul-store'))) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxen69pdo';
    const fullUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${url}`;
    console.log('convertToCloudinaryUrl - PublicId converti en URL:', fullUrl.substring(0, 50) + '...');
    return fullUrl;
  }
  
  // Si c'est une URL complète mais pas Cloudinary (par exemple une URL d'image externe)
  if (url.startsWith('http')) {
    console.log('convertToCloudinaryUrl - URL externe détectée:', url.substring(0, 50) + '...');
    return url;
  }
  
  // Sinon, on retourne l'URL telle quelle
  console.log('convertToCloudinaryUrl - URL conservée telle quelle:', url.substring(0, 50) + '...');
  return url;
}

