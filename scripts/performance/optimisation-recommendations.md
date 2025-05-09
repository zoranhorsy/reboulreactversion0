# Recommandations d'optimisation des Web Vitals

Ce document présente des recommandations concrètes pour améliorer les métriques Web Vitals de l'application Reboul.

## 1. Optimisation du LCP (Largest Contentful Paint)

Le LCP mesure le temps nécessaire pour que le plus grand élément visible dans la fenêtre initiale soit rendu.

### Problèmes fréquents dans Reboul
- Chargement lent des images de produits principales
- Temps de réponse serveur trop long
- Ressources CSS/JS bloquant le rendu 

### Solutions recommandées

#### Images optimisées
```jsx
// Optimiser les images avec priorité pour le LCP
<Image
  src={product.image}
  alt={product.name}
  width={600}
  height={800}
  priority={true} // Préchargement prioritaire pour LCP
  placeholder="blur" // Afficher un placeholder pendant le chargement
  blurDataURL={product.lqipUrl} // Image basse qualité en attendant
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### Preload des ressources critiques
```html
<!-- Dans le head du document -->
<link 
  rel="preload" 
  href="/fonts/KernelRegular.ttf" 
  as="font" 
  type="font/ttf" 
  crossorigin="anonymous"
/>

<link
  rel="preload"
  href="/main-hero-image.webp"
  as="image"
  type="image/webp"
/>
```

#### Optimisation du rendu côté serveur
- Utiliser le streaming SSR pour rendre progressivement les pages complexes
- Minimiser l'utilisation de `useEffect` pour la récupération de données critiques
- Mettre en place un cache côté serveur pour les données fréquemment utilisées

## 2. Optimisation du CLS (Cumulative Layout Shift)

Le CLS mesure la stabilité visuelle d'une page pendant son chargement.

### Problèmes fréquents dans Reboul
- Images sans dimensions spécifiées
- Éléments publicitaires ou de promotion qui poussent le contenu
- Polices personnalisées provoquant un rendu différé

### Solutions recommandées

#### Réserver l'espace pour les images
```jsx
// Toujours spécifier les dimensions pour les images
<div className="aspect-ratio-container" style={{ aspectRatio: '3/4' }}>
  <Image
    src={product.image}
    alt={product.name}
    fill
    style={{ objectFit: 'cover' }}
  />
</div>
```

#### Éviter les insertions dynamiques
```jsx
// Avant: mauvais (cause du CLS)
{isLoaded && <PromoPopup />} 

// Après: bon (réserve l'espace même si vide)
<div style={{ height: promoPopupHeight || '0px', transition: 'height 0.3s ease' }}>
  {isLoaded && <PromoPopup />}
</div>
```

#### Optimisation des polices
```jsx
// Précharger les polices et spécifier le comportement de substitution
const fontKernel = localFont({
  src: './fonts/KernelRegular.ttf',
  preload: true,
  display: 'swap', // Utilise une police système en attendant le chargement
  variable: '--font-kernel'
})
```

## 3. Optimisation du FID/INP (First Input Delay / Interaction to Next Paint)

Ces métriques mesurent la réactivité de la page aux interactions utilisateur.

### Problèmes fréquents dans Reboul
- JavaScript lourd qui bloque le thread principal
- Gestionnaires d'événements inefficaces
- Trop de rerendering React

### Solutions recommandées

#### Code Splitting
```jsx
// Charger les composants non critiques à la demande
import dynamic from 'next/dynamic'

const PromoPopup = dynamic(() => import('@/components/PromoPopup'), {
  ssr: false,
  loading: () => <div className="popup-placeholder" />
})
```

#### Optimiser les gestionnaires d'événements
```jsx
// Avant: mauvais (recalcule à chaque rendu)
<button onClick={() => handleComplexOperation(product.id)}>
  Ajouter au panier
</button>

// Après: bon (utilise useCallback pour mémoriser la fonction)
const handleAddToCart = useCallback(() => {
  handleComplexOperation(product.id)
}, [product.id])

<button onClick={handleAddToCart}>
  Ajouter au panier
</button>
```

#### Debounce/Throttle pour les événements fréquents
```jsx
// Pour la recherche en temps réel
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch)
  }
}, [debouncedSearch])
```

## 4. Optimisation du TTFB (Time to First Byte)

Le TTFB mesure le temps de réponse initial du serveur.

### Problèmes fréquents dans Reboul
- Requêtes API lentes
- Pas de mise en cache
- Génération de page coûteuse

### Solutions recommandées

#### Mise en cache côté serveur
```typescript
// Mise en cache des données fréquemment utilisées avec SWR
export async function getProducts(category: string) {
  return useSWR(
    `/api/products?category=${category}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 600000, // 10 minutes
    }
  )
}
```

#### Configuration de Cache-Control
```typescript
// Dans les routes API
export async function GET() {
  // Récupérer les données
  const data = await fetchData()
  
  // Définir les en-têtes de cache appropriés
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300'
    }
  })
}
```

#### Optimisation des requêtes SQL
```typescript
// S'assurer que les requêtes sont optimisées et indexées
export async function getProductsByCategory(category: string) {
  // Optimiser en utilisant des jointures sélectives
  // et en limitant les colonnes retournées
  const query = `
    SELECT p.id, p.name, p.price, p.slug, 
           v.color_name, v.main_image_url
    FROM products p
    JOIN variants v ON p.id = v.product_id
    WHERE p.category_id = $1
      AND p.is_active = true
      AND v.is_main_variant = true
    LIMIT 20;
  `
  
  return db.query(query, [category])
}
```

## 5. Stratégies globales

### Images optimisées
- Convertir toutes les images en WebP ou AVIF
- Utiliser un format de qualité adaptative en fonction de la connexion
- Mettre en place un service de redimensionnement automatique des images

### Optimisation du bundle JavaScript
- Mettre en place la tree-shaking pour éliminer le code inutilisé
- Diviser le code en chunks plus petits
- Utiliser la compression Brotli pour les assets

### Surveillance continue
- Configurer des alertes pour les régressions de performance
- Intégrer les tests de performance dans la CI/CD
- Monitorer les Web Vitals en production avec le composant WebVitalsMonitor

## Plan de mise en œuvre

1. **Phase 1: Optimisation des images** (priorité haute)
   - Convertir toutes les images en format WebP/AVIF
   - Ajouter `priority` aux images LCP
   - Implémenter les placeholders LQIP

2. **Phase 2: Optimisation du JavaScript** (priorité haute)
   - Revoir le code splitting
   - Optimiser les gestionnaires d'événements
   - Auditer et supprimer les dépendances inutilisées

3. **Phase 3: Amélioration du serveur** (priorité moyenne)
   - Revoir la stratégie de mise en cache
   - Optimiser les requêtes de base de données
   - Ajouter la compression des réponses

4. **Phase 4: Affinements structurels** (priorité basse)
   - Optimiser la structure HTML
   - Améliorer l'architecture des composants
   - Optimiser les animations et transitions 