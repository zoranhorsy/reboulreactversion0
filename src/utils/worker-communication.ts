/**
 * Utilitaires pour optimiser la communication entre le thread principal et les Web Workers
 */

/**
 * Types de données qui peuvent être utilisés comme Transferable
 */
export type TransferableData =
  | ArrayBuffer
  | MessagePort
  | ImageBitmap
  | OffscreenCanvas
  | ReadableStream
  | WritableStream
  | TransformStream;

/**
 * Vérifie si un objet est un ArrayBuffer
 */
export function isArrayBuffer(obj: any): obj is ArrayBuffer {
  return obj instanceof ArrayBuffer;
}

/**
 * Extrait tous les objets transférables d'un objet complexe
 * @param data Les données à analyser
 * @returns Un tableau d'objets transférables
 */
export function extractTransferables(data: any): TransferableData[] {
  const transferables: TransferableData[] = [];

  function scan(obj: any) {
    // Si null ou undefined, ignorer
    if (obj == null) {
      return;
    }

    // Si c'est un ArrayBuffer, l'ajouter aux transferables
    if (isArrayBuffer(obj)) {
      transferables.push(obj);
      return;
    }

    // Si c'est un TypedArray, extraire son buffer
    if (
      obj instanceof Int8Array ||
      obj instanceof Uint8Array ||
      obj instanceof Uint8ClampedArray ||
      obj instanceof Int16Array ||
      obj instanceof Uint16Array ||
      obj instanceof Int32Array ||
      obj instanceof Uint32Array ||
      obj instanceof Float32Array ||
      obj instanceof Float64Array
    ) {
      if (obj.buffer instanceof ArrayBuffer) {
        transferables.push(obj.buffer);
      }
      return;
    }

    // Si c'est un autre type de Transferable, l'ajouter
    if (
      obj instanceof ImageBitmap ||
      obj instanceof MessagePort ||
      obj instanceof OffscreenCanvas ||
      obj instanceof ReadableStream ||
      obj instanceof WritableStream ||
      obj instanceof TransformStream
    ) {
      transferables.push(obj);
      return;
    }

    // Pour les objets et tableaux, parcourir récursivement
    if (typeof obj === "object") {
      for (const key in obj) {
        scan(obj[key]);
      }
    }
  }

  scan(data);
  return transferables;
}

/**
 * Envoie un message au worker avec transfert optimisé des données transférables
 * @param worker Le worker auquel envoyer le message
 * @param message Le message à envoyer
 */
export function postMessageWithTransfer(worker: Worker, message: any): void {
  const transferables = extractTransferables(message);
  worker.postMessage(message, transferables);
}

/**
 * Crée un buffer partagé entre le thread principal et le worker
 * @param size Taille du buffer en octets
 * @returns SharedArrayBuffer
 */
export function createSharedBuffer(size: number): SharedArrayBuffer {
  return new SharedArrayBuffer(size);
}

/**
 * Mesure la taille approximative d'un objet JavaScript
 * @param object L'objet à mesurer
 * @returns Taille approximative en octets
 */
export function estimateObjectSize(object: any): number {
  const objectList = new Set();
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (value === null || value === undefined || objectList.has(value)) {
      continue;
    }

    // Ajout à l'ensemble des objets déjà comptés
    if (typeof value === "object") {
      objectList.add(value);
    }

    // Estimation de la taille selon le type
    switch (typeof value) {
      case "boolean":
        bytes += 4;
        break;
      case "number":
        bytes += 8;
        break;
      case "string":
        bytes += value.length * 2;
        break;
      case "object":
        if (Array.isArray(value)) {
          // Pour les tableaux, ajouter chaque élément à la pile
          for (const item of value) {
            stack.push(item);
          }
          bytes += 32; // Frais généraux approximatifs du tableau
        } else if (value instanceof Date) {
          bytes += 8;
        } else if (value instanceof Map || value instanceof Set) {
          bytes += 32; // Frais généraux
          // Ajouter les entrées à la pile
          for (const entry of value) {
            stack.push(entry);
          }
        } else if (value instanceof ArrayBuffer) {
          bytes += value.byteLength;
        } else if (ArrayBuffer.isView(value)) {
          bytes += value.byteLength;
        } else {
          // Pour les objets ordinaires
          bytes += 32; // Frais généraux
          for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
              bytes += key.length * 2; // Taille de la clé
              stack.push(value[key]); // Évaluer la valeur
            }
          }
        }
        break;
      default:
        bytes += 8; // Par défaut
    }
  }

  return bytes;
}

/**
 * Détermine si un objet est trop volumineux pour être envoyé directement
 * et suggère une stratégie de fragmentation si nécessaire
 * @param data Les données à analyser
 * @param threshold Seuil en octets (par défaut 1Mo)
 * @returns Un objet contenant l'indication si fragmentation nécessaire et stratégie proposée
 */
export function shouldFragmentData(
  data: any,
  threshold: number = 1024 * 1024,
): {
  shouldFragment: boolean;
  estimatedSize: number;
  strategy: "direct" | "chunk" | "shared" | "compress";
} {
  const size = estimateObjectSize(data);

  let strategy: "direct" | "chunk" | "shared" | "compress" = "direct";

  if (size > threshold) {
    if (Array.isArray(data)) {
      strategy = "chunk";
    } else if (typeof data === "string" || data instanceof ArrayBuffer) {
      strategy = "compress";
    } else {
      strategy = "shared";
    }
  }

  return {
    shouldFragment: size > threshold,
    estimatedSize: size,
    strategy,
  };
}

/**
 * Divise un tableau en morceaux de taille spécifiée
 * @param array Le tableau à fragmenter
 * @param chunkSize Taille de chaque fragment
 * @returns Un tableau de fragments
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Cache pour stocker les résultats des opérations des workers
 */
type CacheEntry = {
  result: any;
  timestamp: number;
  ttl: number;
};

class WorkerResultCache {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Génère une clé de cache à partir d'un message
   */
  private generateKey(message: any): string {
    return JSON.stringify(message);
  }

  /**
   * Met en cache le résultat d'une opération
   * @param message Le message original
   * @param result Le résultat à mettre en cache
   * @param ttl Durée de vie en millisecondes (par défaut 5 minutes)
   */
  set(message: any, result: any, ttl: number = 5 * 60 * 1000): void {
    const key = this.generateKey(message);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Récupère un résultat du cache
   * @param message Le message original
   * @returns Le résultat mis en cache ou undefined si absent ou expiré
   */
  get(message: any): any | undefined {
    const key = this.generateKey(message);
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Vérifier si l'entrée est expirée
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.result;
  }

  /**
   * Vérifie si un message existe dans le cache et est valide
   */
  has(message: any): boolean {
    const key = this.generateKey(message);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Vérifier si l'entrée est expirée
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Exporter une instance unique du cache
export const workerResultCache = new WorkerResultCache();

// Nettoyer le cache périodiquement toutes les 10 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      workerResultCache.cleanup();
    },
    10 * 60 * 1000,
  );
}
