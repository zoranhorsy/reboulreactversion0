# Navigation Reboul - Guide d'utilisation

## Vue d'ensemble

Le système de navigation Reboul propose trois approches flexibles pour s'adapter aux différents besoins de votre application :

1. **Dock seul** - Navigation légère et flottante (existant)
2. **Sidebar seule** - Navigation complète et structurée (nouveau)
3. **Hybride** - Combinaison des deux (recommandé)

## Composants disponibles

### 1. ReboulPageLayout
**Usage :** Pages qui utilisent UNIQUEMENT la sidebar (remplace le dock)

```tsx
import { ReboulPageLayout } from "@/components/reboul/ReboulNavigation";

export default function AdminPage() {
  return (
    <ReboulPageLayout showUserSection={true}>
      <div className="p-6">
        {/* Votre contenu */}
      </div>
    </ReboulPageLayout>
  );
}
```

**Idéal pour :**
- Pages d'administration
- Dashboards complexes
- Applications avec navigation principale

### 2. ReboulSidebarLayout
**Usage :** Pages qui utilisent la sidebar AVEC le dock existant

```tsx
import { ReboulSidebarLayout } from "@/components/reboul/ReboulNavigation";
import { Dock } from "@/components/Dock";

export default function UserPage() {
  return (
    <ReboulSidebarLayout showUserSection={true}>
      <div className="relative min-h-screen">
        <div className="p-6">
          {/* Votre contenu */}
        </div>
        {/* Dock flottant */}
        <Dock />
      </div>
    </ReboulSidebarLayout>
  );
}
```

**Idéal pour :**
- Pages utilisateur
- Interfaces riches
- Applications nécessitant double navigation

### 3. ReboulSidebarOnly
**Usage :** Composant sidebar autonome à intégrer dans vos layouts existants

```tsx
import { ReboulSidebarOnly } from "@/components/reboul/ReboulNavigation";

export default function CustomLayout({ children }) {
  return (
    <div className="flex">
      <ReboulSidebarOnly showUserSection={true} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

**Idéal pour :**
- Layouts personnalisés
- Intégration progressive
- Flexibilité maximum

## Comportements responsifs

### Desktop (md et plus)
- **Sidebar :** Collapsée par défaut (60px), s'étend au hover (280px)
- **Dock :** Visible et flottant au bas de l'écran

### Mobile (moins de md)
- **Sidebar :** Menu hamburger → overlay full-screen
- **Dock :** Adapté pour l'interaction tactile

## Personnalisation

### Props communes

```tsx
interface NavigationProps {
  showUserSection?: boolean; // Afficher la section utilisateur (défaut: true)
  children: React.ReactNode; // Contenu de la page
}
```

### Styling

Les composants utilisent les variables CSS de votre thème Reboul :
- `--background` : Couleur de fond
- `--foreground` : Couleur du texte
- `--primary` : Couleur principale
- `--border` : Couleur des bordures
- `--muted-foreground` : Couleur du texte secondaire

## Exemples d'intégration

### Page d'administration (Sidebar seule)
```tsx
// src/app/admin/dashboard/page.tsx
import { ReboulPageLayout } from "@/components/reboul/ReboulNavigation";

export default function AdminDashboard() {
  return (
    <ReboulPageLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        {/* Contenu admin */}
      </div>
    </ReboulPageLayout>
  );
}
```

### Page utilisateur (Hybride)
```tsx
// src/app/profil/page.tsx
import { ReboulSidebarLayout } from "@/components/reboul/ReboulNavigation";
import { Dock } from "@/components/Dock";

export default function ProfilPage() {
  return (
    <ReboulSidebarLayout>
      <div className="relative min-h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          {/* Contenu profil */}
        </div>
        <Dock />
      </div>
    </ReboulSidebarLayout>
  );
}
```

### Page publique (Dock seul - existant)
```tsx
// src/app/catalogue/page.tsx - Reste inchangé
import { Dock } from "@/components/Dock";

export default function CataloguePage() {
  return (
    <div className="min-h-screen">
      {/* Votre contenu existant */}
      <Dock />
    </div>
  );
}
```

## Migration progressive

### Étape 1 : Tester les nouvelles pages
Créez vos nouvelles pages avec les nouveaux composants sans modifier l'existant.

### Étape 2 : Migrer page par page
Remplacez progressivement vos layouts existants selon vos besoins.

### Étape 3 : Optimiser
Ajustez les comportements selon les retours utilisateurs.

## Avantages de chaque approche

### Dock seul
- ✅ Léger et non-intrusif
- ✅ Familier pour les utilisateurs existants
- ✅ Idéal pour les pages de contenu

### Sidebar seule
- ✅ Navigation structurée et complète
- ✅ Parfait pour les interfaces complexes
- ✅ Optimisé pour la productivité

### Hybride
- ✅ Meilleur des deux mondes
- ✅ Flexibilité d'usage maximum
- ✅ Expérience utilisateur riche

## Support et personnalisation

Pour personnaliser davantage les composants, vous pouvez :
1. Modifier les classes CSS dans `src/components/ui/reboul-sidebar.tsx`
2. Ajuster les animations dans les propriétés `motion`
3. Personnaliser les couleurs via les variables CSS

## Compatibilité

- ✅ React 18+
- ✅ Next.js 13+ (App Router)
- ✅ Tailwind CSS 3+
- ✅ Framer Motion 10+
- ✅ TypeScript 