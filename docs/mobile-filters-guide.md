# Guide d'implémentation - Filtres Mobiles Optimisés

Ce document explique comment mettre en œuvre et utiliser le nouveau composant de filtres mobiles optimisés avec un modal dédié dans l'application Reboul.

## Vue d'ensemble

Le nouveau composant `MobileFilterModal` offre une expérience utilisateur fluide et optimisée pour les filtres sur appareils mobiles, avec les caractéristiques suivantes :

- Interface utilisateur en plein écran optimisée pour le mobile
- Prévisualisation du nombre de résultats en temps réel
- Animation fluide et transitions entre les états
- Gestion locale des filtres avec application différée
- Compteur visuel des filtres actifs

## Intégration

Pour intégrer le modal de filtres mobiles dans un composant, suivez ces étapes :

### 1. Importation

```tsx
import { MobileFilterModal } from '@/components/catalogue/MobileFilterModal'
```

### 2. Initialisation de l'état

```tsx
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
```

### 3. Fonction de gestion des changements de filtres

```tsx
const handleMobileFilterChange = (newFilters: Record<string, string>) => {
  // Utiliser la fonction handleFilterChange existante pour maintenir la cohérence
  Object.entries(newFilters).forEach(([key, value]) => {
    handleFilterChange({ [key]: value })
  })
}
```

### 4. Ajout du bouton déclencheur

```tsx
<Button 
  variant="outline" 
  size="icon"
  className="h-8 sm:h-10 aspect-square rounded-full border-border/30 bg-background/80 backdrop-blur-md relative"
  onClick={() => setIsFilterModalOpen(true)}
>
  <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
  {activeFilterCount > 0 && (
    <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
      {activeFilterCount}
    </Badge>
  )}
</Button>
```

### 5. Intégration du composant modal

```tsx
<MobileFilterModal
  isOpen={isFilterModalOpen}
  onClose={() => setIsFilterModalOpen(false)}
  filters={filters}
  categories={categories}
  brands={brands}
  colors={colors}
  sizes={sizes}
  availableColors={availableColors}
  availableSizes={availableSizes}
  onApplyFilters={handleMobileFilterChange}
/>
```

## Fonctionnalités principales

### Prévisualisation des résultats

Le modal permet de voir en temps réel le nombre de produits correspondants aux filtres sélectionnés avant de les appliquer. Cette fonctionnalité :

- Effectue une requête API avec les filtres actuels
- Affiche le nombre total de résultats
- Montre un indicateur de chargement pendant la requête
- Permet à l'utilisateur de décider s'il souhaite appliquer les filtres

### Gestion locale des filtres

Les filtres sont gérés localement dans le modal jusqu'à ce que l'utilisateur décide de les appliquer :

1. Les filtres actuels sont copiés dans un état local à l'ouverture du modal
2. Les modifications sont appliquées uniquement à cet état local
3. L'application des filtres à l'ensemble de l'application ne se fait qu'à la validation

### Animation et transitions

Le modal utilise Framer Motion pour des animations fluides :

- Animation d'entrée avec un effet de glissement depuis la gauche
- Animation de sortie avec retour à gauche
- Overlay qui s'affiche et disparaît en fondu
- Délai de fermeture pour permettre aux animations de se terminer

## Détails d'implémentation

### Structure du composant

- **En-tête** : Titre, compteur de filtres actifs, bouton de fermeture
- **Contenu** : Composant `FilterComponent` standard avec tous les filtres disponibles
- **Pied de page** : Prévisualisation des résultats, boutons de réinitialisation et d'application

### Gestion des états

Le composant gère plusieurs états :

- `localFilters` : Copie locale des filtres modifiés dans le modal
- `activeFilterCount` : Nombre de filtres actifs
- `previewCount` : Nombre de résultats selon les filtres actuels
- `isLoading` : État de chargement pendant la prévisualisation
- `isClosing` : Indique que le modal est en train de se fermer

### API de prévisualisation

La prévisualisation utilise l'API standard `fetchProducts` avec :

- La limite fixée à 1 (on a juste besoin du total)
- Les filtres actuels du modal
- Gestion des erreurs et des états de chargement

## Avantages UX

Cette implémentation offre plusieurs avantages :

1. Réduction des requêtes API inutiles (les filtres sont appliqués seulement à la validation)
2. Retour visuel immédiat sur l'impact des filtres (nombre de résultats)
3. Expérience fluide avec animations et transitions
4. Interface dédiée au mobile adaptée aux petits écrans
5. Cohérence visuelle avec le reste de l'application

## Notes de développement

- La prévisualisation des résultats nécessite que l'API `fetchProducts` renvoie le nombre total d'éléments.
- L'API doit supporter la pagination avec `page` et `limit` comme paramètres.
- Pour optimiser les performances, un système de debounce pourrait être implémenté pour la prévisualisation.

## Prochaines optimisations possibles

- Mise en cache des résultats de prévisualisation pour des combinaisons de filtres récentes
- Ajout d'une barre de recherche dédiée dans le modal
- Ajout d'un bouton "Voir les résultats" qui applique les filtres et ferme le modal
- Support multi-sélection pour les filtres comme les catégories ou les marques 