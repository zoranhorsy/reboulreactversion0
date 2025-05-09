import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Hook pour activer/désactiver les Web Workers en fonction d'un paramètre d'URL
 * 
 * Utilisé pour les tests de performance afin de comparer l'expérience
 * avec et sans Web Workers.
 * 
 * @returns {boolean} Indique si les Web Workers doivent être utilisés
 * 
 * @example
 * // Dans un composant:
 * const useWorkers = useWorkerToggle();
 * 
 * useEffect(() => {
 *   if (useWorkers) {
 *     // Utiliser les Web Workers
 *   } else {
 *     // Utiliser l'implémentation alternative sans Web Workers
 *   }
 * }, [useWorkers]);
 */
export function useWorkerToggle(): boolean {
  const [useWorkers, setUseWorkers] = useState<boolean>(true);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Vérifier si le paramètre d'URL 'disableWorkers' est présent
    const disableWorkers = searchParams?.get('disableWorkers');
    
    console.log('🔍 useWorkerToggle - Vérification du paramètre disableWorkers:', { 
      paramValue: disableWorkers,
      searchParams: Object.fromEntries(searchParams?.entries() || [])
    });
    
    // Désactiver les workers si le paramètre est présent et a une valeur truthy
    if (disableWorkers === 'true' || disableWorkers === '1') {
      console.info('[WorkerToggle] Web Workers désactivés via paramètre d\'URL');
      setUseWorkers(false);
      
      // Enregistrer l'événement pour les mesures de performance
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark('workers-disabled');
      }
    } else {
      console.info('[WorkerToggle] Web Workers activés (pas de paramètre disableWorkers)');
      setUseWorkers(true);
    }
  }, [searchParams]);
  
  return useWorkers;
}

export default useWorkerToggle; 