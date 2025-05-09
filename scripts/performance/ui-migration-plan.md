# Plan de Migration UI - Chakra UI → Radix UI + Tailwind CSS

## Objectif
Migrer progressivement notre application Reboul de Chakra UI vers Radix UI + Tailwind CSS pour réduire la taille du bundle et améliorer les performances.

## Composants prioritaires
1. ✅ Button et ButtonGroup
2. ✅ Box, Flex et autres composants de layout
3. 🔄 Menu et composants associés
4. Dialog/Modal
5. Select/Dropdown
6. Tabs
7. Tooltip
8. Form elements (Input, Checkbox, Radio, etc.)

## Méthodologie de migration

### Phase 1: Analyse et planification (Terminée)
- ✅ Identifier tous les composants Chakra UI utilisés dans l'application
- ✅ Analyser la taille du bundle actuellement occupée par Chakra UI
- ✅ Développer des scripts d'analyse pour faciliter la migration
- ✅ Établir un plan de migration progressif composant par composant

### Phase 2: Mise en place de l'infrastructure (Terminée)
- ✅ Configurer Tailwind CSS dans le projet
- ✅ Installer les dépendances Radix UI
- ✅ Créer les composants UI de base dans `src/components/ui/`
- ✅ Mettre en place des utilitaires de styles communs (`cn`, etc.)

### Phase 3: Migration des composants (En cours)
- ✅ Migrer Button et ButtonGroup (Mai 2025)
  - ✅ Créer les composants Button et ButtonGroup basés sur Radix UI
  - ✅ Fournir un guide de migration pour ces composants
  - ✅ Créer des scripts d'aide à la migration
  - ✅ Migrer les instances dans les composants principaux

- 🔄 Migrer Menu et composants associés (Juin 2025)
  - ✅ Créer le composant Menu basé sur Radix UI
  - ✅ Fournir un guide de migration pour ce composant
  - ✅ Créer des exemples de menus migrés
  - ✅ Créer un script d'aide à la migration (`migrate-chakra-menu.js`)
  - 🔄 Migration en cours des menus existants
    - ⚙️ Migration Dock.tsx (menu principal d'application)
    - ⚙️ Migration UserNav.tsx (menu de profil)
    - ⚙️ Migration des filtres dans CatalogueContent.tsx
    - ⚙️ Migration du menu de The Corner

- 🔄 Migrer les composants de formulaire (Juillet 2025)
  - ✅ Créer les composants de base (`Input`, `Textarea`, `Label`)
  - 🔄 Créer les composants avancés (`Select`, `Combobox`, `Checkbox`, `Radio`)
  - ⏳ Fournir un guide de migration pour ces composants
  - ⏳ Créer des scripts d'aide à la migration

- ⏳ Migrer les composants de navigation (Août 2025)
  - ⏳ Migrer Tabs, Breadcrumb, etc.
  - ⏳ Fournir des guides et scripts de migration

### Phase 4: Nettoyage et optimisation (Septembre 2025)
- ⏳ Supprimer progressivement les dépendances Chakra UI
- ⏳ Optimiser la configuration Tailwind
- ⏳ Analyser les gains de performance et impact sur la taille du bundle

## Ressources

### Guides de migration
- [Migration Button et ButtonGroup](../performance/migration-guide.md)
- [Migration Menu](../performance/menu-migration-guide.md)

### Scripts d'analyse et migration
- `analyze-ui-components.js` - Analyse tous les composants Chakra UI utilisés
- `chakra-to-radix.js` - Conversion générale de Chakra UI vers Radix UI
- `migrate-button-group.js` - Migration spécifique pour ButtonGroup
- `migrate-chakra-menu.js` - Migration spécifique pour Menu et composants associés

### Composants migrés
Tous les composants migrés sont disponibles dans `src/components/ui/`

### Exemples
- `src/components/examples/RadixButtonExample.jsx`
- `src/components/examples/TailwindBoxExample.jsx`
- `src/components/examples/ButtonGroupExample.tsx` 
- `src/components/examples/RadixMenuExample.jsx`

## Suivi de la migration

| Composant    | État       | Date       | Gain de taille |
|--------------|------------|------------|----------------|
| Button       | ✅ Terminé | Mai 2025   | ~15KB          |
| ButtonGroup  | ✅ Terminé | Mai 2025   | ~5KB           |
| Box/Flex     | ✅ Terminé | Mai 2025   | ~20KB          |
| Menu         | 🔄 En cours| Juin 2025  | ~10KB          |
| Dialog/Modal | ⏳ Planifié | Juillet 2025 | ~10KB estimé |
| Select       | ⏳ Planifié | Juillet 2025 | ~10KB estimé |
| Form elements| ⏳ Planifié | Juillet 2025 | ~15KB estimé |
| Tabs         | ⏳ Planifié | Août 2025  | ~5KB estimé   |

## Prochaines étapes (Juin 2025)
1. Terminer la migration des menus dans l'application
   - Finaliser la migration du menu principal (Dock.tsx)
   - Migrer les menus contextuels dans les pages produits
   - Migrer les menus de filtres du catalogue
2. Commencer la migration des formulaires
   - Identifier tous les champs de formulaire utilisant Chakra UI
   - Préparer le script de migration pour les formulaires
   - Migrer les formulaires de connexion et d'inscription
3. Préparer un rapport d'impact sur les performances après migration des menus
   - Mesure de la réduction de taille du bundle
   - Analyse des métriques Web Vitals après la migration

## Ressources complémentaires
- Documentation Radix UI: [https://www.radix-ui.com/docs/primitives](https://www.radix-ui.com/docs/primitives)
- Documentation Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- Outils d'analyse bundle: [https://bundlephobia.com/](https://bundlephobia.com/)

*Dernière mise à jour: 10 juin 2025* 