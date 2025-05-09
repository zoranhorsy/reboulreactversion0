# Plan de Remplacement des Bibliothèques Volumineuses

## 1. Bibliothèques UI

### Problème
Notre application utilise plusieurs bibliothèques UI concurrentes:
- Chakra UI (@chakra-ui/react) - ~80KB
- Radix UI (multiples packages @radix-ui/react-*) - ~20KB combinés
- styled-components - ~15KB
- Tailwind CSS - déjà inclus dans le build

### Solution
1. **Standardiser sur Radix UI + Tailwind CSS**:
   - Radix UI fournit des composants headless accessibles
   - Tailwind CSS permet le styling sans CSS-in-JS additionnel
   - Éliminer progressivement Chakra UI et styled-components

2. **Plan de migration**:
   - Identifier les composants Chakra UI les plus utilisés
   - Créer des composants équivalents avec Radix UI + Tailwind
   - Remplacer progressivement en commençant par les pages les plus importantes

3. **Gain estimé**: ~95KB de JavaScript

## 2. Bibliothèques d'Animation

### Problème
Nous utilisons trois bibliothèques d'animation concurrentes:
- GSAP (gsap, @gsap/react) - ~30KB
- Framer Motion (framer-motion) - ~25KB
- AnimeJS (animejs) - ~8KB

### Solution
1. **Standardiser sur AnimeJS** pour la plupart des animations:
   - Plus léger que les alternatives
   - API simple et puissante

2. **Animations CSS natives** pour les animations simples:
   - Transitions
   - Transformations
   - Keyframes pour animations plus complexes

3. **Plan de migration**:
   - Créer une bibliothèque d'utilitaires d'animation avec AnimeJS
   - Convertir progressivement les animations GSAP et Framer Motion
   - Utiliser les animations CSS pour les cas simples

4. **Gain estimé**: ~50KB de JavaScript

## 3. Utilitaires Lodash

### Problème
Lodash est importé globalement dans plusieurs fichiers (~70KB).

### Solution
1. **Importer uniquement les fonctions nécessaires**:
   ```js
   // Avant
   import { debounce, throttle } from 'lodash';
   
   // Après
   import debounce from 'lodash/debounce';
   import throttle from 'lodash/throttle';
   ```

2. **Remplacer par des implémentations natives lorsque possible**:
   ```js
   // Lodash map
   import map from 'lodash/map';
   const result = map(items, item => item.value);
   
   // JavaScript natif
   const result = items.map(item => item.value);
   ```

3. **Créer une bibliothèque d'utilitaires personnalisés** pour les fonctions courantes:
   - debounce/throttle
   - deep clone
   - array/object manipulation

4. **Plan de migration**:
   - Créer un script pour identifier tous les imports Lodash
   - Remplacer par des imports spécifiques
   - Créer des implémentations natives pour les fonctions courantes
   
5. **Gain estimé**: ~50KB de JavaScript

## 4. Autres Optimisations

### Three.js
- Importer uniquement les modules nécessaires plutôt que le package complet
- Charger dynamiquement Three.js uniquement sur les pages qui l'utilisent

### Swiper
- Envisager react-slick ou une solution plus légère
- Charger dynamiquement uniquement sur les pages utilisant des carousels

### Recharts
- Charger dynamiquement uniquement sur les pages d'administration
- Envisager des alternatives plus légères (Chart.js, visx)

## Plan d'Implémentation

### Phase 1: Analyse et Préparation
1. Exécuter une analyse complète du bundle pour identifier les bibliothèques les plus volumineuses
2. Créer des utilitaires natifs pour remplacer les fonctions Lodash courantes
3. Créer une bibliothèque d'animations CSS pour les cas simples

### Phase 2: Lodash et Utilitaires
1. Convertir tous les imports Lodash en imports spécifiques
2. Remplacer les fonctions Lodash par des alternatives natives lorsque possible
3. Mesurer l'impact sur la taille du bundle

### Phase 3: Animations
1. Standardiser sur AnimeJS pour les animations complexes
2. Créer des composants d'animation réutilisables
3. Remplacer progressivement GSAP et Framer Motion

### Phase 4: UI Components
1. Créer des composants UI standards avec Radix + Tailwind
2. Remplacer progressivement Chakra UI et styled-components
3. Mesurer l'impact final sur la taille du bundle

## Métriques de Succès
- Réduction de la taille du bundle JavaScript de 30-40%
- Amélioration des métriques Web Vitals (TTI, TBT)
- Maintien de l'expérience utilisateur et des fonctionnalités 