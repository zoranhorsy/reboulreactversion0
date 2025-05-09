# Recommandations d'optimisation de dépendances JavaScript

## Dépendances potentiellement optimisables

### 1. Importations spécifiques vs globales

#### Lodash
Remplacer les imports globaux par des imports spécifiques:
```js
// Avant - Importe tout Lodash (~70KB)
import debounce from 'lodash/debounce';

// Après - Importe seulement ce dont vous avez besoin (~2KB)
import debounce from 'lodash/debounce';
```

**Impact estimé**: Réduction de 20-50KB gzippé selon le nombre d'utilisations.


### 2. Bibliothèques redondantes



#### styled-components vs Tailwind CSS
Standardiser sur Tailwind qui est déjà utilisé:
```jsx
// Avant avec styled-components (~12KB)
const StyledButton = styled.button`
  background-color: #7257fa;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
`;

// Après avec Tailwind CSS (déjà inclus)
<button className="bg-[#7257fa] text-white py-2 px-4 rounded">
  Bouton
</button>
```

**Impact estimé**: Réduction de ~15KB gzippé.


#### Bibliothèques d'animation multiples
Vous utilisez actuellement: gsap, animejs, framer-motion. Standardiser sur une seule:

**GSAP**: Meilleure performance et puissance, mais plus lourd (~30KB)
**AnimeJS**: Bon équilibre taille/fonctionnalités (~8KB)
**Framer Motion**: Intégration React native, mais plus lourd (~25KB)

**Impact estimé**: Réduction de 10-40KB gzippé selon la bibliothèque choisie.


#### Bibliothèques UI multiples
Vous utilisez actuellement: Chakra UI, Radix UI, Emotion. Standardiser sur une seule:

**Radix UI**: Bibliothèque headless, très léger (~20KB combiné pour tous les composants)
**Chakra UI**: Plus complet mais plus lourd (~80KB)

**Impact estimé**: Réduction de 30-70KB gzippé selon la bibliothèque choisie.


### 3. Optimisations des imports

#### Utiliser des imports dynamiques pour les fonctionnalités non critiques
```js
// Avant - Chargé immédiatement
import { complexChart } from '@/components/Charts';

// Après - Chargé uniquement lorsque nécessaire
const loadChart = async () => {
  const { complexChart } = await import('@/components/Charts');
  return complexChart;
};
```

#### Prioriser les bibliothèques natives du navigateur
```js
// Avant - Dépendance externe
import { formatCurrency } from 'some-currency-lib';

// Après - API native
const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(value);
};
```

## Plan d'action recommandé

1. Remplacer les imports lodash globaux par des imports spécifiques
2. Éliminer moment.js en faveur de date-fns
3. Migrer progressivement de styled-components vers Tailwind CSS
4. Standardiser sur une seule bibliothèque d'animation
5. Réduire l'utilisation de multiples bibliothèques UI
6. Auditer les importations pour détecter les bibliothèques non utilisées

**Gain potentiel estimé**: 100-200KB de JavaScript gzippé en moins.
