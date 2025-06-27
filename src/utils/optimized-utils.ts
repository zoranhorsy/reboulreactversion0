/**
 * Utilitaires optimisés pour remplacer les fonctions Lodash
 *
 * Ces fonctions sont des implémentations natives légères des fonctions
 * Lodash les plus couramment utilisées dans l'application Reboul.
 */

/**
 * Version native de debounce de Lodash
 * Limite l'exécution d'une fonction à une fois après un délai spécifié
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Version native de throttle de Lodash
 * Limite l'exécution d'une fonction à une fois par intervalle spécifié
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 300,
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  function wrapper(this: any, ...args: Parameters<T>): void {
    if (isThrottled) {
      lastArgs = args;
      lastThis = this;
      return;
    }

    func.apply(this, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (lastArgs) {
        wrapper.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, wait);
  }

  return wrapper;
}

/**
 * Version native de cloneDeep de Lodash
 * Crée une copie profonde d'un objet
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Date, RegExp, etc.
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  const clone = {} as T;

  Object.keys(obj).forEach((key) => {
    clone[key as keyof T] = deepClone(obj[key as keyof T]);
  });

  return clone;
}

/**
 * Version native de get de Lodash
 * Accède à une propriété imbriquée d'un objet en utilisant un chemin
 */
export function get<T>(
  obj: Record<string, any>,
  path: string | string[],
  defaultValue?: T,
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : (result as T);
}

/**
 * Version native de groupBy de Lodash
 * Groupe les éléments d'un tableau selon une fonction de critère
 */
export function groupBy<T>(
  array: T[],
  iteratee: (item: T) => string | number,
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const key = iteratee(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Version native de uniq de Lodash
 * Retourne un tableau sans doublons
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Version native de uniqBy de Lodash
 * Retourne un tableau sans doublons selon une fonction de critère
 */
export function uniqBy<T>(array: T[], iteratee: (item: T) => any): T[] {
  const seen = new Map();
  return array.filter((item) => {
    const key = iteratee(item);
    if (seen.has(key)) {
      return false;
    }
    seen.set(key, true);
    return true;
  });
}

/**
 * Version native de chunk de Lodash
 * Divise un tableau en groupes de taille spécifiée
 */
export function chunk<T>(array: T[], size = 1): T[][] {
  if (size < 1) return [];

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

/**
 * Version native de omit de Lodash
 * Crée un objet sans les propriétés spécifiées
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Version native de pick de Lodash
 * Crée un objet avec uniquement les propriétés spécifiées
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Optimisation spécifique pour requestAnimationFrame
 * Throttle optimisé pour les gestionnaires d'événements visuels
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T,
): (...args: Parameters<T>) => void {
  let requestId: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;

  function rafCallback(this: any) {
    requestId = null;
    if (lastArgs) {
      callback.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  return function throttled(this: any, ...args: Parameters<T>): void {
    lastArgs = args;
    lastThis = this;

    if (requestId === null) {
      requestId = requestAnimationFrame(rafCallback);
    }
  };
}

/**
 * Version native de isEmpty de Lodash
 * Vérifie si un objet, tableau ou chaîne est vide
 */
export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Version optimisée de flatten de Lodash
 * Aplatit un tableau d'un niveau
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return ([] as T[]).concat(...array);
}

/**
 * Version optimisée de flattenDeep de Lodash
 * Aplatit un tableau récursivement
 */
export function flattenDeep<T>(array: any[]): T[] {
  return array.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, []);
}

/**
 * Memoize - mise en cache des résultats de fonction
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string,
): T & { cache: Map<string, ReturnType<T>> } {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : args[0]?.toString() || "_";

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T & { cache: typeof cache };

  memoized.cache = cache;
  return memoized;
}

const optimizedUtils = {
  debounce,
  throttle,
  deepClone,
  get,
  groupBy,
  uniq,
  uniqBy,
  chunk,
  omit,
  pick,
  rafThrottle,
  isEmpty,
  flatten,
  flattenDeep,
  memoize,
};

export default optimizedUtils;
