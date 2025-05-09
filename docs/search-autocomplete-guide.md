# Guide d'implémentation - Système de Suggestion et Autocomplete

Ce document détaille l'implémentation et l'utilisation du système de suggestions et d'autocomplétion pour la recherche dans le catalogue de l'application Reboul.

## Vue d'ensemble

Le système de suggestions et d'autocomplétion améliore l'expérience utilisateur lors de la recherche de produits en :

- Proposant des suggestions de produits en temps réel pendant la saisie
- Affichant également des suggestions de catégories et de marques correspondantes
- Permettant la sélection directe des suggestions avec navigation instantanée
- Réduisant les erreurs de saisie et le temps de recherche

## Composants

Le système repose sur deux composants principaux :

1. **Command** : Un composant de base basé sur la bibliothèque `cmdk` qui fournit la structure de menu de commande accessible
2. **SearchAutocomplete** : Le composant personnalisé qui utilise Command pour implémenter l'autocomplétion spécifique au catalogue

## Fonctionnalités

### Recherche en temps réel

Le composant effectue des recherches à mesure que l'utilisateur tape, avec un délai d'attente (debounce) pour éviter trop de requêtes :

```tsx
const searchProducts = useCallback(
  debounce(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setIsLoading(false)
      return
    }

    try {
      const results = await api.searchProducts(query)
      setSearchResults(results.slice(0, 5)) // Limiter à 5 résultats
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, 300),
  []
)
```

### Filtrage local des catégories et marques

En plus de la recherche de produits côté serveur, le composant filtre également localement les catégories et marques :

```tsx
const filteredCategories = categories
  .filter(category => category.name.toLowerCase().includes(inputValue.toLowerCase()))
  .slice(0, 3)

const filteredBrands = brands
  .filter(brand => brand.name.toLowerCase().includes(inputValue.toLowerCase()))
  .slice(0, 3)
```

### Navigation directe vers les catégories et marques

Le composant permet de naviguer directement vers une catégorie ou une marque :

```tsx
const handleSelect = (value: string, type: 'product' | 'category' | 'brand', id?: string) => {
  if (type === 'product') {
    onSearch(value)
  } else if (type === 'category' && onCategorySelect && id) {
    onCategorySelect(id)
  } else if (type === 'brand' && onBrandSelect && id) {
    onBrandSelect(id)
  }
  setOpen(false)
}
```

## Intégration

### Installation des dépendances

Le système nécessite les packages suivants :

```bash
npm install cmdk lodash @types/lodash
```

### Utilisation dans un composant

Pour utiliser le composant `SearchAutocomplete` :

```tsx
import { SearchAutocomplete } from '@/components/catalogue/SearchAutocomplete'

// ...

<SearchAutocomplete
  value={searchQuery}
  onSearch={(value) => {
    setSearchQuery(value)
    handleFilterChange({ search: value })
  }}
  categories={categories}
  brands={brands}
  onCategorySelect={(categoryId) => {
    handleFilterChange({ category_id: categoryId })
  }}
  onBrandSelect={(brandId) => {
    handleFilterChange({ brand_id: brandId })
  }}
  placeholder="Rechercher un produit..."
  className="w-full"
/>
```

## Interface API

### Props du composant SearchAutocomplete

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Valeur actuelle de la recherche |
| `onSearch` | `(value: string) => void` | Fonction appelée lorsqu'une recherche est effectuée |
| `categories` | `Category[]` | Liste des catégories disponibles |
| `brands` | `Brand[]` | Liste des marques disponibles |
| `placeholder` | `string` (optionnel) | Texte d'exemple affiché dans le champ de recherche |
| `className` | `string` (optionnel) | Classes CSS supplémentaires |
| `onCategorySelect` | `(categoryId: string) => void` (optionnel) | Fonction appelée lorsqu'une catégorie est sélectionnée |
| `onBrandSelect` | `(brandId: string) => void` (optionnel) | Fonction appelée lorsqu'une marque est sélectionnée |

## Fonctionnement technique

### Gestion de l'état

Le composant gère plusieurs états :

- `open` : Indique si le menu de suggestions est ouvert
- `searchResults` : Résultats de la recherche API
- `inputValue` : Valeur actuelle du champ de recherche
- `isLoading` : État de chargement pendant la recherche

### Interaction utilisateur

1. L'utilisateur commence à taper dans le champ de recherche
2. Après un délai de 300ms (debounce), une requête API est effectuée
3. Pendant ce temps, les catégories et marques sont filtrées localement
4. Les résultats s'affichent dans un menu déroulant organisé par sections
5. L'utilisateur peut cliquer sur un résultat ou continuer à taper
6. La sélection d'un élément ferme le menu et applique la recherche ou la navigation

### Optimisations

- **Debounce** : Limite les appels API pendant la saisie
- **Limite de résultats** : Affiche seulement les 5 premiers produits et 3 premières catégories/marques
- **Chargement optimisé** : Affiche un indicateur de chargement pendant les requêtes
- **Fermeture intelligente** : Le menu se ferme si l'utilisateur clique en dehors ou sélectionne un élément

## Avantages UX

Cette implémentation offre plusieurs avantages pour l'expérience utilisateur :

1. **Rapidité de recherche** : Les utilisateurs trouvent plus rapidement ce qu'ils cherchent
2. **Réduction des erreurs** : Les suggestions aident à éviter les erreurs de frappe
3. **Découvrabilité** : Expose les catégories et marques pertinentes durant la recherche
4. **Navigation efficace** : Permet d'aller directement aux catégories ou marques sans passer par les menus

## Évolutions possibles

- **Historique de recherche** : Sauvegarder et afficher les recherches récentes de l'utilisateur
- **Suggestions intelligentes** : Afficher des suggestions basées sur le comportement de l'utilisateur
- **Images produits** : Ajouter des miniatures d'images pour les suggestions de produits
- **Filtres rapides** : Permettre de filtrer les résultats directement depuis le menu de suggestions 