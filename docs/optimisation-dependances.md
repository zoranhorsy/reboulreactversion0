# Guide d'optimisation des dépendances JavaScript

Ce document fournit des instructions pour réduire la taille du bundle JavaScript en optimisant l'utilisation des dépendances lourdes et en les remplaçant par des alternatives plus légères.

## Table des matières

1. [Analyse des dépendances](#analyse-des-dépendances)
2. [Optimisation des imports Lodash](#optimisation-des-imports-lodash)
3. [Remplacement de styled-components](#remplacement-de-styled-components)
4. [Standardisation des bibliothèques d'animation](#standardisation-des-bibliothèques-danimation)
5. [Réduction des bibliothèques UI](#réduction-des-bibliothèques-ui)
6. [Code splitting agressif](#code-splitting-agressif)
7. [Suivi des progrès](#suivi-des-progrès)

## Analyse des dépendances

Avant de commencer l'optimisation, analysez les dépendances du projet avec notre script d'analyse :

```bash
node src/scripts/performance/analyze-bundle.js
```

Ce script génère un rapport détaillé dans `reports/bundle-analysis/dependency-recommendations.md` qui identifie les opportunités d'optimisation.

## Optimisation des imports Lodash

### Problème
L'importation globale de Lodash (`import { x } from 'lodash'`) charge l'intégralité de la bibliothèque (~70KB), même si nous n'utilisons qu'une seule fonction.

### Solution

#### 1. Utiliser des imports spécifiques

```javascript
// AVANT - Charge toute la bibliothèque Lodash (~70KB)
import { debounce } from 'lodash';

// APRÈS - Charge uniquement la fonction nécessaire (~2KB)
import debounce from 'lodash/debounce';
```

#### 2. Remplacer par des utilitaires natifs

Pour les fonctions courantes, utilisez nos utilitaires optimisés :

```javascript
// AVANT - Dépendance externe
import { debounce } from 'lodash';

// APRÈS - Utilitaire interne
import { debounce } from '@/lib/utils/optimized-utils';
```

Les utilitaires optimisés sont disponibles dans `src/lib/utils/optimized-utils.ts` et incluent :
- `debounce` - Limite les appels à une fonction
- `throttle` - Limite la fréquence d'appels
- `deepClone` - Clone profondément un objet
- `get` - Accède à des propriétés imbriquées en toute sécurité
- `pick` / `omit` - Sélectionne/omet des propriétés d'un objet
- `chunk` - Divise un tableau en groupes
- `uniq` / `uniqBy` - Crée un tableau sans doublons

## Remplacement de styled-components

### Problème
styled-components (~12KB) fait double emploi avec Tailwind CSS, déjà présent dans le projet.

### Solution

#### 1. Migrer vers les classes Tailwind

```jsx
// AVANT - avec styled-components
const StyledButton = styled.button`
  background-color: #7257fa;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
`;

// APRÈS - avec Tailwind CSS
<button className="bg-[#7257fa] text-white px-4 py-2 rounded font-semibold">
  Bouton
</button>
```

#### 2. Pour les styles dynamiques, utiliser cn() ou clsx

```jsx
// AVANT - avec styled-components
const StyledButton = styled.button<{ $isPrimary: boolean }>`
  background-color: ${props => props.$isPrimary ? '#7257fa' : 'transparent'};
  color: ${props => props.$isPrimary ? 'white' : '#7257fa'};
  border: 1px solid #7257fa;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
`;

// APRÈS - avec Tailwind et cn()
import { cn } from '@/lib/utils';

<button className={cn(
  "border border-[#7257fa] px-4 py-2 rounded",
  isPrimary ? "bg-[#7257fa] text-white" : "bg-transparent text-[#7257fa]"
)}>
  Bouton
</button>
```

## Standardisation des bibliothèques d'animation

### Problème
Le projet utilise plusieurs bibliothèques d'animation (GSAP, AnimeJS, Framer Motion) qui se chevauchent en fonctionnalités.

### Solution

#### 1. Pour les animations simples, utiliser le CSS natif

Nous avons créé une bibliothèque d'utilitaires d'animation CSS dans `src/styles/animation-utils.css`, qui peut remplacer de nombreuses animations simples.

```jsx
// AVANT - avec Framer Motion
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Contenu
</motion.div>

// APRÈS - avec classes CSS
<div className="animate-fade-in duration-300">
  Contenu
</div>
```

#### 2. Standardiser sur une seule bibliothèque pour les animations complexes

Pour les animations complexes qui nécessitent une bibliothèque JavaScript, standardisez sur GSAP qui est déjà utilisé pour ses performances.

```jsx
// Utiliser notre hook optimisé
import { useOptimizedGsap } from '@/components/optimized/OptimizedGsap';

function AnimatedComponent() {
  const { isInitialized } = useOptimizedGsap((gsap, ScrollTrigger) => {
    // Animation GSAP ici
    gsap.to('.element', { 
      x: 100, 
      duration: 1, 
      scrollTrigger: {
        trigger: '.element',
        start: 'top center'
      }
    });
  });

  return (
    <div className="element">
      Contenu animé
    </div>
  );
}
```

## Réduction des bibliothèques UI

### Problème
Le projet utilise plusieurs bibliothèques UI (Chakra UI, Radix UI, Emotion) qui se chevauchent en fonctionnalités.

### Solution

#### 1. Standardiser sur Radix UI + Tailwind

Radix UI est une bibliothèque sans style qui s'intègre parfaitement avec Tailwind CSS, ce qui permet de réduire considérablement la taille du bundle.

```jsx
// AVANT - avec Chakra UI
import { Button } from '@chakra-ui/react';

<Button colorScheme="blue" onClick={handleClick}>Cliquez-moi</Button>

// APRÈS - avec Radix UI + Tailwind
import { Button } from '@/components/ui/button';

<Button variant="primary" onClick={handleClick}>Cliquez-moi</Button>
```

#### 2. Migration progressive

1. Identifiez tous les composants utilisant Chakra UI avec `grep -r "from '@chakra-ui/react'" src/`
2. Créez des composants équivalents en utilisant Radix UI + Tailwind
3. Remplacez progressivement les importations dans chaque fichier

## Code splitting agressif

### Problème
Le bundle JavaScript initial est trop volumineux (4.8-6.3MB), ce qui ralentit le chargement initial et le temps d'interactivité (TTI).

### Solution

#### 1. Chargement différé des composants sous la fold

Nous avons créé un composant `LazyLoadOnView` qui permet de charger dynamiquement des composants uniquement lorsqu'ils deviennent visibles dans le viewport.

```jsx
import { LazyLoadOnView } from '@/components/optimized/LazyLoadOnView';

function HomePage() {
  return (
    <div>
      {/* Contenu immédiatement visible */}
      <HeroSection />
      <FeaturedProducts />
      
      {/* Composants chargés uniquement lorsqu'ils deviennent visibles */}
      <LazyLoadOnView
        importFn={() => import('@/components/RecentlyViewedProducts')}
        fallback={<div className="h-64 w-full animate-pulse bg-zinc-100/10 rounded-md" />}
      />
      
      <LazyLoadOnView
        importFn={() => import('@/components/Newsletter')}
        fallback={<div className="h-32 w-full animate-pulse bg-zinc-100/10 rounded-md" />}
      />
    </div>
  );
}
```

#### 2. Helper pour créer facilement des composants à chargement différé

Pour simplifier l'utilisation, vous pouvez créer des composants réutilisables :

```jsx
import { createLazyComponent } from '@/components/optimized/LazyLoadOnView';

// Création de composants à chargement différé
const LazyRecentlyViewedProducts = createLazyComponent(
  () => import('@/components/RecentlyViewedProducts'),
  {
    fallback: <div className="h-64 w-full animate-pulse bg-zinc-100/10 rounded-md" />
  }
);

const LazyNewsletter = createLazyComponent(
  () => import('@/components/Newsletter'),
  {
    fallback: <div className="h-32 w-full animate-pulse bg-zinc-100/10 rounded-md" />
  }
);

function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      
      {/* Utilisation simplifiée */}
      <LazyRecentlyViewedProducts />
      <LazyNewsletter />
    </div>
  );
}
```

#### 3. Priorisation des composants critiques

Segmentez vos composants par priorité :

1. **Critique** (chargé immédiatement) :
   - Composants above-the-fold
   - Navigation principale
   - Contenu de la page centrale

2. **Important** (chargé de manière différée avec priorité) :
   - Fonctionnalités interactives secondaires
   - Composants juste en-dessous de la fold

3. **Non critique** (chargé uniquement lorsque visible) :
   - Footer
   - Widgets sociaux
   - Sections complémentaires
   - Sections d'aide et FAQ

#### 4. Routes dynamiques

Utiliser le chargement dynamique pour les pages entières :

```jsx
// Dans le fichier de routage (app/page.tsx)
import dynamic from 'next/dynamic';

// Chargement paresseux des pages complètes
const AboutPage = dynamic(() => import('./about/page'),
  { loading: () => <LoadingIndicator /> }
);

const ContactPage = dynamic(() => import('./contact/page'),
  { loading: () => <LoadingIndicator /> }
);
```

#### 5. Préchargement intelligent

Pour les liens sur lesquels l'utilisateur est susceptible de cliquer, implémenter un préchargement au survol :

```jsx
function NavLink({ href, children }) {
  const router = useRouter();
  
  const handleMouseEnter = () => {
    // Préchargement de la page au survol
    router.prefetch(href);
  };
  
  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

### Meilleures pratiques pour le code splitting

1. **Analysez avant d'optimiser** : Utilisez `analyze-bundle.js` pour identifier les plus gros composants

2. **Limiter la taille des chunks** :
   - Visez des chunks de 100-200KB maximum
   - Évitez de diviser des composants très petits (<20KB)
   
3. **Gérer les états de chargement** :
   - Toujours fournir un placeholder/skeleton adéquat
   - Éviter les changements de layout (CLS) lors du chargement

4. **Ordre de chargement stratégique** :
   - Prioriser les ressources critiques avec `<link rel="preload">`
   - Différer les scripts non critiques avec `<script defer>`

## Suivi des progrès

### Mesurer l'impact

Après chaque optimisation majeure, mesurez l'impact sur la taille du bundle :

```bash
# Audit des performances avant et après les changements
npm run audit:vitals
```

### Indicateurs clés à surveiller

- **TTI (Time to Interactive)** : Objectif <3.8s
- **Taille du bundle JavaScript** : Objectif <2MB
- **TBT (Total Blocking Time)** : Objectif <100ms 