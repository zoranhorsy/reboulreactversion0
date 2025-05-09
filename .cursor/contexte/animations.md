# Animations et Effets Visuels de Reboul

Ce document détaille les animations et effets visuels utilisés dans l'application Reboul pour créer une expérience utilisateur fluide et engageante.

## Principes d'animation

### Philosophie générale
- Animations subtiles et non-intrusives
- Focus sur la fluidité et le naturel des mouvements
- Renforcement du feedback visuel pour les interactions
- Cohérence à travers toute l'application

### Timing et courbes d'accélération
- Durées courtes pour les micro-interactions (150-300ms)
- Durées moyennes pour les transitions de page (300-500ms)
- Courbe d'accélération standard: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Courbe pour entrées: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)
- Courbe pour sorties: `cubic-bezier(0.4, 0, 1, 1)` (ease-in)

## Animations d'interface

### Transitions de page
- **Fade in/out**: Transition douce entre les pages
- **Slide in**: Pour les pages hiérarchiques (sous-catégories)
- **Scale**: Zoom léger pour les pages de détail de produit
- Utilisation de Next.js transitions et Framer Motion

```jsx
// Exemple avec Framer Motion
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Animations des composants

#### Boutons
- Léger changement d'échelle au hover (`scale(1.05)`)
- Effet d'enfoncement au clic (`translateY(1px)`)
- Ripple effect pour le feedback de clic
- Loading spinner pour les états de chargement

#### Cartes produits
- Légère élévation au hover (ombre plus prononcée)
- Scale up doux (`scale(1.03)`)
- Apparition progressive des boutons d'action

```css
.product-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

#### Menu et navigation
- Slide down pour les dropdowns
- Fade + slide pour les menus latéraux
- Highlight progressif des items de menu au hover

#### Modales et drawers
- Fade in + scale up pour les modales
- Slide in depuis le côté pour les drawers
- Backdrop avec blur progressif

## Animations spécifiques

### Page d'accueil
- Parallax subtil pour les images héro
- Séquençage des entrées pour les sections principales
- Animations au scroll pour révéler progressivement le contenu

### Catalogue
- Staggered animation pour l'apparition des cartes produits
- Filtres qui se déploient/replient avec animation
- Transition fluide lors du changement de filtres

### Fiche produit
- Galerie d'images avec transitions fluides
- Zoom sur hover des images
- Animation de l'ajout au panier (trajectoire vers l'icône panier)

### Panier
- Animation d'ajout/suppression d'articles
- Mise à jour fluide des totaux
- Vibration légère pour les erreurs

## Techniques d'implémentation

### Librairies utilisées
- **Framer Motion**: Pour les animations de composants complexes
- **GSAP**: Pour les animations avancées et séquencées
- **CSS Transitions**: Pour les animations simples
- **Intersection Observer**: Pour les animations au scroll

### Performance
- Utilisation de `will-change` pour optimiser le rendu
- Animation uniquement des propriétés performantes (opacity, transform)
- Désactivation des animations complexes sur mobile si nécessaire
- Préférence pour les animations hardware-accelerated

```jsx
// Exemple d'animation de liste avec Framer Motion
<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: i * 0.1,
        ease: "easeOut"
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

## Accessibilité

- Respect de la préférence `prefers-reduced-motion`
- Alternatives non-animées pour les composants critiques
- Animations qui ne perturbent pas la lecture d'écran
- Possibilité de désactiver les animations dans les paramètres

```jsx
// Exemple de respect de prefers-reduced-motion
const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

const animationSettings = prefersReducedMotion 
  ? { duration: 0 } 
  : { duration: 0.3, ease: "easeOut" };
``` 