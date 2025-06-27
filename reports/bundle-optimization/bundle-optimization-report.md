# Rapport d'optimisation des bundles JavaScript

## Sommaire
- [Bibliothèques volumineuses identifiées](#bibliothèques-volumineuses-identifiées)
- [Analyse détaillée de l'utilisation](#analyse-détaillée-de-lutilisation)
- [Recommandations d'optimisation](#recommandations-doptimisation)
- [Plan d'implémentation](#plan-dimplémentation)

## Bibliothèques volumineuses identifiées

- **framer-motion** (~120KB)
- **lodash** (~70KB)
- **gsap** (~140KB)
- **animejs** (~40KB)
- **styled-components** (~65KB)
- **three** (~570KB)
- **recharts** (~155KB)
- **@chakra-ui/react** (~80KB)
- **swiper** (~120KB)

## Analyse détaillée de l'utilisation

### framer-motion
- **Imports globaux**: 21 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:
  - StoreSelection-original.tsx (global)
  - SimilarProducts.tsx (global)
  - RecentlyViewedProducts.tsx (global)
  - PromoPopup-original.tsx (global)
  - ProductGallery.tsx (global)
  - ... et 16 autres fichiers

### lodash
- **Imports globaux**: 0 fichiers
- **Imports spécifiques**: 4 fichiers
- **Composants utilisant cette bibliothèque**:
  - TheCornerClientContent.tsx (specific: debounce)
  - OptimizedTheCornerContent.tsx (specific: debounce)
  - LazyImportExample.tsx (specific: debounce)
  - AdminSettings.tsx (specific: debounce)


### gsap
- **Imports globaux**: 7 fichiers
- **Imports spécifiques**: 4 fichiers
- **Composants utilisant cette bibliothèque**:
  - gsap-config.ts (global)
  - HomeContent.tsx (global)
  - HomeContent.tsx (specific: ScrollTrigger)
  - GsapProvider.jsx (global)
  - GsapProvider.jsx (specific: ScrollTrigger)
  - ... et 6 autres fichiers

### animejs
- **Imports globaux**: 3 fichiers
- **Imports spécifiques**: 2 fichiers
- **Composants utilisant cette bibliothèque**:
  - animations.ts (global)
  - anime-utils.ts (global)
  - useAnime.ts (global)
  - breadcrumb.tsx (specific: lib/anime.es.js)
  - AddToCartButton.tsx (specific: lib/anime.es.js)


### styled-components
- **Imports globaux**: 0 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:



### three
- **Imports globaux**: 1 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:
  - ParticleSystem.ts (global)


### recharts
- **Imports globaux**: 5 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:
  - DynamicChart.tsx (global)
  - WebVitalsAnalyzer.tsx (global)
  - Overview.tsx (global)
  - DashboardStats.tsx (global)
  - AdminStats.tsx (global)


### @chakra-ui/react
- **Imports globaux**: 2 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:
  - ChakraButtonExample.jsx (global)
  - ChakraBoxExample.jsx (global)


### swiper
- **Imports globaux**: 0 fichiers
- **Imports spécifiques**: 0 fichiers
- **Composants utilisant cette bibliothèque**:




## Recommandations d'optimisation

### framer-motion (~120KB)
- **Recommandation**: Remplacer par des animations CSS
- **Stratégie d'implémentation**: Utiliser les classes d'animation de src/styles/animation-utils.css
- **Impact estimé**: Moyen - Réduction progressive de la taille du bundle
- **Utilisation actuelle**: 21 fichiers (21 global, 0 spécifique)

### lodash (~70KB)
- **Recommandation**: Chargement dynamique et optimisation
- **Stratégie d'implémentation**: Combiner les imports spécifiques avec le chargement dynamique
- **Impact estimé**: Moyen - Amélioration progressive de la performance
- **Utilisation actuelle**: 4 fichiers (0 global, 4 spécifique)

### gsap (~140KB)
- **Recommandation**: Chargement dynamique et optimisation
- **Stratégie d'implémentation**: Combiner les imports spécifiques avec le chargement dynamique
- **Impact estimé**: Moyen - Amélioration progressive de la performance
- **Utilisation actuelle**: 11 fichiers (7 global, 4 spécifique)

### animejs (~40KB)
- **Recommandation**: Chargement dynamique et optimisation
- **Stratégie d'implémentation**: Combiner les imports spécifiques avec le chargement dynamique
- **Impact estimé**: Moyen - Amélioration progressive de la performance
- **Utilisation actuelle**: 5 fichiers (3 global, 2 spécifique)

### styled-components (~65KB)
- **Recommandation**: Chargement dynamique et optimisation
- **Stratégie d'implémentation**: Combiner les imports spécifiques avec le chargement dynamique
- **Impact estimé**: Moyen - Amélioration progressive de la performance
- **Utilisation actuelle**: 0 fichiers (0 global, 0 spécifique)

### three (~570KB)
- **Recommandation**: Chargement dynamique
- **Stratégie d'implémentation**: Utiliser les fonctions de chargement dynamique de src/lib/dynamic-loading-strategies.ts
- **Impact estimé**: Élevé - Déplace la bibliothèque hors du bundle initial
- **Utilisation actuelle**: 1 fichiers (1 global, 0 spécifique)

### recharts (~155KB)
- **Recommandation**: Chargement dynamique
- **Stratégie d'implémentation**: Utiliser les fonctions de chargement dynamique de src/lib/dynamic-loading-strategies.ts
- **Impact estimé**: Élevé - Déplace la bibliothèque hors du bundle initial
- **Utilisation actuelle**: 5 fichiers (5 global, 0 spécifique)

### @chakra-ui/react (~80KB)
- **Recommandation**: Chargement dynamique
- **Stratégie d'implémentation**: Utiliser les fonctions de chargement dynamique de src/lib/dynamic-loading-strategies.ts
- **Impact estimé**: Moyen - Déplace la bibliothèque hors du bundle initial
- **Utilisation actuelle**: 2 fichiers (2 global, 0 spécifique)

### swiper (~120KB)
- **Recommandation**: Chargement dynamique et optimisation
- **Stratégie d'implémentation**: Combiner les imports spécifiques avec le chargement dynamique
- **Impact estimé**: Moyen - Amélioration progressive de la performance
- **Utilisation actuelle**: 0 fichiers (0 global, 0 spécifique)


## Plan d'implémentation

Voici un plan d'action recommandé pour réduire la taille des bundles JavaScript:

1. **Phase 1: Optimisations immédiates**
   - Supprimer les bibliothèques non utilisées
   - Convertir les imports Lodash en imports spécifiques
   - Appliquer le chargement dynamique pour les composants sous la fold

2. **Phase 2: Optimisations progressives**
   - Remplacer progressivement framer-motion par des animations CSS
   - Migrer styled-components vers Tailwind CSS
   - Appliquer le chargement conditionnel pour les fonctionnalités avancées

3. **Phase 3: Optimisations avancées**
   - Diviser les bibliothèques volumineuses en modules indépendants
   - Utiliser la stratégie de préchargement intelligent
   - Optimiser le code splitting au niveau des pages

### Exemples d'implémentation

#### Chargement dynamique basé sur la visibilité

```jsx
// Importer les utilitaires de chargement dynamique
import { createViewportLoadedComponent } from '@/lib/dynamic-loading-strategies';

// Créer un composant à chargement différé
const LazyChart = createViewportLoadedComponent(
  () => import('@/components/Chart'), // Composant utilisant recharts
  {
    loadingComponent: <div className="h-64 w-full animate-pulse bg-zinc-100/10 rounded-md" />,
    threshold: 0.1,
    rootMargin: '200px'
  }
);

// Utilisation
<LazyChart data={chartData} />
```

#### Chargement conditionnel

```jsx
// Importer les utilitaires de chargement dynamique
import { createConditionalComponent } from '@/lib/dynamic-loading-strategies';

// Créer un composant chargé conditionnellement
const AdminPanel = createConditionalComponent(
  () => import('@/components/AdminPanel'),
  () => user && user.role === 'admin'
);

// Utilisation
<AdminPanel />
```

#### Remplacement des animations framer-motion

```jsx
// Avant (with framer-motion)
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle;

function Card() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Contenu
    </motion.div>
  );
}

// Après (avec CSS)
import '@/styles/animation-utils.css';

function Card() {
  return (
    <div className="animate-fade-in animate-slide-up">
      Contenu
    </div>
  );
}
```

#### Imports spécifiques Lodash

```js
// Avant
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle';

// Après
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';

// Ou mieux encore, utiliser nos utilitaires optimisés
import { debounce, throttle } from '@/lib/utils/optimized-utils';
```
