# Rapport d'utilisation des composants Chakra UI

Date: 08/05/2025

## Résumé

- **12** composants Chakra UI identifiés
- **2** fichiers utilisant Chakra UI
- **5** instances de personnalisation de thème

## Top 10 des composants les plus utilisés

| Composant | Occurrences | Équivalent Radix UI + Tailwind |
|-----------|-------------|---------------------------------|
| Button | 1 | @/components/ui/button |
| ButtonGroup | 1 | Composant personnalisé + Tailwind |
| IconButton | 1 | @/components/ui/button avec variant="icon" |
| Box | 1 | div + Tailwind classes |
| Flex | 1 | div + flex Tailwind classes |
| VStack | 1 | div + flex-col + gap Tailwind classes |
| HStack | 1 | div + flex-row + gap Tailwind classes |
| Text | 1 | p, span + Tailwind typography classes |
| Heading | 1 | h1-h6 + Tailwind typography classes |
| Container | 1 | div + container Tailwind classes |

## Liste complète des composants

| Composant | Occurrences | Équivalent Radix UI + Tailwind | Priorité |
|-----------|-------------|----------------------------------|----------|
| Button | 1 | @/components/ui/button | 🟢 Basse |
| ButtonGroup | 1 | Composant personnalisé + Tailwind | 🟢 Basse |
| IconButton | 1 | @/components/ui/button avec variant="icon" | 🟢 Basse |
| Box | 1 | div + Tailwind classes | 🟢 Basse |
| Flex | 1 | div + flex Tailwind classes | 🟢 Basse |
| VStack | 1 | div + flex-col + gap Tailwind classes | 🟢 Basse |
| HStack | 1 | div + flex-row + gap Tailwind classes | 🟢 Basse |
| Text | 1 | p, span + Tailwind typography classes | 🟢 Basse |
| Heading | 1 | h1-h6 + Tailwind typography classes | 🟢 Basse |
| Container | 1 | div + container Tailwind classes | 🟢 Basse |
| Grid | 1 | div + grid Tailwind classes | 🟢 Basse |
| GridItem | 1 | Composant personnalisé + Tailwind | 🟢 Basse |

## Modèles d'utilisation courants

### Button

```jsx
<Button colorScheme="blue">
```

**Équivalent Radix UI + Tailwind:**

```jsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Contenu du bouton
</Button>
```

### ButtonGroup

```jsx
<ButtonGroup spacing={4} mt={4}>
```

**Équivalent Radix UI + Tailwind:**

```jsx
<!-- Consultez la documentation pour l'équivalent de ButtonGroup -->
```

### IconButton

*Pas d'exemple d'utilisation trouvé*

### Box

```jsx
<Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="gray.50" w="100%">
```

**Équivalent Radix UI + Tailwind:**

```jsx
<div className="p-4 rounded-md bg-gray-100 shadow-md">
  Contenu
</div>
```

### Flex

*Pas d'exemple d'utilisation trouvé*

## Recommandations pour la migration

### Plan par phase

#### Phase 1: Composants haute priorité



#### Phase 2: Composants priorité moyenne



#### Phase 3: Composants basse priorité

- [ ] Button → @/components/ui/button
- [ ] ButtonGroup → Composant personnalisé + Tailwind
- [ ] IconButton → @/components/ui/button avec variant="icon"
- [ ] Box → div + Tailwind classes
- [ ] Flex → div + flex Tailwind classes
- [ ] VStack → div + flex-col + gap Tailwind classes
- [ ] HStack → div + flex-row + gap Tailwind classes
- [ ] Text → p, span + Tailwind typography classes
- [ ] Heading → h1-h6 + Tailwind typography classes
- [ ] Container → div + container Tailwind classes
- [ ] Grid → div + grid Tailwind classes
- [ ] GridItem → Composant personnalisé + Tailwind

## Personnalisations de thème identifiées

Ces composants utilisent des propriétés de style spécifiques à Chakra UI:

- Button (ChakraButtonExample.jsx)
- Heading (ChakraBoxExample.jsx)
- Button (analyze-ui-components.js)
- Button (migrate-button-group.js)
- Button (chakra-to-radix.js)

