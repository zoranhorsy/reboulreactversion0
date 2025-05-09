# Guide de Migration: Chakra UI → Radix UI + Tailwind CSS

Ce guide fournit des instructions pratiques pour migrer progressivement les composants Chakra UI vers Radix UI + Tailwind CSS dans notre application Reboul.

## Pourquoi migrer?

- Réduction de la taille du bundle JavaScript (~95KB)
- Meilleure performance (pas de CSS-in-JS à l'exécution)
- Cohérence de l'interface utilisateur avec un système unique
- Accessibilité améliorée grâce aux primitifs Radix UI

## Composants disponibles

Les composants suivants ont déjà été migrés et sont disponibles dans `src/components/ui/`:

- ✅ Button (`@/components/ui/button`)
- ✅ ButtonGroup (`@/components/ui/button-group`)
- ✅ Menu (`@/components/ui/menu`)
- ✅ Dialog/Modal (`@/components/ui/dialog`)
- ✅ Select (`@/components/ui/select`)
- ✅ Tooltip (`@/components/ui/tooltip`)
- ✅ Drawer (`@/components/ui/drawer`)
- ✅ Accordion (`@/components/ui/accordion`)
- ✅ Alert/AlertDialog (`@/components/ui/alert`, `@/components/ui/alert-dialog`)
- ✅ Badge (`@/components/ui/badge`)
- ✅ Card (`@/components/ui/card`)
- ✅ Tabs (`@/components/ui/tabs`)
- ✅ Toast (`@/components/ui/toast`)
- ✅ Avatar (`@/components/ui/avatar`)
- ✅ Separator (`@/components/ui/separator`)
- ✅ Switch (`@/components/ui/switch`)
- ✅ Checkbox (`@/components/ui/checkbox`)
- ✅ RadioGroup (`@/components/ui/radio-group`)

## Guide de migration par composant

### Button

#### Avant (Chakra UI)
```jsx
import { Button } from '@chakra-ui/react';

<Button colorScheme="blue" size="md" leftIcon={<ShoppingCart />}>
  Ajouter au panier
</Button>
```

#### Après (Radix UI + Tailwind)
```jsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default" className="flex items-center gap-2">
  <ShoppingCart size={16} />
  Ajouter au panier
</Button>
```

#### Conversion des propriétés

| Propriété Chakra | Équivalent Radix UI + Tailwind |
|------------------|--------------------------------|
| `colorScheme="blue"` | `variant="default"` |
| `colorScheme="red"` | `variant="destructive"` |
| `variant="outline"` | `variant="outline"` |
| `variant="ghost"` | `variant="ghost"` |
| `variant="link"` | `variant="link"` |
| `size="sm"` | `size="sm"` |
| `size="md"` | `size="default"` |
| `size="lg"` | `size="lg"` |
| `isDisabled` | `disabled` |
| `isLoading` | Utiliser `<Loader2 className="animate-spin" />` comme enfant |
| `width="full"` | `className="w-full"` |
| `leftIcon={<Icon />}` | Ajouter l'icône comme enfant + `className="flex items-center gap-2"` |
| `mt={4}`, `mb={4}`, etc. | `className="mt-4"`, `className="mb-4"`, etc. |

### IconButton

#### Avant (Chakra UI)
```jsx
import { IconButton } from '@chakra-ui/react';

<IconButton 
  aria-label="Ajouter au panier" 
  icon={<ShoppingCart />} 
  colorScheme="blue" 
/>
```

#### Après (Radix UI + Tailwind)
```jsx
import { Button } from '@/components/ui/button';

<Button 
  variant="default" 
  size="icon" 
  aria-label="Ajouter au panier"
>
  <ShoppingCart size={16} />
</Button>
```

### ButtonGroup

#### Avant (Chakra UI)
```jsx
import { ButtonGroup, Button } from '@chakra-ui/react';

<ButtonGroup spacing={4} mt={4}>
  <Button colorScheme="blue">Bouton 1</Button>
  <Button colorScheme="blue">Bouton 2</Button>
</ButtonGroup>
```

#### Après (Radix UI + Tailwind)
```jsx
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

<ButtonGroup spacing={4} className="mt-4">
  <Button variant="default">Bouton 1</Button>
  <Button variant="default">Bouton 2</Button>
</ButtonGroup>
```

#### Options supplémentaires du ButtonGroup migré

```jsx
// Direction verticale
<ButtonGroup direction="column" spacing={2}>
  {/* Boutons */}
</ButtonGroup>

// Boutons attachés (sans espace)
<ButtonGroup isAttached>
  {/* Boutons */}
</ButtonGroup>

// Variant partagé par tous les boutons
<ButtonGroup variant="outline">
  {/* Tous les boutons auront variant="outline" */}
</ButtonGroup>
```

### Menu

#### Avant (Chakra UI)
```jsx
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider 
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button } from '@chakra-ui/react';

<Menu>
  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
    Actions
  </MenuButton>
  <MenuList>
    <MenuItem>Télécharger</MenuItem>
    <MenuItem>Créer une copie</MenuItem>
    <MenuDivider />
    <MenuItem>Supprimer</MenuItem>
  </MenuList>
</Menu>
```

#### Après (Radix UI + Tailwind)
```jsx
import { 
  Menu, 
  MenuTrigger, 
  MenuContent, 
  MenuItem,
  MenuSeparator
} from '@/components/ui/menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

<Menu>
  <MenuTrigger asChild>
    <Button variant="default" className="flex items-center gap-1">
      Actions
      <ChevronDown className="h-4 w-4" />
    </Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem>Télécharger</MenuItem>
    <MenuItem>Créer une copie</MenuItem>
    <MenuSeparator />
    <MenuItem>Supprimer</MenuItem>
  </MenuContent>
</Menu>
```

#### Conversion des propriétés de Menu

| Composant Chakra UI | Équivalent Radix UI + Tailwind |
|---------------------|----------------------------------|
| `<Menu>` | `<Menu>` |
| `<MenuButton>` | `<MenuTrigger>` |
| `<MenuList>` | `<MenuContent>` |
| `<MenuItem>` | `<MenuItem>` |
| `<MenuGroup>` | `<MenuGroup>` |
| `<MenuDivider>` | `<MenuSeparator>` |
| `<MenuOptionGroup>` | `<MenuRadioGroup>` |
| `<MenuItemOption>` | `<MenuRadioItem>` ou `<MenuCheckboxItem>` |
| `<MenuCommand>` | `<MenuShortcut>` |

> Note: Pour les sous-menus, utilisez `<MenuSub>`, `<MenuSubTrigger>` et `<MenuSubContent>`. Pour plus de détails sur la migration des menus, consultez le guide dédié: `src/scripts/performance/menu-migration-guide.md`.

### Box, Flex, etc.

#### Avant (Chakra UI)
```jsx
import { Box, Flex } from '@chakra-ui/react';

<Box p={4} bg="gray.100" borderRadius="md">
  <Flex justify="space-between" align="center">
    <Text>Contenu</Text>
    <Button>Action</Button>
  </Flex>
</Box>
```

#### Après (Tailwind CSS)
```jsx
<div className="p-4 bg-gray-100 rounded-md">
  <div className="flex justify-between items-center">
    <p>Contenu</p>
    <Button>Action</Button>
  </div>
</div>
```

#### Conversion des propriétés Box/Container

| Propriété Chakra | Équivalent Tailwind |
|------------------|---------------------|
| `p={4}` | `className="p-4"` |
| `m={4}` | `className="m-4"` |
| `mt={4}` | `className="mt-4"` |
| `mb={4}` | `className="mb-4"` |
| `ml={4}` | `className="ml-4"` |
| `mr={4}` | `className="mr-4"` |
| `px={4}` | `className="px-4"` |
| `py={4}` | `className="py-4"` |
| `bg="white"` | `className="bg-white"` |
| `bg="gray.100"` | `className="bg-gray-100"` |
| `color="blue.500"` | `className="text-blue-500"` |
| `borderRadius="md"` | `className="rounded-md"` |
| `borderWidth="1px"` | `className="border"` |
| `shadow="md"` | `className="shadow-md"` |
| `width="100%"` | `className="w-full"` |
| `height="100%"` | `className="h-full"` |
| `maxW="container.md"` | `className="container max-w-3xl mx-auto"` |

#### Conversion des propriétés Flex

| Propriété Chakra | Équivalent Tailwind |
|------------------|---------------------|
| `<Flex>` | `<div className="flex">` |
| `direction="column"` | `className="flex-col"` |
| `justify="center"` | `className="justify-center"` |
| `justify="space-between"` | `className="justify-between"` |
| `align="center"` | `className="items-center"` |
| `wrap="wrap"` | `className="flex-wrap"` |
| `gap={4}` | `className="gap-4"` |

#### Conversion des propriétés Stack

| Propriété Chakra | Équivalent Tailwind |
|------------------|---------------------|
| `<HStack>` | `<div className="flex flex-row gap-X">` |
| `<VStack>` | `<div className="flex flex-col gap-X">` |
| `spacing={4}` | `className="gap-4"` |

## Comment utiliser le script d'analyse

Le script `analyze-ui-components.js` peut vous aider à identifier les composants Chakra UI dans votre base de code:

```bash
# Analyser tout le projet
node src/scripts/performance/analyze-ui-components.js

# Analyser un fichier spécifique
node src/scripts/performance/analyze-ui-components.js src/components/MaComposante.tsx
```

## Comment utiliser les scripts d'aide à la migration

### Script général

Le script `chakra-to-radix.js` peut générer des suggestions de migration:

```bash
# Générer des suggestions pour tout le projet (limité aux 10 premiers fichiers)
node src/scripts/performance/chakra-to-radix.js

# Générer des suggestions pour un fichier spécifique
node src/scripts/performance/chakra-to-radix.js src/components/MaComposante.tsx
```

### Scripts spécifiques

Pour les composants ayant des scripts de migration dédiés:

```bash
# Migration de ButtonGroup
node src/scripts/performance/migrate-button-group.js [chemin_du_fichier]

# Migration de Menu
node src/scripts/performance/migrate-chakra-menu.js [chemin_du_fichier]
```

## Exemples de composants migrés

Des exemples de composants migrés sont disponibles dans `src/components/examples/`:

- `RadixButtonExample.jsx` - Exemple de migration du Button
- `TailwindBoxExample.jsx` - Exemple de migration des composants Box et Flex
- `ButtonGroupExample.tsx` - Exemple de migration du ButtonGroup
- `RadixMenuExample.jsx` - Exemple de migration du Menu

## Conseils pour une migration réussie

1. **Adopter une approche progressive** - Migrer un composant à la fois
2. **Commencer par les composants simples** - Button, Box, Flex sont de bons points de départ
3. **Tester visuellement** - Vérifier que l'apparence reste la même après migration
4. **Documenter les migrations** - Noter les équivalences pour faciliter le travail de l'équipe

## Contact et support

Pour toute question sur la migration, contactez l'équipe de performance frontend.

---

*Dernière mise à jour: Juin 2025* 