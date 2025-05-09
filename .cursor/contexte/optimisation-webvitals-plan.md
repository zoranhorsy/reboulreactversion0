# Plan d'optimisation des Web Vitals - Reboul E-commerce

## Contexte
Suite à l'analyse de notre roadmap, nous avons identifié l'optimisation des métriques Web Vitals comme une priorité immédiate. Ce document détaille le plan d'action pour améliorer significativement les performances du site.

## Métriques cibles

| Métrique | Actuel | Objectif | Amélioration |
|----------|--------|----------|--------------|
| LCP      | 2.8s   | < 2.0s   | > 28%        |
| CLS      | 0.15   | < 0.05   | > 66%        |
| FID      | 120ms  | < 80ms   | > 33%        |
| TTI      | 3.5s   | < 2.5s   | > 28%        |

## Plan d'action (à exécuter demain)

### Matin (4 heures)

#### 1. Audit complet (9h00-10h30)
- **Outils**: Lighthouse, web-vitals.js, Chrome DevTools
- **Pages prioritaires**: 
  - Page d'accueil
  - Catalogue (liste produits)
  - Page produit détaillé
  - Panier et checkout
- **Livrables**:
  - Rapport d'audit par page avec problèmes identifiés
  - Document de benchmarking pour mesures futures

#### 2. Optimisation des images (10h30-13h00)
- Mise en place du préchargement pour les images critiques
  ```jsx
  // Exemple d'implémentation avec Next.js
  <Image
    src={product.mainImage}
    alt={product.name}
    width={600}
    height={600}
    priority={true} // Préchargement pour les images above the fold
    placeholder="blur" // Afficher une version floue pendant le chargement
    blurDataURL={product.lqipUrl} // URL de l'image basse qualité
  />
  ```
- Implémentation de placeholders LQIP
  - Générer des versions très basses résolution (~10px) de toutes les images produits
  - Utiliser ces images comme placeholder pendant le chargement
- Conversion des images en WebP/AVIF
  - Préparer un script de conversion batch pour toutes les images
  - Assurer la compatibilité navigateur avec fallbacks

### Après-midi (4 heures)

#### 3. Minimisation du CLS (14h00-16h00)
- Réservation d'espace pour les éléments dynamiques
  ```css
  .product-image-container {
    aspect-ratio: 1 / 1;
    min-height: 300px;
  }
  ```
- Création de skeletons uniformes
  ```jsx
  // Exemple de ProductCardSkeleton
  const ProductCardSkeleton = () => (
    <div className="product-card-skeleton">
      <div className="image-skeleton animate-pulse"></div>
      <div className="title-skeleton animate-pulse"></div>
      <div className="price-skeleton animate-pulse"></div>
    </div>
  )
  ```
- Stabilisation du rendu des polices
  ```jsx
  // Préchargement des polices
  <Head>
    <link
      rel="preload"
      href="/fonts/inter-var.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />
  </Head>
  ```

#### 4. Dashboard de performance (16h00-18h00)
- Intégration du composant WebVitalsMonitor amélioré
  - Ajouter le tracking dans _app.tsx
  - Configurer le stockage des métriques (localStorage ou API)
- Configuration des seuils d'alerte
  - LCP > 2.5s = alerte
  - CLS > 0.1 = alerte
  - FID > 100ms = alerte
- Mise en place de tests sur différents appareils et connexions

## Ressources et dépendances

### Bibliothèques nécessaires
- web-vitals: ^3.0.0
- react-loading-skeleton: ^3.3.0
- next/image avec optimisations avancées

### Documentation de référence
- [Guide d'optimisation Web Vitals](https://web.dev/vitals/)
- [Documentation Next.js sur l'optimisation des images](https://nextjs.org/docs/basic-features/image-optimization)
- [Stratégies de réduction du CLS](https://web.dev/optimize-cls/)

### Outils de mesure
- Lighthouse dans Chrome DevTools
- Web Vitals extension Chrome
- PageSpeed Insights
- Core Web Vitals Report dans Google Search Console

## Méthode d'évaluation

Nous utiliserons la méthode suivante pour valider les améliorations:
1. Établir une baseline de performance avant les modifications
2. Implémenter les améliorations par lot (images, CLS, etc.)
3. Mesurer l'impact de chaque lot sur les métriques Web Vitals
4. Documenter les techniques les plus efficaces
5. Mettre à jour les bonnes pratiques pour l'équipe 