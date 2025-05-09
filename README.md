This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# reboul-store-v0

# REBOUL - Système d'animations GSAP

Ce projet utilise GSAP pour créer des animations fluides et performantes. Voici un guide pour utiliser le système d'animations mis en place.

## Composants d'animation disponibles

### 1. ScrollTriggerAnimation

Anime les éléments au défilement de la page.

```jsx
import { ScrollTriggerAnimation } from '@/components/animations';

<ScrollTriggerAnimation
  startPosition="top 80%"
  duration={0.7}
  stagger={0.1}
>
  <div className="card-item">Item 1</div>
  <div className="card-item">Item 2</div>
  <div className="card-item">Item 3</div>
</ScrollTriggerAnimation>
```

### 2. FadeInAnimation

Animation simple de fondu à l'entrée.

```jsx
import { FadeInAnimation } from '@/components/animations';

<FadeInAnimation delay={0.2} duration={0.5} y={30}>
  <h2>Titre avec animation</h2>
</FadeInAnimation>
```

### 3. ParallaxSection

Crée un effet de parallaxe sur une section.

```jsx
import { ParallaxSection } from '@/components/animations';

<ParallaxSection 
  bgImage="/images/background.jpg"
  speed={0.5}
  direction="vertical"
>
  <div className="container mx-auto p-8">
    <h2>Section avec effet parallaxe</h2>
  </div>
</ParallaxSection>
```

### 4. TextAnimation

Animation des mots individuellement.

```jsx
import { TextAnimation } from '@/components/animations';

<TextAnimation
  text="REBOUL redéfinit l'expérience shopping"
  tag="h2"
  wordStagger={0.05}
  animateOnScroll={true}
/>
```

## Utiliser le hook useGSAP

Pour des animations personnalisées, vous pouvez utiliser le hook `useGSAP`:

```jsx
import { useGSAP } from '@/components/animations';

function MyComponent() {
  const { gsap, ScrollTrigger, isReady } = useGSAP();
  const myElementRef = useRef(null);
  
  useEffect(() => {
    if (!isReady || !gsap || !myElementRef.current) return;
    
    // Créer votre animation GSAP
    gsap.from(myElementRef.current, {
      opacity: 0,
      duration: 1,
      y: 50
    });
    
  }, [isReady, gsap]);
  
  return <div ref={myElementRef}>Contenu animé</div>;
}
```

## Configuration d'une page avec animations

Le système d'animations est déjà initialisé dans l'application. Importez simplement les composants dont vous avez besoin:

```jsx
import { 
  ScrollTriggerAnimation, 
  FadeInAnimation, 
  ParallaxSection 
} from '@/components/animations';

export function MyPage() {
  return (
    <main>
      <FadeInAnimation>
        <h1>Titre principal</h1>
      </FadeInAnimation>
      
      <ParallaxSection bgImage="/background.jpg">
        <div className="content">
          <h2>Section avec parallaxe</h2>
        </div>
      </ParallaxSection>
      
      <ScrollTriggerAnimation>
        <div className="card-item">Item 1</div>
        <div className="card-item">Item 2</div>
        <div className="card-item">Item 3</div>
      </ScrollTriggerAnimation>
    </main>
  );
}
```

## Bonnes pratiques

1. Utilisez `clearProps: 'transform'` pour éviter les problèmes de mise en page après l'animation
2. Pensez à la performance mobile en utilisant des animations plus simples sur petit écran
3. Utilisez les composants d'animation fournis pour une cohérence visuelle
4. Préférez les animations déclenchées au scroll pour une meilleure expérience utilisateur
5. Pour les animations complexes, utilisez des timelines GSAP avec le hook useGSAP

# Reboul Store - React Version

## Comment exécuter le projet

1. Cloner le dépôt
2. Installer les dépendances: `npm install`
3. Lancer le serveur de développement: `npm run dev`
4. Pour construire l'application: `npm run build`
5. Pour déployer l'application: `./deploy.sh`

## Architecture

Ce projet utilise:
- Next.js 14
- React
- Typescript
- Tailwind CSS
- shadcn/ui

## Résolution des problèmes courants

### Erreurs liées à useSearchParams()

Si vous rencontrez l'erreur suivante lors de la compilation:
```
useSearchParams() should be wrapped in a suspense boundary at page "/page"
```

Cette erreur se produit car `useSearchParams()` doit être utilisé à l'intérieur d'une limite Suspense.

#### Solution:

1. Assurez-vous que toutes vos pages sont enveloppées dans le composant `ClientPageWrapper`:

```tsx
import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';

export const viewport: Viewport = defaultViewport;

export default function MaPage() {
  return (
    <ClientPageWrapper>
      {/* Votre contenu ici */}
    </ClientPageWrapper>
  );
}
```

2. N'utilisez pas `useSearchParams()` dans les composants qui sont utilisés en dehors d'un `Suspense`. Si vous devez utiliser `useSearchParams()`, assurez-vous que le composant est appelé uniquement à l'intérieur d'un `Suspense`.

3. Si vous créez un nouveau composant qui utilise `useSearchParams()`, enveloppez-le dans un Suspense:

```tsx
import { Suspense } from 'react';

export function MonComposant() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MonComposantAvecSearchParams />
    </Suspense>
  );
}
```

4. Pour appliquer automatiquement `ClientPageWrapper` à toutes les pages, vous pouvez utiliser le script `fix-pages-v2.js`:

```
node fix-pages-v2.js
```

### Autres problèmes

Si vous rencontrez d'autres problèmes, veuillez consulter la documentation de Next.js ou ouvrir une issue sur le dépôt.

## Déploiement

Le script `deploy.sh` vous permet de construire l'application et de préparer les fichiers pour le déploiement. Il effectue les étapes suivantes:

1. Vérification que tous les changements sont commités
2. Installation des dépendances
3. Vérification des types
4. Linting du code
5. Construction de l'application
6. Préparation du dossier de distribution

Pour déployer l'application, exécutez simplement:

```
./deploy.sh
```

## Optimisation des images

Reboul utilise désormais les formats d'image modernes (WebP et AVIF) pour améliorer les performances et les Web Vitals.

### Conversion des images

Pour convertir les images existantes en formats optimisés :

```bash
npm run convert-images
```

Ce script génère des versions WebP et AVIF de toutes les images dans le dossier `public/` et les stocke dans `public/optimized/`.

### Utilisation dans le code

Le composant `OptimizedImage` a été amélioré pour utiliser automatiquement les formats modernes :

```jsx
import { OptimizedImage } from '@/components/optimized/OptimizedImage'

<OptimizedImage
  src="/images/monimage.jpg"
  alt="Description"
  width={800}
  height={600}
  isLCP={true}
/>
```

Pour plus d'informations, consultez la [documentation sur l'optimisation des images](docs/image-optimization.md).
