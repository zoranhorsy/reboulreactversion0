/**
 * Utilitaires optimisés pour remplacer les fonctions courantes de Lodash
 * 
 * Ces fonctions sont des alternatives légères aux fonctions de Lodash
 * pour réduire la taille du bundle JavaScript.
 */

/**
 * Version optimisée de lodash/debounce
 * Limite le taux d'exécution d'une fonction en la retardant
 * 
 * @param func La fonction à débouncer
 * @param wait Délai d'attente en millisecondes
 * @returns Une fonction debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Version optimisée de lodash/throttle
 * Limite le nombre d'appels à une fonction dans un intervalle de temps donné
 * 
 * @param func La fonction à throttler
 * @param limit Délai d'attente en millisecondes
 * @returns Une fonction throttled
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Version optimisée de lodash/cloneDeep
 * Clone profondément un objet
 * 
 * @param obj L'objet à cloner
 * @returns Une copie profonde de l'objet
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Utiliser structuredClone si disponible (navigateurs modernes)
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  
  // Fallback pour les navigateurs plus anciens
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Version optimisée de lodash/get
 * Récupère la valeur à un chemin d'un objet
 * 
 * @param obj L'objet source
 * @param path Le chemin à la propriété
 * @param defaultValue Valeur par défaut si le chemin n'existe pas
 * @returns La valeur au chemin spécifié ou la valeur par défaut
 */
export function get<T>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * Version optimisée de lodash/omit
 * Crée un objet composé des propriétés omises
 * 
 * @param obj L'objet source
 * @param keys Les clés à omettre
 * @returns Un nouvel objet sans les clés spécifiées
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Version optimisée de lodash/pick
 * Crée un objet composé des propriétés sélectionnées
 * 
 * @param obj L'objet source
 * @param keys Les clés à sélectionner
 * @returns Un nouvel objet avec seulement les clés spécifiées
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
}

/**
 * Version optimisée de lodash/chunk
 * Divise un tableau en groupes de taille spécifiée
 * 
 * @param array Le tableau à diviser
 * @param size La taille de chaque groupe
 * @returns Un tableau de tableaux divisés
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Version optimisée de lodash/uniq
 * Crée un tableau avec des valeurs uniques
 * 
 * @param array Le tableau à traiter
 * @returns Un tableau avec des valeurs uniques
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Version optimisée de lodash/uniqBy
 * Crée un tableau avec des valeurs uniques par une fonction iteratee
 * 
 * @param array Le tableau à traiter
 * @param iteratee La fonction à appliquer à chaque élément
 * @returns Un tableau avec des valeurs uniques
 */
export function uniqBy<T>(
  array: T[],
  iteratee: (item: T) => any
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const key = iteratee(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
} 