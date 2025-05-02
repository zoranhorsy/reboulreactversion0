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
