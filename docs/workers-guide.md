# Guide des Web Workers - Reboul E-commerce

## Vue d'ensemble

Les Web Workers sont utilisés dans notre application pour déplacer les traitements intensifs hors du thread principal, améliorant ainsi les performances et la réactivité de l'interface utilisateur. Nous avons implémenté trois workers principaux:

| Worker | Rôle | Documentation détaillée |
|--------|------|------------------------|
| `filterWorker` | Filtrage et tri des produits | [docs/web-workers.md#1-filter-worker](docs/web-workers.md#1-filter-worker) |
| `cartWorker` | Calculs du panier et promos | [docs/web-workers.md#2-cart-worker](docs/web-workers.md#2-cart-worker) |
| `priorityWorker` | Système de priorité | [docs/priority-system.md](docs/priority-system.md) |

## 1. Filter Worker

**Fonction**: Décharge les opérations de filtrage et de tri des produits du thread principal.

**Utilisation**:
```javascript
const { filterProducts, sortProducts } = useFilterWorker();

// Filtrer les produits
const filtered = await filterProducts(products, {
  categories: ['vêtements'],
  priceRange: { min: 50, max: 200 },
  colors: ['rouge', 'bleu']
});

// Trier les produits
const sorted = await sortProducts(products, 'price_desc');
```

**Implémenté dans**: `CatalogueContent` et le catalogue The Corner.

## 2. Cart Worker

**Fonction**: Calcule les totaux du panier, applique les codes promo et les frais de livraison.

**Utilisation**:
```javascript
const { calculateTotal } = useCartWorker();

// Calculer le total du panier
const total = await calculateTotal(cartItems, {
  promoCode: 'BIENVENUE10',
  shippingMethod: 'express'
});
```

**Implémenté dans**: `CartContext` pour la gestion globale du panier.

## 3. Priority Worker

**Fonction**: Système de file d'attente pour les tâches avec trois niveaux de priorité (high, medium, low).

**Types de tâches**:
- `IMAGE_OPTIMIZATION`: Traitement d'images
- `DATA_AGGREGATION`: Agrégation de données
- `PRODUCT_RECOMMENDATIONS`: Calcul de recommandations
- `USER_PREFERENCES`: Traitement des préférences

**Utilisation**:
```javascript
const { addTask, processTasks, executeTask } = usePriority();

// Ajouter une tâche
addTask({
  id: `IMAGE_OPTIMIZATION-high-${Date.now()}`,
  priority: 'high',
  type: 'IMAGE_OPTIMIZATION',
  data: { url: 'image.jpg', size: 1200 }
});

// Exécuter toutes les tâches
processTasks();

// Exécution directe
const result = await executeTask({
  id: `DIRECT-high-${Date.now()}`,
  priority: 'high',
  type: 'DATA_AGGREGATION',
  data: { /* ... */ }
});
```

**Implémenté dans**: Disponible globalement via `PriorityContext`.

## Intégration dans les composants

### Comment utiliser les workers dans vos composants

1. **Avec les hooks dédiés**:
```javascript
import { useFilterWorker } from '@/hooks/useFilterWorker';
import { useCartWorker } from '@/hooks/useCartWorker';
import { usePriorityWorker } from '@/hooks/usePriorityWorker';

function MyComponent() {
  const { filterProducts } = useFilterWorker();
  // ...
}
```

2. **Avec les contextes (pour les workers globaux)**:
```javascript
import { usePriority } from '@/app/contexts/PriorityContext';
import { useCart } from '@/app/contexts/CartContext';

function MyComponent() {
  const { addTask } = usePriority();
  const { cart } = useCart();
  // ...
}
```

## Bonnes pratiques

1. **Transférez des données minimales**: Les données sont clonées entre le thread principal et le worker, ce qui peut être coûteux pour de grands volumes.

2. **Gestion des états de chargement**: Utilisez les états `isLoading` fournis par les hooks pour indiquer le chargement à l'utilisateur.

3. **Gestion des erreurs**: Utilisez toujours try/catch avec les workers et affichez les erreurs de manière appropriée.

4. **Prioritisez correctement**: Utilisez les niveaux de priorité appropriés:
   - `high`: Tâches critiques pour l'expérience utilisateur immédiate
   - `medium`: Tâches importantes mais non bloquantes
   - `low`: Tâches d'arrière-plan ou d'optimisation

5. **Nettoyage des ressources**: Les workers sont automatiquement nettoyés lorsque les composants sont démontés.

## Démonstration

Une page de démonstration du système de priorité est disponible à l'URL `/demo-priority` où vous pouvez tester les différentes fonctionnalités du priorityWorker.

## Pour aller plus loin

Une documentation détaillée est disponible dans:
- [docs/web-workers.md](docs/web-workers.md) - Documentation générale des workers
- [docs/priority-system.md](docs/priority-system.md) - Documentation détaillée du système de priorité 