# Système de Gestion des Priorités avec Web Workers

## Introduction

Le système de priorité est une solution basée sur les Web Workers permettant de gérer efficacement l'exécution de tâches en arrière-plan dans l'application Reboul E-commerce. Il permet de décharger le thread principal des calculs intensifs tout en maintenant une interface utilisateur réactive.

## Architecture

Le système de priorité comprend trois composants principaux :

1. **PriorityWorker** : Un Web Worker qui exécute les tâches en arrière-plan
2. **usePriorityWorker** : Un hook React pour communiquer avec le worker
3. **PriorityContext** : Un contexte React pour exposer les fonctionnalités dans toute l'application

### Flux de travail

```
[Application] → [PriorityContext] → [usePriorityWorker] → [priorityWorker.ts]
                         ↑                                         ↓
                         └─────────────── [Résultats] ────────────┘
```

## Fonctionnalités

### Niveaux de priorité

Le système prend en charge trois niveaux de priorité :

- **high** : Tâches critiques à exécuter immédiatement
- **medium** : Tâches importantes mais moins urgentes
- **low** : Tâches d'arrière-plan qui peuvent attendre

### Types de tâches supportés

Le worker peut traiter les types de tâches suivants :

1. **IMAGE_OPTIMIZATION** : Optimisation d'images (compression, redimensionnement)
2. **DATA_AGGREGATION** : Agrégation et traitement de données
3. **PRODUCT_RECOMMENDATIONS** : Calcul de recommandations de produits
4. **USER_PREFERENCES** : Traitement des préférences utilisateur

## Utilisation

### Intégration dans un composant

```jsx
import { usePriority } from '@/app/contexts/PriorityContext';

function MonComposant() {
  const { addTask, processTasks, executeTask, completedTasks } = usePriority();
  
  // Ajouter une tâche à la file d'attente
  const handleAddTask = () => {
    addTask({
      id: `IMAGE_OPTIMIZATION-high-${Date.now()}`,
      priority: 'high',
      type: 'IMAGE_OPTIMIZATION',
      data: {
        url: 'https://example.com/image.jpg',
        size: 1200
      }
    });
  };
  
  // Traiter toutes les tâches en file d'attente
  const handleProcessAllTasks = () => {
    processTasks();
  };
  
  // Exécuter une tâche immédiatement
  const handleDirectExecution = async () => {
    try {
      const result = await executeTask({
        id: `DIRECT-high-${Date.now()}`,
        priority: 'high',
        type: 'DATA_AGGREGATION',
        data: { /* ... */ }
      });
      
      console.log('Résultat:', result);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleAddTask}>Ajouter tâche</button>
      <button onClick={handleProcessAllTasks}>Traiter tâches</button>
      <button onClick={handleDirectExecution}>Exécution directe</button>
    </div>
  );
}
```

### Récupération des résultats

Les résultats des tâches sont stockés dans une Map accessible via le contexte :

```jsx
const { completedTasks } = usePriority();

// Récupérer un résultat spécifique
const result = completedTasks.get('task-id');

// Obtenir tous les résultats par type
const { getResultsByType } = usePriority();
const imageResults = getResultsByType('IMAGE_OPTIMIZATION');
```

## API Reference

### PriorityContext

| Méthode / Propriété | Description |
|---------------------|-------------|
| `addTask(task)` | Ajoute une tâche à la file d'attente |
| `processTasks()` | Traite toutes les tâches en attente par ordre de priorité |
| `clearQueue()` | Vide la file d'attente |
| `executeTask(task)` | Exécute une tâche immédiatement et retourne une Promise |
| `isProcessing` | État indiquant si des tâches sont en cours de traitement |
| `error` | Message d'erreur en cas de problème |
| `completedTasks` | Map des résultats de tâches (clé: ID de tâche, valeur: résultat) |
| `taskCount` | Nombre de tâches en attente |
| `getResultsByType(type)` | Récupère les résultats filtrés par type |
| `getResultById(id)` | Récupère un résultat par ID |

### Structure d'une tâche

```typescript
type Task = {
  id: string;       // Identifiant unique de la tâche
  priority: 'high' | 'medium' | 'low';  // Niveau de priorité
  type: string;     // Type de tâche (ex: 'IMAGE_OPTIMIZATION')
  data: any;        // Données spécifiques à la tâche
};
```

### Structure d'un résultat

```typescript
type TaskResult = {
  success: boolean;  // Indique si la tâche a réussi
  data: any;         // Données résultantes ou message d'erreur
};
```

## Cas d'utilisation

### 1. Optimisation d'images

Utilisé pour optimiser des images sans bloquer l'interface utilisateur :

```javascript
// Dans un composant de galerie d'images
const { executeTask } = usePriority();

// Lors du chargement d'une image
const optimizeImage = async (imageUrl, size) => {
  const result = await executeTask({
    id: `IMAGE_OPTIMIZATION-high-${Date.now()}`,
    priority: 'high',
    type: 'IMAGE_OPTIMIZATION',
    data: { url: imageUrl, size, format: 'webp' }
  });
  
  return result.data.url; // URL optimisée
};
```

### 2. Recommandations produits

Pour calculer des recommandations sans affecter la navigation :

```javascript
// Dans un composant de page produit
const { addTask, processTasks, getResultsByType } = usePriority();

// Au chargement du produit
useEffect(() => {
  const taskId = `PRODUCT_RECOMMENDATIONS-medium-${product.id}`;
  
  addTask({
    id: taskId,
    priority: 'medium',
    type: 'PRODUCT_RECOMMENDATIONS',
    data: { productId: product.id }
  });
  
  processTasks();
}, [product.id]);

// Pour afficher les recommandations
const recommendations = useMemo(() => {
  const results = getResultsByType('PRODUCT_RECOMMENDATIONS');
  return results.find(r => r.data.source === `Product ${product.id}`)?.data.recommendations || [];
}, [getResultsByType, product.id]);
```

### 3. Calcul de panier

Pour les calculs complexes de panier, promotions et livraison :

```javascript
// Dans un contexte de panier
const { executeTask } = usePriority();

// Lors d'un changement dans le panier
const calculateCart = async (items, promoCode) => {
  const result = await executeTask({
    id: `CART_CALCULATION-high-${Date.now()}`,
    priority: 'high',
    type: 'DATA_AGGREGATION',
    data: { 
      items,
      promoCode,
      shippingOptions: availableShippingMethods
    }
  });
  
  return result.data;
};
```

## Bonnes pratiques

1. **Utilisez des ID descriptifs** : Formatez les ID de tâches avec le type et la priorité pour faciliter le débogage (ex: `IMAGE_OPTIMIZATION-high-123456`)

2. **Priorisez correctement** : Limitez les tâches de haute priorité aux fonctionnalités critiques pour l'utilisateur

3. **Gérez les échecs** : Utilisez toujours des blocs try/catch avec executeTask et vérifiez les erreurs dans completedTasks

4. **Évitez les transferts massifs de données** : Minimisez la taille des données transférées entre le thread principal et le worker

5. **Choisissez la bonne approche** :
   - Pour une seule tâche urgente : `executeTask()`
   - Pour plusieurs tâches groupées : `addTask()` puis `processTasks()`

## Performance et monitoring

Le système de priorité améliore les performances en :

- Déplaçant les calculs intensifs hors du thread principal
- Évitant les blocages de l'interface utilisateur pendant les opérations lourdes
- Priorisant les tâches critiques pour l'expérience utilisateur

Le monitoring des tâches peut être réalisé via :

```javascript
// Dans un composant de monitoring
const { completedTasks, taskCount, isProcessing } = usePriority();

// Statistiques basiques
const stats = {
  totalCompleted: completedTasks.size,
  tasksInQueue: taskCount,
  isCurrentlyProcessing: isProcessing
};
```

## Limitations connues

1. Les Web Workers ne peuvent pas accéder directement au DOM
2. Les données transférées sont clonées (pas de références partagées)
3. La communication est asynchrone par nature

## Dépannage

### Problème : Les tâches ne s'exécutent pas

Vérifiez que :
- La priorité est correctement définie
- La méthode `processTasks()` a été appelée
- Le provider `PriorityProvider` est bien présent dans l'arbre des composants

### Problème : Erreurs de données

Vérifiez que :
- Les données transmises sont sérialisables (pas de fonctions, DOM, etc.)
- La structure des données correspond à ce que le worker attend

## Évolutions futures

1. Ajout de nouveaux types de tâches pour d'autres besoins métier
2. Implémentation d'un système de priorité dynamique basé sur le contexte utilisateur
3. Mécanisme de reprise pour les tâches échouées
4. Support pour les Shared Workers pour partager le traitement entre onglets

---

Dernière mise à jour : Septembre 2024 