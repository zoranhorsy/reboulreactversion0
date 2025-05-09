import { useCallback, useEffect, useRef, useState } from 'react';
import { WORKER_CONFIG } from '@/config/worker-config';
import { useWorkerToggle } from './useWorkerToggle';
import { 
  postMessageWithTransfer, 
  shouldFragmentData, 
  chunkArray,
  workerResultCache 
} from '@/utils/worker-communication';

// Types pour marquer les performances
declare global {
  interface Performance {
    mark(name: string, options?: { detail?: any }): void;
    measure(name: string, options?: { start?: string; end?: string; detail?: any }): void;
  }
}

type FilterOptions = {
  categories?: string[];
  priceRange?: { min: number; max: number };
  colors?: string[];
  sizes?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  searchTerm?: string;
  inStock?: boolean;
};

/**
 * Hook pour le filtrage et le tri des produits
 * Peut fonctionner avec ou sans Web Worker en fonction du paramètre d'URL
 * Exemple: /catalogue?disableWorkers=true - désactive les workers
 */
export function useFilterWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useWorkers = useWorkerToggle();
  
  // Référence pour conserver les écouteurs de messages en cours
  const activeListenersRef = useRef<{ [key: string]: ((e: MessageEvent) => void) }>({});
  // Map des IDs de tâches en cours
  const pendingTasksRef = useRef<Map<string, {
    resolve: (value: any) => void,
    reject: (reason: any) => void,
    timeout: NodeJS.Timeout
  }>>(new Map());

  // Fonction pour générer un ID unique de tâche
  const generateTaskId = useCallback(() => {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  useEffect(() => {
    // Initialiser le worker si nécessaire
    if (useWorkers && !workerRef.current) {
      try {
        workerRef.current = new Worker(new URL('../workers/filterWorker.ts', import.meta.url));
        
        // Gestionnaire d'erreurs du worker
        const errorHandler = (error: ErrorEvent) => {
          console.error('Erreur du worker:', error);
          setError('Erreur lors du traitement des données');
          setIsLoading(false);
        };
        
        workerRef.current.addEventListener('error', errorHandler);
        
        // Nettoyage lors du démontage
        return () => {
          // Copier les références dans des variables locales
          const worker = workerRef.current;
          const tasks = new Map(pendingTasksRef.current);
          
          // Nettoyer les timeouts
          tasks.forEach(task => {
            if (task.timeout) {
              clearTimeout(task.timeout);
            }
          });
          
          // Vider la map des tâches en attente
          pendingTasksRef.current.clear();
          
          // Terminer le worker
          if (worker) {
            worker.removeEventListener('error', errorHandler);
            worker.terminate();
            workerRef.current = null;
          }
        };
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du worker:', error);
        setError('Erreur lors de l\'initialisation du worker');
        setIsLoading(false);
        workerRef.current = null;
      }
    }
  }, [useWorkers]);

  /**
   * Implémentation native du filtrage pour utilisation sans worker
   * @param products Liste des produits à filtrer
   * @param options Options de filtrage
   * @returns Liste des produits filtrés
   */
  const filterProductsWithoutWorker = useCallback((products: any[], options: FilterOptions): any[] => {
    // Fonction locale qui implémente le même filtrage que dans le worker
    return products.filter(product => {
      // Filtre par catégorie
      if (options.categories?.length) {
        const categoryId = String(product.category_id || '');
        if (!options.categories.some(cat => cat === categoryId)) {
          return false;
        }
      }

      // Filtre par prix
      if (options.priceRange) {
        if (product.price < options.priceRange.min || product.price > options.priceRange.max) {
          return false;
        }
      }

      // Filtre par taille
      if (options.sizes?.length && product.variants) {
        const productSizes = product.variants.map((v: any) => v.size).filter(Boolean);
        if (!options.sizes.some(size => productSizes.includes(size))) {
          return false;
        }
      }

      // Filtre par couleur
      if (options.colors?.length && product.variants) {
        const productColors = product.variants
          .map((v: any) => v.color?.toLowerCase())
          .filter(Boolean);
        if (!options.colors.some(color => productColors.includes(color.toLowerCase()))) {
          return false;
        }
      }

      // Filtre par disponibilité
      if (options.inStock !== undefined) {
        // Si le produit a des variantes, vérifier si au moins une est en stock
        if (product.variants && product.variants.length > 0) {
          const hasStock = product.variants.some((v: any) => (v.stock || 0) > 0);
          if (options.inStock !== hasStock) return false;
        } else if (options.inStock !== !!product.inStock) {
          return false;
        }
      }

      // Filtre par terme de recherche
      if (options.searchTerm) {
        const searchLower = options.searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, []);

  /**
   * Implémentation native du tri pour utilisation sans worker
   * @param products Liste des produits à trier
   * @param sortBy Critère de tri
   * @param sortOrder Ordre de tri
   * @returns Liste des produits triés
   */
  const sortProductsWithoutWorker = useCallback((
    products: any[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
  ): any[] => {
    const sortFactor = sortOrder === 'asc' ? 1 : -1;

    return [...products].sort((a, b) => {
      if (sortBy === 'price') {
        return (a.price - b.price) * sortFactor;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * sortFactor;
      } else if (sortBy === 'newest') {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return (dateB - dateA); // Toujours du plus récent au plus ancien
      } else if (sortBy === 'popular') {
        const popularityA = a.popularity || 0;
        const popularityB = b.popularity || 0;
        return (popularityB - popularityA); // Toujours du plus populaire au moins populaire
      }
      return 0;
    });
  }, []);

  /**
   * Fonction privée pour traiter un fragment de données
   * @param chunk Fragment de données à traiter
   * @param filters Options de filtrage
   * @param taskId ID de la tâche
   * @returns Promesse avec les résultats du filtrage
   */
  const processFilterChunk = useCallback(async (
    chunk: any[],
    filters: FilterOptions,
    taskId: string
  ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker non initialisé'));
        return;
      }

      // Configurer le timeout
      const timeout = setTimeout(() => {
        pendingTasksRef.current.delete(taskId);
        reject(new Error('Timeout du worker'));
      }, WORKER_CONFIG.timeout);

      // Stocker la promesse et le timeout
      pendingTasksRef.current.set(taskId, {
        resolve,
        reject,
        timeout
      });

      // Envoyer les données au worker
      const transferableData = {
        taskId,
        products: chunk,
        filters
      };

      try {
        postMessageWithTransfer(workerRef.current, transferableData);
      } catch (error) {
        clearTimeout(timeout);
        pendingTasksRef.current.delete(taskId);
        reject(error);
      }
    });
  }, []);

  const filterProducts = useCallback(async (products: any[], filters: FilterOptions) => {
    // Réinitialiser l'état
    
    setError(null);
    setIsLoading(true);

    try {
      // Si les workers sont désactivés, utiliser l'implémentation native
      if (!useWorkers) {
        const filteredProducts = filterProductsWithoutWorker(products, filters);
        if (filters.sortBy) {
          const [sortField, sortOrder] = filters.sortBy.split('_');
          return sortProductsWithoutWorker(filteredProducts, sortField, sortOrder as 'asc' | 'desc');
        }
        return filteredProducts;
      }

      // Vérifier si le worker est initialisé
      if (!workerRef.current) {
        throw new Error('Worker non initialisé');
      }

      // Générer un ID unique pour cette tâche
      const taskId = generateTaskId();

      // Fragmenter les données si nécessaire
      const shouldFragment = shouldFragmentData(products);
      if (shouldFragment) {
        const chunks = chunkArray(products, WORKER_CONFIG.chunkSize);
        const results = await Promise.all(chunks.map(chunk => processFilterChunk(chunk, filters, taskId)));
        return results.flat();
      }

      // Si pas de fragmentation nécessaire, traiter directement
      return await processFilterChunk(products, filters, taskId);

    } catch (err) {
      console.error('Erreur lors du filtrage:', err);
      setError('Une erreur est survenue lors du filtrage des produits');
      throw err;
    }
  }, [useWorkers, filterProductsWithoutWorker, generateTaskId, processFilterChunk, sortProductsWithoutWorker]);

  const sortProducts = useCallback(async (
    products: any[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
  ) => {
    setIsLoading(true);
    setError(null);
    
    // Vérifier si le résultat est en cache
    const cacheKey = { type: 'SORT_PRODUCTS', products, sortBy, sortOrder };
    const cachedResult = workerResultCache.get(cacheKey);
    
    if (cachedResult) {
      console.log('🔄 Résultat de tri récupéré depuis le cache');
      setIsLoading(false);
      return cachedResult;
    }

    try {
      // Si les workers sont désactivés, utiliser l'implémentation sans worker
      if (!useWorkers) {
        console.log('🔄 Mode sans worker détecté - utilisation de l\'implémentation native pour le tri');
        const result = sortProductsWithoutWorker(products, sortBy, sortOrder);
        // Mettre en cache le résultat
        workerResultCache.set(cacheKey, result);
        setIsLoading(false);
        return result;
      }

      // Version avec worker
      if (!workerRef.current) {
        console.error('❌ Worker non initialisé alors que useWorkers=true');
        throw new Error('Worker non initialisé');
      }

      // Marquer le début du tri avec worker
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark('sort-with-worker-start');
      }
      
      // Vérifier si les données sont trop volumineuses
      const { shouldFragment, estimatedSize, strategy } = shouldFragmentData(products);
      
      // Le tri nécessite généralement tous les éléments ensemble, donc nous ne fragmentons pas ici
      // mais nous pourrions implémenter un tri par morceaux si nécessaire dans le futur
      
      const taskId = generateTaskId();
      
      const result = await new Promise<any[]>((resolve, reject) => {
        const messageHandler = (e: MessageEvent) => {
          if (e.data.taskId === taskId) {
            // Supprimer cette tâche de la liste des tâches en attente
            const pendingTask = pendingTasksRef.current.get(taskId);
            if (pendingTask) {
              clearTimeout(pendingTask.timeout);
              pendingTasksRef.current.delete(taskId);
            }
            
            if (e.data.type === 'SORT_SUCCESS') {
              // Marquer la fin du tri avec worker
              if (typeof window !== 'undefined' && window.performance) {
                performance.mark('sort-with-worker-end');
                performance.measure('sort-with-worker', {
                  start: 'sort-with-worker-start',
                  end: 'sort-with-worker-end',
                  detail: { count: e.data.result.length }
                });
              }
              resolve(e.data.result);
            } else if (e.data.type === 'ERROR') {
              reject(new Error(e.data.error));
            }
          }
        };
        
        // Ajouter le gestionnaire de messages
        workerRef.current?.addEventListener('message', messageHandler);
        activeListenersRef.current[taskId] = messageHandler;
        
        // Configurer un timeout pour cette tâche
        const timeout = setTimeout(() => {
          console.error(`Timeout pour la tâche ${taskId}`);
          workerRef.current?.removeEventListener('message', messageHandler);
          delete activeListenersRef.current[taskId];
          pendingTasksRef.current.delete(taskId);
          reject(new Error('Timeout lors du traitement par le worker'));
        }, 5000); // 5 secondes de timeout (le tri est généralement plus rapide)
        
        // Enregistrer cette tâche en attente
        pendingTasksRef.current.set(taskId, {
          resolve,
          reject,
          timeout
        });

        // Utiliser le transfert optimisé pour envoyer le message
        postMessageWithTransfer(workerRef.current!, {
          type: 'SORT_PRODUCTS',
          taskId,
          products,
          sortBy,
          sortOrder,
        });
      }).finally(() => {
        // Nettoyer le gestionnaire de messages
        if (workerRef.current && activeListenersRef.current[taskId]) {
          workerRef.current.removeEventListener('message', activeListenersRef.current[taskId]);
          delete activeListenersRef.current[taskId];
        }
      });
      
      // Mettre en cache le résultat
      workerResultCache.set(cacheKey, result);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
      throw err;
    }
  }, [useWorkers, sortProductsWithoutWorker, generateTaskId]);

  return {
    filterProducts,
    sortProducts,
    isLoading,
    error,
    useWorkers // Exposer l'état d'utilisation des workers
  };
} 