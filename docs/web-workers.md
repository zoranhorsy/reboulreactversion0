# Documentation des Web Workers - Reboul E-commerce

## Vue d'ensemble

Les Web Workers de Reboul sont conçus pour décharger le thread principal et améliorer les performances de l'application. Trois workers principaux ont été implémentés :

1. `filterWorker` : Gestion du filtrage et tri des produits
2. `cartWorker` : Calculs du panier
3. `priorityWorker` : Système de priorité pour les traitements

## 1. Filter Worker

### Utilisation

```typescript
import { useFilterWorker } from '@/hooks/useFilterWorker';

function ProductList() {
  const { filterProducts, sortProducts, isLoading, error } = useFilterWorker();

  // Filtrage des produits
  const handleFilter = async () => {
    const filtered = await filterProducts(products, {
      categories: ['vêtements'],
      priceRange: { min: 50, max: 200 },
      colors: ['rouge', 'bleu'],
      sizes: ['M', 'L'],
      sortBy: 'price_asc'
    });
  };

  // Tri des produits
  const handleSort = async () => {
    const sorted = await sortProducts(products, 'price_desc');
  };
}
```

### Tests

```typescript
// tests/workers/filterWorker.test.ts
import { filterProducts, sortProducts } from '@/workers/filterWorker';

describe('Filter Worker', () => {
  const mockProducts = [
    {
      id: 1,
      category: 'vêtements',
      price: 100,
      colors: ['rouge', 'bleu'],
      sizes: ['M', 'L'],
      createdAt: '2024-01-01',
      popularity: 5
    },
    // ... autres produits
  ];

  test('filtre les produits par catégorie', () => {
    const filtered = filterProducts(mockProducts, {
      categories: ['vêtements']
    });
    expect(filtered.length).toBe(1);
  });

  test('trie les produits par prix', () => {
    const sorted = sortProducts(mockProducts, 'price_asc');
    expect(sorted[0].price).toBeLessThan(sorted[1].price);
  });
});
```

## 2. Cart Worker

### Utilisation

```typescript
import { useCartWorker } from '@/hooks/useCartWorker';

function Cart() {
  const { calculateTotal, isLoading, error } = useCartWorker();

  const updateCart = async () => {
    const total = await calculateTotal(cartItems, {
      shippingMethod: 'express',
      applyDiscount: true,
      discountCode: 'WELCOME10'
    });
    // total = { subtotal: 100, shipping: 15, discount: 10, total: 105 }
  };
}
```

### Tests

```typescript
// tests/workers/cartWorker.test.ts
import { calculateTotal } from '@/workers/cartWorker';

describe('Cart Worker', () => {
  const mockItems = [
    { id: 1, quantity: 2, price: 50 },
    { id: 2, quantity: 1, price: 30 }
  ];

  test('calcule correctement le sous-total', () => {
    const result = calculateTotal(mockItems);
    expect(result.subtotal).toBe(130); // (2 * 50) + (1 * 30)
  });

  test('applique correctement les remises', () => {
    const result = calculateTotal(mockItems, {
      applyDiscount: true,
      discountCode: 'WELCOME10'
    });
    expect(result.discount).toBe(13); // 10% de 130
  });
});
```

## 3. Priority Worker

Le PriorityWorker est un système de gestion de tâches basé sur la priorité qui permet d'exécuter des traitements intensifs en arrière-plan sans bloquer l'interface utilisateur.

### Fonctionnalités principales

- **Gestion des priorités** : Trois niveaux (high, medium, low)
- **File d'attente de tâches** : Les tâches sont ajoutées puis traitées par lot
- **Exécution immédiate** : Possibilité d'exécuter directement une tâche avec retour de promesse
- **Types de tâches spécialisées** : Support pour différents types de traitement

### Types de tâches supportés

1. **IMAGE_OPTIMIZATION** : Optimisation d'images (compression, redimensionnement)
2. **DATA_AGGREGATION** : Agrégation et traitement de données
3. **PRODUCT_RECOMMENDATIONS** : Calcul de recommandations de produits
4. **USER_PREFERENCES** : Traitement des préférences utilisateur

### Utilisation avec le hook

```typescript
import { usePriorityWorker } from '@/hooks/usePriorityWorker';

function TaskManager() {
  const { 
    addTask, 
    processTasks, 
    executeTask,
    clearQueue,
    isProcessing, 
    error,
    completedTasks,
    taskCount,
    getResultsByType,
    getResultById
  } = usePriorityWorker();

  // Ajouter une tâche à la file d'attente
  const handleAddTask = () => {
    addTask({
      id: `IMAGE_OPTIMIZATION-high-${Date.now()}`,
      priority: 'high',
      type: 'IMAGE_OPTIMIZATION',
      data: { url: 'https://example.com/image.jpg', size: 1200 }
    });
  };

  // Traiter toutes les tâches en file d'attente
  const handleProcessTasks = () => {
    processTasks();
  };
  
  // Exécution immédiate avec promesse
  const handleDirectExecution = async () => {
    try {
      const result = await executeTask({
        id: `DIRECT-medium-${Date.now()}`,
        priority: 'medium',
        type: 'DATA_AGGREGATION',
        data: { /* ... */ }
      });
      
      console.log('Résultat:', result);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  // Récupérer les résultats par type
  const imageResults = getResultsByType('IMAGE_OPTIMIZATION');
}
```

### Utilisation avec le contexte

Pour faciliter l'usage dans toute l'application, un contexte React est disponible :

```typescript
import { usePriority } from '@/app/contexts/PriorityContext';

function MyComponent() {
  const { addTask, processTasks, executeTask } = usePriority();
  
  // Utilisation identique à l'exemple précédent
}
```

### Structure des résultats

Les résultats sont stockés dans une Map accessible via `completedTasks` :

```typescript
type TaskResult = {
  success: boolean;  // Indique si la tâche a réussi
  data: any;         // Données résultantes ou message d'erreur
};

// Exemple d'accès
const result = completedTasks.get('task-id');
```

### Tests

```typescript
// tests/workers/priorityWorker.test.ts
import { sortTasksByPriority, processTasks } from '@/workers/priorityWorker';

describe('Priority Worker', () => {
  const mockTasks = [
    { id: '1', priority: 'low', type: 'task1', data: {} },
    { id: '2', priority: 'high', type: 'task2', data: {} },
    { id: '3', priority: 'medium', type: 'task3', data: {} }
  ];

  test('trie les tâches par priorité', () => {
    const sorted = sortTasksByPriority(mockTasks);
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('medium');
    expect(sorted[2].priority).toBe('low');
  });
  
  test('exécute les types de tâches spécifiques', async () => {
    // Test d'IMAGE_OPTIMIZATION
    const imageTask = {
      id: 'test-image',
      priority: 'high',
      type: 'IMAGE_OPTIMIZATION',
      data: { url: 'test.jpg', size: 1000 }
    };
    
    const result = await executeTask(imageTask);
    expect(result.success).toBe(true);
    expect(result.data.optimized).toBe(true);
    expect(result.data.size).toBeLessThan(1000);
  });
});
```

## Tests d'intégration

Pour tester l'intégration complète des Web Workers :

```typescript
// tests/integration/webWorkers.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useFilterWorker } from '@/hooks/useFilterWorker';
import { useCartWorker } from '@/hooks/useCartWorker';
import { usePriorityWorker } from '@/hooks/usePriorityWorker';

describe('Web Workers Integration', () => {
  test('filtre et calcule le panier en parallèle', async () => {
    const { result: filterResult } = renderHook(() => useFilterWorker());
    const { result: cartResult } = renderHook(() => useCartWorker());

    await act(async () => {
      const [filtered, total] = await Promise.all([
        filterResult.current.filterProducts(products, { categories: ['vêtements'] }),
        cartResult.current.calculateTotal(cartItems)
      ]);

      expect(filtered).toBeDefined();
      expect(total).toBeDefined();
    });
  });

  test('gère les priorités des tâches', async () => {
    const { result } = renderHook(() => usePriorityWorker());

    await act(async () => {
      result.current.addTask({
        id: 'high-priority',
        priority: 'high',
        type: 'CRITICAL',
        data: {}
      });

      result.current.addTask({
        id: 'low-priority',
        priority: 'low',
        type: 'NON_CRITICAL',
        data: {}
      });

      result.current.processTasks();
    });

    expect(result.current.completedTasks.get('high-priority')).toBeDefined();
  });
});
```

## Bonnes pratiques

1. **Gestion des erreurs**
   - Toujours utiliser try/catch avec les workers
   - Gérer les cas où le worker n'est pas initialisé
   - Logger les erreurs pour le debugging

2. **Performance**
   - Éviter de transférer de grandes quantités de données
   - Utiliser le système de priorité pour les tâches critiques
   - Nettoyer les workers quand ils ne sont plus nécessaires

3. **Maintenance**
   - Garder les types à jour
   - Documenter les changements d'API
   - Tester régulièrement les performances

## Monitoring

Pour surveiller les performances des Web Workers :

```typescript
// utils/workerMonitor.ts
export function monitorWorkerPerformance(worker: Worker) {
  const startTime = performance.now();
  
  worker.addEventListener('message', (e) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Worker ${worker.name} a mis ${duration}ms pour traiter la tâche`);
    
    // Envoyer les métriques à votre système de monitoring
    sendMetrics({
      workerName: worker.name,
      duration,
      timestamp: new Date(),
      taskType: e.data.type
    });
  });
}
```

## Dépannage

### Problèmes courants

1. **Worker non initialisé**
   ```typescript
   if (!workerRef.current) {
     console.error('Worker non initialisé');
     return;
   }
   ```

2. **Données trop volumineuses**
   ```typescript
   // Avant d'envoyer les données
   if (JSON.stringify(data).length > 1000000) {
     console.warn('Données trop volumineuses pour le worker');
     // Implémenter une stratégie de chunking
   }
   ```

3. **Worker bloqué**
   ```typescript
   // Ajouter un timeout
   const timeout = setTimeout(() => {
     worker.terminate();
     console.error('Worker bloqué, terminé après timeout');
   }, 5000);
   ```

## Mise à jour

Pour mettre à jour un worker :

1. Créer une nouvelle version du worker
2. Ajouter un système de version
3. Migrer progressivement les clients
4. Surveiller les performances
5. Supprimer l'ancienne version

```typescript
// Exemple de système de version
const WORKER_VERSION = '1.0.0';

self.onmessage = (e) => {
  if (e.data.version !== WORKER_VERSION) {
    self.postMessage({
      type: 'VERSION_MISMATCH',
      current: WORKER_VERSION,
      required: e.data.version
    });
    return;
  }
  // ... reste du code
};
```

## Intégration avec React

Pour une utilisation optimale des workers dans l'application React :

### 1. Utilisez les hooks dédiés

```tsx
function ProductCatalogue() {
  const { filterProducts } = useFilterWorker();
  const { calculateTotal } = useCartWorker();
  const { executeTask } = usePriorityWorker();
  
  // ...
}
```

### 2. Utilisez les contextes pour l'accès global

```tsx
// Dans app/layout.tsx
<CartProvider>
  <FavoritesProvider>
    <PromoProvider>
      <PriorityProvider>
        {/* ... */}
      </PriorityProvider>
    </PromoProvider>
  </FavoritesProvider>
</CartProvider>

// Dans n'importe quel composant
function MyComponent() {
  const { addToCart } = useCart();
  const { addTask } = usePriority();
  // ...
}
```

### 3. Gérez les états de chargement

```tsx
function ProductFilter() {
  const { filterProducts, isLoading } = useFilterWorker();
  
  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FilterResults />
      )}
    </div>
  );
}
```

## Performances et monitoring

Les Web Workers contribuent significativement à l'amélioration des performances en :

1. **Réduisant le TBT** (Total Blocking Time) en déplaçant les traitements lourds hors du thread principal
2. **Améliorant la réactivité** de l'interface utilisateur, même pendant des calculs intensifs
3. **Optimisant l'utilisation des ressources** via le système de priorité

Pour surveiller les performances :

- Utilisez l'outil Chrome DevTools > Performance pour mesurer l'impact des workers
- Implémentez des métriques personnalisées pour suivre les temps d'exécution
- Surveillez l'utilisation CPU et mémoire dans l'onglet Performance Monitor

## Guide de dépannage

### Erreurs communes et solutions

| Erreur | Cause possible | Solution |
|--------|----------------|----------|
| "Worker non initialisé" | Le worker n'est pas chargé ou est inaccessible | Vérifiez que le composant est monté et que les hooks sont appelés dans le contexte React |
| "Type de message non supporté" | Le worker a reçu un type de message inconnu | Vérifiez les types de messages envoyés au worker |
| Timeout des tâches | Tâches trop longues ou bloquantes | Fragmentez les tâches volumineuses en sous-tâches |
| Erreurs de décodage JSON | Données non sérialisables | Assurez-vous que les données envoyées sont sérialisables (pas de fonctions, DOM, etc.) |

### Outils de débogage

- Console de développement : Tous les messages des workers sont loggés
- DevTools > Application > Workers : Visualisation des workers actifs

## Bonnes pratiques

1. **Transférez des données minimales** : Évitez de passer des objets volumineux entre le thread principal et les workers
2. **Dimensionnez correctement les tâches** : Ni trop petites (overhead de communication), ni trop grandes (blocage du worker)
3. **Utilisez le système de priorité** : Différenciez les tâches critiques des tâches en arrière-plan
4. **Gérez les erreurs** : Implémentez toujours des gestionnaires d'erreurs pour les opérations de worker
5. **Nettoyez les ressources** : Terminez proprement les workers lorsqu'ils ne sont plus nécessaires

## Pour aller plus loin

Pour davantage d'informations sur le système de priorité, consultez la documentation détaillée dans `docs/priority-system.md`.

Pour comprendre les optimisations de la communication worker/main thread, consultez `docs/worker-communication-optimization.md`.

Pour voir les mesures d'impact des Web Workers sur les performances, consultez `docs/web-workers-performance-impact.md`.

---

Dernière mise à jour: Octobre 2024
