# Optimisation des Gestionnaires d'Événements

Ce document explique comment nous avons optimisé les gestionnaires d'événements dans l'application Reboul pour réduire le blocage du thread principal et améliorer les performances globales.

## Le problème

Les gestionnaires d'événements (event handlers) dans une application web peuvent causer des blocages du thread principal quand:

1. Ils sont appelés très fréquemment (ex: `scroll`, `mousemove`, `resize`)
2. Ils effectuent des opérations coûteuses (ex: calculs complexes, manipulation du DOM, etc.)
3. Plusieurs gestionnaires sont attachés aux mêmes événements

Cela peut entraîner:
- Une interface utilisateur non réactive
- Des animations saccadées
- Un mauvais score sur les métriques Web Vitals (notamment TBT - Total Blocking Time)

## Solutions d'optimisation

Nous avons implémenté trois stratégies principales pour optimiser les gestionnaires d'événements:

### 1. Debounce

```typescript
// Exemple avec debounce
const debouncedHandler = debounce(() => {
  // Code coûteux exécuté uniquement après un délai sans événement
}, 200);

window.addEventListener('resize', debouncedHandler);
```

- **Cas d'utilisation**: Idéal pour les opérations qui doivent être exécutées à la fin d'une série d'événements
- **Fonctionnement**: Attend que les événements s'arrêtent pendant un délai spécifié avant d'exécuter le code
- **Avantages**: Réduit considérablement le nombre d'exécutions
- **Inconvénients**: Introduit un délai dans la réponse

### 2. Throttle

```typescript
// Exemple avec throttle
const throttledHandler = throttle(() => {
  // Code coûteux exécuté au maximum une fois tous les X ms
}, 100);

window.addEventListener('scroll', throttledHandler);
```

- **Cas d'utilisation**: Bon pour les opérations qui doivent être exécutées régulièrement pendant un événement continu
- **Fonctionnement**: Limite le taux d'exécution à une fois tous les X millisecondes
- **Avantages**: Garantit une exécution régulière sans surcharger le thread principal
- **Inconvénients**: Peut manquer certains événements entre les intervalles

### 3. requestAnimationFrame Throttle (rafThrottle)

```typescript
// Exemple avec rafThrottle
const rafThrottledHandler = rafThrottle(() => {
  // Code coûteux synchronisé avec le taux de rafraîchissement de l'écran
});

window.addEventListener('mousemove', rafThrottledHandler);
```

- **Cas d'utilisation**: Idéal pour les mises à jour visuelles qui doivent être synchronisées avec le rendu à l'écran
- **Fonctionnement**: Utilise `requestAnimationFrame` pour limiter l'exécution au taux de rafraîchissement de l'écran
- **Avantages**: 
  - Synchronisé avec le pipeline de rendu du navigateur
  - Aucun calcul n'est effectué pendant les frames où l'écran n'est pas rafraîchi
  - Meilleure fluidité visuelle
- **Inconvénients**: Pas adapté aux opérations qui doivent s'exécuter immédiatement

## Implémentation dans notre projet

Nous avons créé des utilitaires réutilisables dans `src/lib/utils.ts`:
- `debounce`: Pour les opérations nécessitant un délai
- `throttle`: Pour limiter la fréquence d'exécution
- `rafThrottle`: Pour les opérations visuelles synchronisées avec les frames d'animation

Et des hooks optimisés dans `src/hooks/optimized-events.ts`:
- `useOptimizedScroll`: Pour gérer efficacement les événements de défilement
- `useOptimizedMousePosition`: Pour gérer les mouvements de souris intensifs
- `useOptimizedResize`: Pour gérer les redimensionnements avec différentes stratégies

## Exemples d'optimisations réalisées

### Avant optimisation:

```typescript
useEffect(() => {
  const handleScroll = () => {
    // Calculs potentiellement coûteux à chaque événement de défilement
    setIsScrolled(window.scrollY > 100);
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Après optimisation:

```typescript
useEffect(() => {
  const handleScroll = rafThrottle(() => {
    // Même calcul, mais exécuté de manière optimisée
    setIsScrolled(window.scrollY > 100);
  });
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## Composants optimisés

- `ProductGallery.tsx`: Optimisation du gestionnaire `handleMouseMove` pour le zoom d'image
- `CatalogueContent.tsx`: Optimisation du gestionnaire de défilement
- `useWindowSize.ts`: Optimisation des mises à jour de taille de fenêtre
- `OptimizedGsap.tsx`: Optimisation du rafraîchissement des animations au redimensionnement

## Résultats

Ces optimisations ont permis de:
- Réduire significativement le TBT (Total Blocking Time)
- Améliorer la fluidité des animations et interactions
- Réduire la charge sur le thread principal pendant les interactions utilisateur

## Recommandations pour les développements futurs

1. Toujours utiliser une stratégie d'optimisation pour les événements fréquents:
   - `scroll`, `mousemove`, `resize`, `touchmove`, etc.

2. Choisir la bonne stratégie selon le cas d'utilisation:
   - Mise à jour visuelle → `rafThrottle`
   - Action finale après une série d'événements → `debounce`
   - Limiter la fréquence d'exécution → `throttle`

3. Déplacer les opérations coûteuses vers les Web Workers quand c'est possible

4. Utiliser des outils comme Chrome DevTools Performance pour identifier les gestionnaires d'événements problématiques 