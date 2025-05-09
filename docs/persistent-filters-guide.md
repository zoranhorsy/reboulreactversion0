# Guide d'implémentation - Filtres Persistants entre Sessions

Ce document décrit l'implémentation et le fonctionnement des filtres persistants entre sessions pour l'application Reboul.

## Vue d'ensemble

La fonctionnalité de filtres persistants permet aux utilisateurs de retrouver leurs critères de filtrage lorsqu'ils reviennent sur le catalogue, améliorant ainsi considérablement l'expérience utilisateur en:

- Sauvegardant automatiquement les filtres utilisés dans le `localStorage`
- Restaurant les filtres précédents lorsque l'utilisateur revient sur la page catalogue
- Notifiant l'utilisateur lorsque des filtres ont été restaurés
- Offrant la possibilité de réinitialiser facilement les filtres restaurés

## Fonctionnement

### Sauvegarde des filtres

Les filtres sont sauvegardés dans le `localStorage` du navigateur à chaque modification. La sauvegarde est effectuée de manière optimisée:

1. Les filtres vides ne sont pas sauvegardés
2. Les paramètres de pagination (`page` et `limit`) sont exclus de la sauvegarde
3. La sauvegarde est supprimée lorsque tous les filtres sont réinitialisés

```tsx
// Sauvegarder les filtres dans localStorage à chaque changement
useEffect(() => {
  try {
    // Ne pas sauvegarder page et limit pour éviter de restaurer à une page spécifique
    const { page, limit, ...filtersToSave } = filters
    
    // Vérifier s'il y a des filtres actifs à sauvegarder
    const hasActiveFilters = Object.entries(filtersToSave).some(
      ([key, value]) => value && value !== ""
    )
    
    if (hasActiveFilters) {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave))
    } else {
      // Si tous les filtres sont vides, supprimer la sauvegarde
      localStorage.removeItem(FILTERS_STORAGE_KEY)
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des filtres:", error)
  }
}, [filters])
```

### Restauration des filtres

La restauration des filtres est effectuée lors de l'initialisation du composant, avec une logique précise:

1. Vérification de la présence de filtres dans les paramètres d'URL
2. Si aucun filtre actif n'est présent dans l'URL, tentative de restauration depuis le localStorage
3. Si des filtres sont restaurés, une notification est affichée à l'utilisateur

```tsx
const initializeFilters = () => {
  // Obtenir les filtres des paramètres d'URL
  const urlFilters: FilterState = {
    // ...définition des filtres depuis l'URL
  }

  // Vérifier si les paramètres d'URL contiennent des filtres actifs
  const hasActiveUrlFilters = Object.entries(urlFilters).some(
    ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
  )

  // Si les paramètres d'URL sont vides, essayer de récupérer du localStorage
  if (!hasActiveUrlFilters) {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY)
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters) as FilterState
        
        // Flag pour indiquer que les filtres ont été restaurés
        setTimeout(() => {
          setFiltersRestored(true)
        }, 1000)
        
        // Restaurer les filtres sauvegardés, mais garder page et limit des URL
        return {
          ...parsedFilters,
          page: urlFilters.page,
          limit: urlFilters.limit
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des filtres:", error)
    }
  }

  return urlFilters
}
```

### Notification utilisateur

Une notification est affichée pour informer l'utilisateur que ses filtres précédents ont été restaurés:

```tsx
useEffect(() => {
  if (filtersRestored) {
    // Réinitialiser le drapeau pour éviter de montrer la notification à nouveau
    setFiltersRestored(false)
    
    // Compter le nombre de filtres actifs
    const activeFiltersCount = Object.entries(filters).filter(
      ([key, value]) => value && value !== "" && key !== "page" && key !== "limit"
    ).length
    
    toast({
      title: "Filtres restaurés",
      description: `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} de votre session précédente ${activeFiltersCount > 1 ? 'ont été restaurés' : 'a été restauré'}.`,
      action: (
        <ToastAction altText="Réinitialiser" onClick={resetFilters}>
          Réinitialiser
        </ToastAction>
      ),
      duration: 5000
    })
  }
}, [filtersRestored])
```

### Réinitialisation des filtres

Les filtres peuvent être réinitialisés via un bouton dédié, qui:
1. Efface tous les filtres actifs
2. Supprime la sauvegarde dans le localStorage
3. Affiche une confirmation à l'utilisateur

```tsx
const resetFilters = () => {
  const defaultFilters: Partial<FilterState> = {
    // ...définition des filtres par défaut
  }
  
  // Supprimer les filtres sauvegardés dans localStorage
  try {
    localStorage.removeItem(FILTERS_STORAGE_KEY)
  } catch (error) {
    console.error("Erreur lors de la suppression des filtres:", error)
  }
  
  setSearchQuery("")
  handleFilterChange(defaultFilters)
}
```

## Avantages UX

Cette implémentation offre plusieurs avantages pour l'expérience utilisateur:

1. **Continuité de l'expérience** : Les utilisateurs peuvent reprendre leur navigation là où ils l'avaient laissée
2. **Transparence** : Une notification claire indique que des filtres ont été restaurés
3. **Contrôle utilisateur** : Possibilité de réinitialiser facilement les filtres restaurés
4. **Performance** : Sauvegarde optimisée, ne stockant que les filtres actifs
5. **Compatibilité avec les URLs** : Les paramètres d'URL ont priorité sur les filtres sauvegardés

## Considérations techniques

- Les filtres sont stockés dans le `localStorage` sous la clé `reboul-catalogue-filters`
- La taille maximale de stockage est d'environ 5MB, ce qui est largement suffisant pour les filtres
- Les filtres ne contiennent pas d'informations sensibles, il n'y a donc pas de risque de sécurité
- Le `localStorage` est spécifique au navigateur et à l'origine (domaine), garantissant que les filtres sont isolés par utilisateur

## Évolutions possibles

- **Synchronisation multi-onglets** : Utiliser BroadcastChannel API pour synchroniser les filtres entre plusieurs onglets
- **Expiration des filtres** : Ajouter une date d'expiration pour effacer les filtres trop anciens
- **Filtres favoris** : Permettre aux utilisateurs de sauvegarder et nommer plusieurs ensembles de filtres
- **Synchronisation compte utilisateur** : Pour les utilisateurs connectés, sauvegarder les filtres dans leur profil 