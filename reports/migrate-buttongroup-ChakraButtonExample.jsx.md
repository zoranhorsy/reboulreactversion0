# Suggestions de migration pour ButtonGroup dans ChakraButtonExample.jsx

## Import original

```jsx
import { Button, ButtonGroup, IconButton } from '@chakra-ui/react'
```

## Import suggéré

```jsx
import { ButtonGroup } from '@/components/ui/button-group';
```

## Utilisations trouvées (5)

### Exemple 1

#### Original

```jsx
<ButtonGroup spacing={4} mt={4}>
          <Button colorScheme="blue">Ajouter au panier</Button>
          <Button colorScheme="red" variant="solid">Supprimer</Button>
          <Button colorScheme="green" variant="outline">Sauvegarder</Button>
          <Button colorScheme="gray" variant="ghost">Annuler</Button>
          <Button colorScheme="purple" variant="link">En savoir plus</Button>
        </ButtonGroup>
```

#### Suggestion

```jsx
<ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue">Ajouter au panier</Button>
          <Button colorScheme="red" variant="solid">Supprimer</Button>
          <Button colorScheme="green" variant="outline">Sauvegarder</Button>
          <Button colorScheme="gray" variant="ghost">Annuler</Button>
          <Button colorScheme="purple" variant="link">En savoir plus</Button>
        </ButtonGroup>
```

### Exemple 2

#### Original

```jsx
<ButtonGroup spacing={4} mt={4}>
          <Button colorScheme="blue" size="xs">Très petit</Button>
          <Button colorScheme="blue" size="sm">Petit</Button>
          <Button colorScheme="blue" size="md">Moyen</Button>
          <Button colorScheme="blue" size="lg">Grand</Button>
        </ButtonGroup>
```

#### Suggestion

```jsx
<ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue" size="xs">Très petit</Button>
          <Button colorScheme="blue" size="sm">Petit</Button>
          <Button colorScheme="blue" size="md">Moyen</Button>
          <Button colorScheme="blue" size="lg">Grand</Button>
        </ButtonGroup>
```

### Exemple 3

#### Original

```jsx
<ButtonGroup spacing={4} mt={4}>
          <Button leftIcon={<ShoppingCart size={16} />} colorScheme="blue">
            Ajouter au panier
          </Button>
          <Button rightIcon={<Heart size={16} />} colorScheme="red" variant="outline">
            Favoris
          </Button>
          <Button leftIcon={<Share size={16} />} colorScheme="green" variant="ghost">
            Partager
          </Button>
        </ButtonGroup>
```

#### Suggestion

```jsx
<ButtonGroup spacing={4} className="mt-4">
          <Button leftIcon={<ShoppingCart size={16} />} colorScheme="blue">
            Ajouter au panier
          </Button>
          <Button rightIcon={<Heart size={16} />} colorScheme="red" variant="outline">
            Favoris
          </Button>
          <Button leftIcon={<Share size={16} />} colorScheme="green" variant="ghost">
            Partager
          </Button>
        </ButtonGroup>
```

### Exemple 4

#### Original

```jsx
<ButtonGroup spacing={4} mt={4}>
          <IconButton 
            aria-label="Ajouter au panier" 
            icon={<ShoppingCart size={16} />} 
            colorScheme="blue" 
          />
          <IconButton 
            aria-label="Ajouter aux favoris" 
            icon={<Heart size={16} />} 
            colorScheme="red" 
            variant="outline"
          />
          <IconButton 
            aria-label="Partager" 
            icon={<Share size={16} />} 
            colorScheme="green" 
            variant="ghost"
          />
        </ButtonGroup>
```

#### Suggestion

```jsx
<ButtonGroup spacing={4} className="mt-4">
          <IconButton 
            aria-label="Ajouter au panier" 
            icon={<ShoppingCart size={16} />} 
            colorScheme="blue" 
          />
          <IconButton 
            aria-label="Ajouter aux favoris" 
            icon={<Heart size={16} />} 
            colorScheme="red" 
            variant="outline"
          />
          <IconButton 
            aria-label="Partager" 
            icon={<Share size={16} />} 
            colorScheme="green" 
            variant="ghost"
          />
        </ButtonGroup>
```

### Exemple 5

#### Original

```jsx
<ButtonGroup spacing={4} mt={4}>
          <Button colorScheme="blue" isLoading loadingText="Chargement...">
            Chargement
          </Button>
          <Button colorScheme="blue" isDisabled>
            Désactivé
          </Button>
        </ButtonGroup>
```

#### Suggestion

```jsx
<ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue" isLoading loadingText="Chargement...">
            Chargement
          </Button>
          <Button colorScheme="blue" isDisabled>
            Désactivé
          </Button>
        </ButtonGroup>
```

## Notes importantes

- Assurez-vous d'importer `ButtonGroup` depuis `@/components/ui/button-group`
- Les boutons à l'intérieur doivent utiliser la version Radix UI de Button
- Pour les icônes, utilisez la structure `<Button size="icon">...</Button>` au lieu de `IconButton`

## Prévisualisation des changements globaux

### Aperçu du fichier migré

```jsx
"use client"

import React from 'react'
import { Button, IconButton } from '@chakra-ui/react';
import { ButtonGroup } from '@/components/ui/button-group';
import { ShoppingCart, Heart, Share } from 'lucide-react'

/**
 * EXEMPLE - Composant utilisant des boutons Chakra UI
 * Ce fichier sert d'exemple pour la migration vers Radix UI + Tailwind CSS
 */
export function ChakraButtonExample() {
  return (
    <div>
      <h2>Exemples de Boutons Chakra UI</h2>
      
      {/* Boutons simples */}
      <div className="mb-6">
        <h3>Boutons standards</h3>
        <ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue">Ajouter au panier</Button>
          <Button colorScheme="red" variant="solid">Supprimer</Button>
          <Button colorScheme="green" variant="outline">Sauvegarder</Button>
          <Button colorScheme="gray" variant="ghost">Annuler</Button>
          <Button colorScheme="purple" variant="link">En savoir plus</Button>
        </ButtonGroup>
      </div>
      
      {/* Boutons de tailles différentes */}
      <div className="mb-6">
        <h3>Tailles différentes</h3>
        <ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue" size="xs">Très petit</Button>
          <Button colorScheme="blue" size="sm">Petit</Button>
          <Button colorScheme="blue" size="md">Moyen</Button>
          <Button colorScheme="blue" size="lg">Grand</Button>
        </ButtonGroup>
      </div>
      
      {/* Boutons avec icônes */}
      <div className="mb-6">
        <h3>Boutons avec icônes</h3>
        <ButtonGroup spacing={4} className="mt-4">
          <Button leftIcon={<ShoppingCart size={16} />} colorScheme="blue">
            Ajouter au panier
          </Button>
          <Button rightIcon={<Heart size={16} />} colorScheme="red" variant="outline">
            Favoris
          </Button>
          <Button leftIcon={<Share size={16} />} colorScheme="green" variant="ghost">
            Partager
          </Button>
        </ButtonGroup>
      </div>
      
      {/* Boutons icônes */}
      <div className="mb-6">
        <h3>Boutons icônes</h3>
        <ButtonGroup spacing={4} className="mt-4">
          <IconButton 
            aria-label="Ajouter au panier" 
            icon={<ShoppingCart size={16} />} 
            colorScheme="blue" 
          />
          <IconButton 
            aria-label="Ajouter aux favoris" 
            icon={<Heart size={16} />} 
            colorScheme="red" 
            variant="outline"
          />
          <IconButton 
            aria-label="Partager" 
            icon={<Share size={16} />} 
            colorScheme="green" 
            variant="ghost"
          />
        </ButtonGroup>
      </div>
      
      {/* Boutons avec états */}
      <div className="mb-6">
        <h3>États</h3>
        <ButtonGroup spacing={4} className="mt-4">
          <Button colorScheme="blue" isLoading loadingText="Chargement...">
            Chargement
          </Button>
          <Button colorScheme="blue" isDisabled>
            Désactivé
          </Button>
        </ButtonGroup>
      </div>
      
      {/* Boutons avec largeur personnalisée */}
      <div className="mb-6">
        <h3>Largeur personnalisée</h3>
        <Button colorScheme="blue" width="full" mt={4}>
          Bouton pleine largeur
        </Button>
      </div>
    </div>
  )
} 
```

