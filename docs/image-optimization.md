# Guide d'optimisation des images - Reboul

Ce document décrit la stratégie d'optimisation des images pour le site Reboul, avec des directives pour garantir des performances optimales tout en maintenant une qualité visuelle élevée.

## Composants d'images optimisés

Nous avons mis en place deux composants principaux pour l'optimisation des images :

1. **OptimizedImage** : Composant de base pour toutes les images
2. **OptimizedProductImage** : Composant spécifique pour les images de produits avec fonctionnalités supplémentaires (hover, badges)

## Types d'images et dimensions

Nous avons défini des dimensions spécifiques pour chaque type d'image pour garantir un chargement optimal selon les breakpoints de l'application :

| Type d'image | Usage | Dimensions mobiles | Dimensions tablettes | Dimensions desktop | 
|--------------|-------|-------------------|---------------------|-------------------|
| `hero` | Images de bannières | 480px | 768px | 1280px-1920px |
| `product-card` | Vignettes produits | 180px × 240px | 240px × 320px | 320px × 427px |
| `product-detail` | Images détaillées | 480px × 640px | 640px × 853px | 1200px × 1600px |
| `category` | Images de catégories | 320px × 180px | 400px × 225px | 600px × 338px |
| `logo` | Logos | 64px × 64px | 64px × 64px | 128px × 128px |
| `icon` | Icônes | 32px × 32px | 32px × 32px | 32px × 32px |

## Comment utiliser les composants

### OptimizedImage

```tsx
import { OptimizedImage } from '@/components/optimized/OptimizedImage'

// Exemple d'utilisation
<OptimizedImage
  src="/chemin/vers/image.jpg"
  alt="Description de l'image"
  type="hero" // Type d'image: 'hero', 'product-card', 'product-detail', 'category', 'logo', 'icon'
  priority={false} // true pour les images au-dessus de la ligne de flottaison
  fill={false} // true pour remplir un conteneur parent
  quality={85} // Qualité de l'image (1-100)
  className="ma-classe-personnalisee"
/>
```

### OptimizedProductImage

```tsx
import { OptimizedProductImage } from '@/components/optimized/OptimizedProductImage'

// Exemple d'utilisation
<OptimizedProductImage
  product={produit} // Objet produit avec les propriétés images, name, status
  type="card" // Type: 'card', 'detail', 'thumbnail'
  priority={false} // true pour les images au-dessus de la ligne de flottaison
  fill={false} // true pour remplir un conteneur parent
  showHover={true} // Activer/désactiver l'effet de survol
  className="ma-classe-personnalisee"
/>
```

## Bonnes pratiques

1. **Toujours utiliser les composants optimisés** : Ne pas utiliser de balises `<img>` natives ou même `next/image` directement.

2. **Attribut `priority`** : Mettre `priority={true}` uniquement pour les images critiques visibles sans défilement (hero, premiers produits...).

3. **Attribut `fill`** : Utiliser `fill={true}` lorsque l'image doit s'adapter à un conteneur parent de taille variable.

4. **Ne pas surcharger la page** : Limiter le nombre d'images avec `priority={true}` à 2-3 par page maximum.

5. **Format d'images** : Privilégier les formats WebP ou AVIF pour les images. Convertir les PNG et JPG existants.

6. **Taille des fichiers** : Viser un poids maximal de :
   - 100-150 KB pour les images hero
   - 30-50 KB pour les images de produits
   - 10-20 KB pour les logos et icônes

7. **Images de produits** : Standardiser les images de produits (fond blanc, rapport hauteur/largeur constant).

## Vérification des performances

Après chaque déploiement majeur, vérifier les performances des images avec :

1. **Google Lighthouse** : Viser un score d'au moins 90 en Performance
2. **WebPageTest** : Vérifier le temps de chargement des images et la compression
3. **Browser DevTools** : Vérifier que les bonnes tailles d'images sont chargées selon l'appareil

## Maintenance

Toute modification des composants d'optimisation d'images doit être documentée ici et communiquée à l'équipe de développement. 