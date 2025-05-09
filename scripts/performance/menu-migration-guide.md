# Guide de Migration: Menu Chakra UI → Menu Radix UI + Tailwind CSS

Ce guide explique comment migrer les composants de menu de Chakra UI vers notre nouvelle implémentation basée sur Radix UI + Tailwind CSS pour l'application Reboul.

## Pourquoi migrer le Menu?

- Réduction de la taille du bundle JavaScript
- Meilleure performance (pas de CSS-in-JS à l'exécution)
- Cohérence avec notre migration globale vers Radix UI + Tailwind
- Accessibilité améliorée grâce aux primitifs Radix UI

## Comparaison des composants

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

## Exemples de migration

### Menu simple

#### Avant (Chakra UI)
```jsx
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'

export function SimpleMenu() {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        Actions
      </MenuButton>
      <MenuList>
        <MenuItem>Télécharger</MenuItem>
        <MenuItem>Créer une copie</MenuItem>
        <MenuItem>Renommer</MenuItem>
        <MenuItem>Supprimer</MenuItem>
      </MenuList>
    </Menu>
  )
}
```

#### Après (Radix UI + Tailwind)
```jsx
import { 
  Menu, 
  MenuTrigger, 
  MenuContent, 
  MenuItem 
} from '@/components/ui/menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function SimpleMenu() {
  return (
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
        <MenuItem>Renommer</MenuItem>
        <MenuItem>Supprimer</MenuItem>
      </MenuContent>
    </Menu>
  )
}
```

### Menu avec groupes et séparateurs

#### Avant (Chakra UI)
```jsx
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuGroup,
  MenuDivider
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

export function GroupedMenu() {
  return (
    <Menu>
      <MenuButton as={Button}>
        Profil
      </MenuButton>
      <MenuList>
        <MenuGroup title="Profil">
          <MenuItem>Mon compte</MenuItem>
          <MenuItem>Mes commandes</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup title="Aide">
          <MenuItem>FAQ</MenuItem>
          <MenuItem>Nous contacter</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  )
}
```

#### Après (Radix UI + Tailwind)
```jsx
import { 
  Menu, 
  MenuTrigger, 
  MenuContent, 
  MenuItem, 
  MenuGroup,
  MenuLabel,
  MenuSeparator
} from '@/components/ui/menu'
import { Button } from '@/components/ui/button'

export function GroupedMenu() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="default">
          Profil
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Profil</MenuLabel>
        <MenuGroup>
          <MenuItem>Mon compte</MenuItem>
          <MenuItem>Mes commandes</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuLabel>Aide</MenuLabel>
        <MenuGroup>
          <MenuItem>FAQ</MenuItem>
          <MenuItem>Nous contacter</MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  )
}
```

### Menu avec options cochables

#### Avant (Chakra UI)
```jsx
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuOptionGroup,
  MenuItemOption 
} from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

export function CheckableMenu() {
  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button}>
        Filtre
      </MenuButton>
      <MenuList minWidth="240px">
        <MenuOptionGroup title="Catégorie" type="checkbox">
          <MenuItemOption value="homme">Homme</MenuItemOption>
          <MenuItemOption value="femme">Femme</MenuItemOption>
          <MenuItemOption value="enfant">Enfant</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}
```

#### Après (Radix UI + Tailwind)
```jsx
import { 
  Menu, 
  MenuTrigger, 
  MenuContent, 
  MenuCheckboxItem,
  MenuLabel 
} from '@/components/ui/menu'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function CheckableMenu() {
  const [selectedItems, setSelectedItems] = useState({
    homme: false,
    femme: false,
    enfant: false,
  })
  
  const toggleItem = (item: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }
  
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="default">
          Filtre
        </Button>
      </MenuTrigger>
      <MenuContent className="min-w-[240px]">
        <MenuLabel>Catégorie</MenuLabel>
        <MenuCheckboxItem 
          checked={selectedItems.homme}
          onCheckedChange={() => toggleItem('homme')}
        >
          Homme
        </MenuCheckboxItem>
        <MenuCheckboxItem 
          checked={selectedItems.femme}
          onCheckedChange={() => toggleItem('femme')}
        >
          Femme
        </MenuCheckboxItem>
        <MenuCheckboxItem 
          checked={selectedItems.enfant}
          onCheckedChange={() => toggleItem('enfant')}
        >
          Enfant
        </MenuCheckboxItem>
      </MenuContent>
    </Menu>
  )
}
```

### Menu avec sous-menus

#### Avant (Chakra UI)
```jsx
import { 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuGroup,
  MenuDivider
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'

export function NestedMenu() {
  return (
    <Menu>
      <MenuButton as={Button}>
        Catalogue
      </MenuButton>
      <MenuList>
        <MenuItem>Nouveautés</MenuItem>
        <MenuItem>
          Vêtements <ChevronRightIcon />
          <Menu placement="right-start" offset={[-8, 0]}>
            <MenuList>
              <MenuItem>Homme</MenuItem>
              <MenuItem>Femme</MenuItem>
              <MenuItem>Enfant</MenuItem>
            </MenuList>
          </Menu>
        </MenuItem>
        <MenuItem>
          Accessoires <ChevronRightIcon />
          <Menu placement="right-start" offset={[-8, 0]}>
            <MenuList>
              <MenuItem>Sacs</MenuItem>
              <MenuItem>Bijoux</MenuItem>
              <MenuItem>Chapeaux</MenuItem>
            </MenuList>
          </Menu>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
```

#### Après (Radix UI + Tailwind)
```jsx
import { 
  Menu, 
  MenuTrigger, 
  MenuContent, 
  MenuItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent
} from '@/components/ui/menu'
import { Button } from '@/components/ui/button'

export function NestedMenu() {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="default">
          Catalogue
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>Nouveautés</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Vêtements</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Homme</MenuItem>
            <MenuItem>Femme</MenuItem>
            <MenuItem>Enfant</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Accessoires</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sacs</MenuItem>
            <MenuItem>Bijoux</MenuItem>
            <MenuItem>Chapeaux</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  )
}
```

## Conversion des propriétés

| Propriété Chakra UI | Équivalent Radix UI + Tailwind |
|---------------------|----------------------------------|
| `isOpen`, `onOpen`, `onClose` | Gérées par l'état interne de Radix |
| `autoSelect` | Non applicable, Radix gère la sélection |
| `isLazy` | Non nécessaire, Radix optimise le chargement |
| `closeOnSelect` | Par défaut `true` dans Radix, utiliser l'événement `onSelect` pour personnaliser |
| `closeOnBlur` | Par défaut `true` dans Radix |
| `placement` | Géré par les propriétés `side` et `align` de `MenuContent` |
| `colorScheme` | Utiliser les classes Tailwind pour styliser |
| `variant` | Utiliser les classes Tailwind pour styliser |
| `size` | Utiliser les classes Tailwind pour dimensionner |

## Conseils de migration

1. **Comportement des sous-menus**: Radix utilise un système de sous-menus plus structuré avec `MenuSub`, `MenuSubTrigger` et `MenuSubContent`.

2. **Gestion de l'état**: Alors que Chakra UI expose des hooks pour gérer l'état d'ouverture, Radix gère cela en interne mais vous permet de contrôler l'état avec `open` et `onOpenChange`.

3. **Animation**: Les animations sont intégrées dans le composant Radix UI via les classes Tailwind et les attributs data.

4. **Accessibilité**: Radix UI offre une meilleure accessibilité par défaut, assurez-vous de maintenir les attributs ARIA lors de la migration.

5. **Raccourcis clavier**: Utilisez le composant `<MenuShortcut>` pour ajouter des raccourcis clavier à vos menus.

## Exemple de composant complet

Pour voir un exemple de menu complexe, consultez les exemples dans le dossier:
- `src/components/examples/RadixMenuExample.jsx`

---

*Dernière mise à jour: Mai 2025* 