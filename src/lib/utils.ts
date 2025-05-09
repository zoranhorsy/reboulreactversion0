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

/**
 * Limite le nombre d'appels à une fonction dans un intervalle de temps donné
 * Contrairement au debounce qui attend, throttle exécute immédiatement puis bloque
 * @param func Fonction à throttle
 * @param limit Intervalle minimum entre les appels (en ms)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let lastCallArgs: Parameters<T> | null = null
  let throttled = false
  
  return function throttledFunction(...args: Parameters<T>) {
    const now = Date.now()
    
    // Mémoriser les derniers arguments reçus
    lastCallArgs = args
    
    // Si c'est le premier appel ou si l'intervalle est dépassé
    if (!lastCall || now - lastCall >= limit) {
      lastCall = now
      func(...args)
      return
    }
    
    // Si un throttle est déjà en cours, ignorer
    if (throttled) return
    
    // Programmer le prochain appel
    throttled = true
    setTimeout(() => {
      lastCall = Date.now()
      throttled = false
      
      // Utiliser les derniers arguments reçus
      if (lastCallArgs) {
        func(...lastCallArgs)
      }
    }, limit - (now - lastCall))
  }
}

/**
 * Optimise les gestionnaires d'événements en utilisant requestAnimationFrame
 * Idéal pour les événements visuels comme scroll, mousemove, resize
 * @param func Fonction à optimiser
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let requestId: number | null = null
  let lastArgs: Parameters<T> | null = null
  
  return function throttledFunction(...args: Parameters<T>) {
    // Mémoriser les arguments les plus récents
    lastArgs = args
    
    // Si une frame n'est pas déjà programmée
    if (!requestId) {
      requestId = requestAnimationFrame(() => {
        requestId = null
        // Exécuter avec les derniers arguments reçus
        if (lastArgs) {
          func(...lastArgs)
        }
      })
    }
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
  // Vérifier si l'URL est définie et non vide après suppression des espaces
  if (!url || !url.trim()) {
    return '';
  }
  
  // Nettoyer l'URL en supprimant les espaces avant et après
  const trimmedUrl = url.trim();
  
  // Si c'est déjà une URL Cloudinary, on la retourne telle quelle
  if (trimmedUrl.includes('cloudinary.com')) {
    console.log('convertToCloudinaryUrl - URL Cloudinary détectée:', trimmedUrl.substring(0, 50) + '...');
    return trimmedUrl;
  }
  
  // Si c'est une URL relative, on la convertit en URL absolue
  if (trimmedUrl.startsWith('/')) {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}${trimmedUrl}`;
    console.log('convertToCloudinaryUrl - URL relative convertie:', fullUrl.substring(0, 50) + '...');
    return fullUrl;
  }
  
  // Si c'est un publicId Cloudinary (sans http/https)
  if (!trimmedUrl.startsWith('http') && (trimmedUrl.includes('/') || trimmedUrl.includes('reboul-store'))) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxen69pdo';
    const fullUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${trimmedUrl}`;
    console.log('convertToCloudinaryUrl - PublicId converti en URL:', fullUrl.substring(0, 50) + '...');
    return fullUrl;
  }
  
  // Si c'est une URL complète mais pas Cloudinary (par exemple une URL d'image externe)
  if (trimmedUrl.startsWith('http')) {
    console.log('convertToCloudinaryUrl - URL externe détectée:', trimmedUrl.substring(0, 50) + '...');
    return trimmedUrl;
  }
  
  // Sinon, on retourne l'URL telle quelle
  console.log('convertToCloudinaryUrl - URL conservée telle quelle:', trimmedUrl.substring(0, 50) + '...');
  return trimmedUrl;
}

