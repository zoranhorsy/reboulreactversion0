# Guide d'Optimisation des Bundles JavaScript

Ce document explique comment utiliser les outils intégrés pour réduire significativement la taille des bundles JavaScript de l'application Reboul.

## Objectif

Réduire la taille des bundles JavaScript de 4.9-6.4MB à une taille plus raisonnable (idéalement <2MB) pour améliorer considérablement les performances de l'application, notamment:

- **Time to Interactive (TTI)**: Temps nécessaire avant que l'utilisateur puisse interagir avec l'application
- **Total Blocking Time (TBT)**: Temps pendant lequel le thread principal est bloqué
- **First Contentful Paint (FCP)**: Premier rendu de contenu visible
- **Largest Contentful Paint (LCP)**: Plus grand élément visible rendu

## Outils disponibles

### 1. Analyse du bundle

```bash
# Analyser la taille du bundle et générer un rapport
npm run analyze-bundle

# Lancer une build avec l'analyseur de bundle intégré
npm run audit:bundle
```

### 2. Optimisation des imports Lodash

```bash
# Simuler l'optimisation (sans modifier les fichiers)
npm run optimize:lodash:dry

# Appliquer l'optimisation
npm run optimize:lodash
```

Cet outil:
- Transforme les imports globaux de Lodash en imports spécifiques par fonction
- Exemple: `import { debounce, throttle } from 'lodash'` devient:
  ```js
  import debounce from 'lodash/debounce';
  import throttle from 'lodash/throttle';
  ```
- Crée des sauvegardes des fichiers modifiés
- Génère un rapport détaillé

### 3. Analyse des animations framer-motion

```bash
# Analyser les utilisations de framer-motion
npm run analyze:framer

# Analyse détaillée
npm run analyze:framer:verbose
```

Cet outil:
- Identifie les composants utilisant framer-motion
- Détecte les animations simples qui peuvent être remplacées par des animations CSS
- Génère un rapport avec des recommandations de remplacement

### 4. Optimisation globale

```bash
# Exécuter tous les outils d'optimisation
npm run optimize:all
```

## Bibliothèques d'alternatives légères

### 1. Utilitaires natifs

Nous avons créé une bibliothèque d'utilitaires natifs pour remplacer les fonctions courantes de lodash:

```typescript
// Avant
import { debounce } from 'lodash';

// Après
import { debounce } from '@/utils/optimized-utils';
```

Fonctions disponibles:
- debounce
- throttle
- deepClone (remplacement de cloneDeep)
- get
- groupBy
- uniq / uniqBy
- chunk
- omit / pick
- rafThrottle (optimisé pour requestAnimationFrame)
- isEmpty
- flatten / flattenDeep
- memoize

### 2. Animations CSS

Nous avons créé une bibliothèque d'animations CSS pour remplacer framer-motion:

```tsx
// Avant
import { motion } from 'framer-motion';

function Component() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      Contenu
    </motion.div>
  );
}

// Après avec classes CSS
function Component() {
  return (
    <div className="animate-fade-in">
      Contenu
    </div>
  );
}

// Ou avec composant optimisé
import OptimizedAnimatedBox from '@/components/ui/OptimizedAnimatedBox';

function Component() {
  return (
    <OptimizedAnimatedBox animation="fadeIn">
      Contenu
    </OptimizedAnimatedBox>
  );
}
```

### 3. Composants UI optimisés

Nous avons créé des composants UI optimisés qui utilisent Tailwind CSS au lieu de Chakra UI ou styled-components:

```tsx
// Avant
import { Button } from '@chakra-ui/react';

// Après
import OptimizedButton from '@/components/ui/OptimizedButton';
```

## Stratégie d'implémentation recommandée

1. **Analyse**: Exécuter `npm run analyze-bundle` pour identifier les bibliothèques les plus volumineuses
2. **Optimisation Lodash**: Exécuter `npm run optimize:lodash` pour optimiser les imports Lodash
3. **Animations CSS**: Analyser avec `npm run analyze:framer` et remplacer progressivement framer-motion
4. **Composants UI**: Remplacer progressivement les composants Chakra UI et styled-components par nos composants optimisés
5. **Chargement dynamique**: Implémenter le chargement dynamique pour les composants non critiques
6. **Mesure**: Utiliser `npm run audit:all` pour vérifier l'impact des optimisations

## Mesure de l'impact

Après chaque optimisation majeure, il est recommandé de mesurer l'impact:

```bash
# Audit complet des performances
npm run audit:all

# Audit du LCP spécifiquement
npm run audit:lcp

# Audit des Web Vitals
npm run audit:vitals
```

## Backups et sécurité

Tous les outils d'optimisation créent des sauvegardes des fichiers modifiés dans le dossier `backups/`. Si nécessaire, ces fichiers peuvent être restaurés manuellement.

## Ressources supplémentaires

- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation AnimeJS](https://animejs.com/documentation/)
- [Guide d'optimisation Next.js](https://nextjs.org/docs/advanced-features/measuring-performance) 