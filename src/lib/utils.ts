import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction debounce pour retarder l'exécution d'une fonction
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Fonction throttle pour limiter la fréquence d'exécution d'une fonction
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T {
  let lastCall = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

// Fonction pour optimiser les performances avec requestAnimationFrame
export function rafThrottle<T extends (...args: any[]) => void>(fn: T): T {
  let isRunning = false;

  return ((...args: Parameters<T>) => {
    if (isRunning) return;

    isRunning = true;
    requestAnimationFrame(() => {
      fn(...args);
      isRunning = false;
    });
  }) as T;
}

// Fonction pour convertir les URLs d'images vers Cloudinary
export function convertToCloudinaryUrl(url: string): string {
  if (!url) return url;

  // Si c'est déjà une URL Cloudinary, la retourner telle quelle
  if (url.includes("cloudinary.com")) {
    return url;
  }

  // Si c'est une URL relative ou locale, la retourner telle quelle
  if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
    return url;
  }

  // Si c'est une URL externe (comme picsum), la retourner telle quelle
  if (url.startsWith("http")) {
    return url;
  }

  // Par défaut, retourner l'URL telle quelle
  return url;
}

// Fonction utilitaire pour formater les prix
export function formatPrice(price: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(price);
}
