import { useCallback, useEffect, useRef, useState } from "react";
import { WORKER_CONFIG } from "@/config/worker-config";
import { useWorkerToggle } from "./useWorkerToggle";
import {
  postMessageWithTransfer,
  shouldFragmentData,
  chunkArray,
  workerResultCache,
} from "@/utils/worker-communication";

// Types pour marquer les performances
declare global {
  interface Performance {
    mark(name: string, options?: { detail?: any }): void;
    measure(
      name: string,
      options?: { start?: string; end?: string; detail?: any },
    ): void;
  }
}

type FilterOptions = {
  categories?: string[];
  priceRange?: { min: number; max: number };
  colors?: string[];
  sizes?: string[];
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  searchTerm?: string;
  inStock?: boolean;
};

// Timeout très court pour basculer rapidement vers le filtrage local
const WORKER_TIMEOUT = 2000; // 2 secondes pour un basculement quasi-immédiat

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
  const [workerInitFailed, setWorkerInitFailed] = useState(false);

  // Référence pour conserver les écouteurs de messages en cours
  const activeListenersRef = useRef<{
    [key: string]: (e: MessageEvent) => void;
  }>({});
  // Map des IDs de tâches en cours
  const pendingTasksRef = useRef<
    Map<
      string,
      {
        resolve: (value: any) => void;
        reject: (reason: any) => void;
        timeout: NodeJS.Timeout;
      }
    >
  >(new Map());

  // Fonction pour générer un ID unique de tâche
  const generateTaskId = useCallback(() => {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Fonction pour initialiser un nouveau worker
  const initWorker = useCallback(() => {
    if (!useWorkers || workerRef.current) return;

    try {
      console.log("Initialisation du worker de filtrage...");
      workerRef.current = new Worker(
        new URL("../workers/filterWorker.ts", import.meta.url),
      );

      // Gestionnaire d'erreurs du worker
      const errorHandler = (error: ErrorEvent) => {
        console.error("Erreur du worker:", error);
        setError("Erreur lors du traitement des données");
        setIsLoading(false);
      };

      workerRef.current.addEventListener("error", errorHandler);
      setWorkerInitFailed(false);

      return () => {
        if (workerRef.current) {
          workerRef.current.removeEventListener("error", errorHandler);
        }
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation du worker:", error);
      setError("Erreur lors de l'initialisation du worker");
      setIsLoading(false);
      workerRef.current = null;
      setWorkerInitFailed(true);
      return undefined;
    }
  }, [useWorkers]);

  useEffect(() => {
    // Initialiser le worker si nécessaire
    const cleanupFn = initWorker();

    // Nettoyage lors du démontage
    return () => {
      // Appeler la fonction de nettoyage si elle existe
      if (cleanupFn) cleanupFn();

      // Copier les références dans des variables locales
      const worker = workerRef.current;
      const tasks = new Map(pendingTasksRef.current);

      // Nettoyer les timeouts
      tasks.forEach((task) => {
        if (task.timeout) {
          clearTimeout(task.timeout);
        }
      });

      // Vider la map des tâches en attente
      pendingTasksRef.current.clear();

      // Terminer le worker
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, [useWorkers, initWorker]);

  /**
   * Implémentation native du filtrage pour utilisation sans worker
   * @param products Liste des produits à filtrer
   * @param options Options de filtrage
   * @returns Liste des produits filtrés
   */
  const filterProductsWithoutWorker = useCallback(
    (products: any[], options: FilterOptions): any[] => {
      // Fonction locale qui implémente le même filtrage que dans le worker
      return products.filter((product) => {
        // Filtre par catégorie
        if (options.categories?.length) {
          const categoryId = String(product.category_id || "");
          if (!options.categories.some((cat) => cat === categoryId)) {
            return false;
          }
        }

        // Filtre par prix
        if (options.priceRange) {
          if (
            product.price < options.priceRange.min ||
            product.price > options.priceRange.max
          ) {
            return false;
          }
        }

        // Filtre par taille
        if (options.sizes?.length && product.variants) {
          const productSizes = product.variants
            .map((v: any) => v.size)
            .filter(Boolean);
          if (!options.sizes.some((size) => productSizes.includes(size))) {
            return false;
          }
        }

        // Filtre par couleur
        if (options.colors?.length && product.variants) {
          const productColors = product.variants
            .map((v: any) => v.color?.toLowerCase())
            .filter(Boolean);
          if (
            !options.colors.some((color) =>
              productColors.includes(color.toLowerCase()),
            )
          ) {
            return false;
          }
        }

        // Filtre par disponibilité
        if (options.inStock !== undefined) {
          // Si le produit a des variantes, vérifier si au moins une est en stock
          if (product.variants && product.variants.length > 0) {
            const hasStock = product.variants.some(
              (v: any) => (v.stock || 0) > 0,
            );
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
            (product.brand &&
              product.brand.toLowerCase().includes(searchLower)) ||
            (product.description &&
              product.description.toLowerCase().includes(searchLower))
          );
        }

        return true;
      });
    },
    [],
  );

  /**
   * Implémentation native du tri pour utilisation sans worker
   * @param products Liste des produits à trier
   * @param sortBy Critère de tri
   * @param sortOrder Ordre de tri
   * @returns Liste des produits triés
   */
  const sortProductsWithoutWorker = useCallback(
    (products: any[], sortBy: string, sortOrder: "asc" | "desc"): any[] => {
      const sortFactor = sortOrder === "asc" ? 1 : -1;

      return [...products].sort((a, b) => {
        if (sortBy === "price") {
          return (a.price - b.price) * sortFactor;
        } else if (sortBy === "name") {
          return a.name.localeCompare(b.name) * sortFactor;
        } else if (sortBy === "newest") {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Toujours du plus récent au plus ancien
        } else if (sortBy === "popular") {
          const popularityA = a.popularity || 0;
          const popularityB = b.popularity || 0;
          return popularityB - popularityA; // Toujours du plus populaire au moins populaire
        }
        return 0;
      });
    },
    [],
  );

  /**
   * Fonction privée pour traiter un fragment de données
   * @param chunk Fragment de données à traiter
   * @param filters Options de filtrage
   * @param taskId ID de la tâche
   * @returns Promesse avec les résultats du filtrage
   */
  const processFilterChunk = useCallback(
    async (
      chunk: any[],
      filters: FilterOptions,
      taskId: string,
    ): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        // Vérifier si le worker a été initialisé correctement
        if (!workerRef.current) {
          // Si l'initialisation du worker a échoué, utiliser l'implémentation de secours
          console.log(
            "Worker non disponible, utilisation de l'implémentation de secours",
          );
          const results = filterProductsWithoutWorker(chunk, filters);
          resolve(results);
          return;
        }

        // Configurer le timeout
        const timeout = setTimeout(() => {
          console.error(
            "Timeout du worker, utilisation de l'implémentation de secours",
          );
          pendingTasksRef.current.delete(taskId);

          // En cas de timeout, utiliser l'implémentation sans worker
          try {
            const results = filterProductsWithoutWorker(chunk, filters);
            resolve(results);
          } catch (error) {
            reject(new Error("Échec du filtrage de secours après timeout"));
          }
        }, WORKER_TIMEOUT);

        // Stocker la promesse et le timeout
        pendingTasksRef.current.set(taskId, {
          resolve,
          reject,
          timeout,
        });

        // Envoyer les données au worker
        const transferableData = {
          taskId,
          products: chunk,
          filters,
        };

        try {
          postMessageWithTransfer(workerRef.current, transferableData);
        } catch (error) {
          clearTimeout(timeout);
          pendingTasksRef.current.delete(taskId);

          // En cas d'erreur lors de l'envoi au worker, utiliser l'implémentation sans worker
          console.error(
            "Erreur lors de l'envoi au worker, utilisation de l'implémentation de secours",
            error,
          );
          try {
            const results = filterProductsWithoutWorker(chunk, filters);
            resolve(results);
          } catch (secondError) {
            reject(secondError);
          }
        }
      });
    },
    [filterProductsWithoutWorker],
  );

  /**
   * Fonction pour filtrer les produits, avec repli automatique en cas d'erreur de worker
   */
  const filterProducts = useCallback(
    async (products: any[], filters: FilterOptions = {}) => {
      // Si le worker a échoué à l'initialisation ou n'est pas utilisé, utiliser l'implémentation sans worker
      if (workerInitFailed || !useWorkers) {
        console.log("Utilisation du filtrage côté client sans worker");
        return filterProductsWithoutWorker(products, filters);
      }

      try {
        setIsLoading(true);
        setError(null);

        // Générer un taskId unique
        const taskId = generateTaskId();

        // Créer et configurer l'écouteur de messages
        const messageHandler = (e: MessageEvent) => {
          if (!e.data || !e.data.taskId || e.data.taskId !== taskId) return;

          if (workerRef.current) {
            workerRef.current.removeEventListener("message", messageHandler);
          }
          delete activeListenersRef.current[taskId];

          const pendingTask = pendingTasksRef.current.get(taskId);
          if (!pendingTask) return;

          const { resolve, reject, timeout } = pendingTask;
          clearTimeout(timeout);
          pendingTasksRef.current.delete(taskId);

          if (e.data.type === "FILTER_SUCCESS") {
            resolve(e.data.result);
          } else if (e.data.type === "ERROR") {
            reject(new Error(e.data.error || "Erreur inconnue"));
          }
        };

        // Enregistrer l'écouteur
        if (workerRef.current) {
          workerRef.current.addEventListener("message", messageHandler);
          activeListenersRef.current[taskId] = messageHandler;
        }

        // Si les données sont volumineuses, les fragmenter
        if (shouldFragmentData(products)) {
          try {
            const chunks = chunkArray(products, WORKER_CONFIG.chunkSize || 500);
            const results = await Promise.all(
              chunks.map((chunk) =>
                processFilterChunk(
                  chunk,
                  filters,
                  `${taskId}-chunk-${chunks.indexOf(chunk)}`,
                ),
              ),
            );

            // Combiner les résultats des fragments
            const combinedResults = results.flat();
            setIsLoading(false);
            return combinedResults;
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Erreur de filtrage",
            );
            setIsLoading(false);

            // En cas d'erreur, utiliser l'implémentation sans worker
            console.error(
              "Erreur lors du filtrage avec worker, repli sur filtrage sans worker:",
              error,
            );
            return filterProductsWithoutWorker(products, filters);
          }
        } else {
          try {
            // Traiter directement sans fragmenter
            const result = await processFilterChunk(products, filters, taskId);
            setIsLoading(false);
            return result;
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Erreur de filtrage",
            );
            setIsLoading(false);

            // En cas d'erreur, utiliser l'implémentation sans worker
            console.error(
              "Erreur lors du filtrage avec worker, repli sur filtrage sans worker:",
              error,
            );
            return filterProductsWithoutWorker(products, filters);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur de filtrage");
        setIsLoading(false);

        // En cas d'erreur globale, utiliser l'implémentation sans worker
        console.error(
          "Erreur critique lors du filtrage, repli sur filtrage sans worker:",
          error,
        );
        return filterProductsWithoutWorker(products, filters);
      }
    },
    [
      useWorkers,
      generateTaskId,
      processFilterChunk,
      filterProductsWithoutWorker,
      workerInitFailed,
    ],
  );

  /**
   * Fonction pour trier les produits, avec repli automatique en cas d'erreur de worker
   */
  const sortProducts = useCallback(
    async (
      products: any[],
      sortBy = "popular",
      sortOrder: "asc" | "desc" = "desc",
    ) => {
      // Si le worker a échoué à l'initialisation ou n'est pas utilisé, utiliser l'implémentation sans worker
      if (workerInitFailed || !useWorkers) {
        return sortProductsWithoutWorker(products, sortBy, sortOrder);
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fonction pour trier sans worker (repli)
        const fallbackSort = () => {
          return sortProductsWithoutWorker(products, sortBy, sortOrder);
        };

        // Si le worker n'est pas disponible, utiliser l'implémentation de repli
        if (!workerRef.current) {
          setIsLoading(false);
          return fallbackSort();
        }

        // Générer un taskId unique
        const taskId = generateTaskId();

        // Créer et configurer l'écouteur de messages
        const messageHandler = (e: MessageEvent) => {
          if (!e.data || !e.data.taskId || e.data.taskId !== taskId) return;

          if (workerRef.current) {
            workerRef.current.removeEventListener("message", messageHandler);
          }
          delete activeListenersRef.current[taskId];

          const pendingTask = pendingTasksRef.current.get(taskId);
          if (!pendingTask) return;

          const { resolve, reject, timeout } = pendingTask;
          clearTimeout(timeout);
          pendingTasksRef.current.delete(taskId);

          if (e.data.type === "SORT_SUCCESS") {
            resolve(e.data.result);
          } else if (e.data.type === "ERROR") {
            reject(new Error(e.data.error || "Erreur inconnue"));
          }
        };

        // Enregistrer l'écouteur
        workerRef.current.addEventListener("message", messageHandler);
        activeListenersRef.current[taskId] = messageHandler;

        return new Promise<any[]>((resolve, reject) => {
          // Configurer le timeout
          const timeout = setTimeout(() => {
            console.warn(
              "Timeout du worker pour le tri, utilisation de l'implémentation de secours",
            );
            pendingTasksRef.current.delete(taskId);
            try {
              const results = fallbackSort();
              resolve(results);
            } catch (error) {
              reject(new Error("Échec du tri de secours après timeout"));
            }
          }, WORKER_TIMEOUT);

          // Stocker la promesse
          pendingTasksRef.current.set(taskId, {
            resolve,
            reject,
            timeout,
          });

          try {
            // Envoyer les données au worker
            workerRef.current?.postMessage({
              type: "SORT_PRODUCTS",
              taskId,
              products,
              sortBy,
              sortOrder,
            });
          } catch (error) {
            clearTimeout(timeout);
            pendingTasksRef.current.delete(taskId);
            console.error(
              "Erreur lors de l'envoi au worker pour le tri, utilisation de l'implémentation de secours",
              error,
            );
            try {
              const results = fallbackSort();
              resolve(results);
            } catch (secondError) {
              reject(secondError);
            }
          }
        })
          .then((result) => {
            setIsLoading(false);
            return result;
          })
          .catch((error) => {
            setError(error instanceof Error ? error.message : "Erreur de tri");
            setIsLoading(false);
            // En cas d'erreur, utiliser l'implémentation sans worker
            return fallbackSort();
          });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur de tri");
        setIsLoading(false);
        // En cas d'erreur, utiliser l'implémentation sans worker
        return sortProductsWithoutWorker(products, sortBy, sortOrder);
      }
    },
    [useWorkers, generateTaskId, sortProductsWithoutWorker, workerInitFailed],
  );

  // Retourner les fonctions et états
  return {
    filterProducts,
    sortProducts,
    isLoading,
    error,
  };
}
