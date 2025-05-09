'use client'

import React, { useRef, useEffect } from 'react';
import { HeroSection } from '../HeroSection';
import { FeaturedProducts } from '../FeaturedProducts';
import { LoadingIndicator } from '../LoadingIndicator';
import { createViewportLoadedComponent, useIdlePreload } from '@/lib/dynamic-loading-strategies';

// Skeletons pour le chargement
const StoreSelectionSkeleton = () => (
  <div className="container py-16">
    <div className="h-12 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
      <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
    </div>
  </div>
);

const CollectionsSkeleton = () => (
  <div className="container py-16">
    <div className="h-12 w-72 bg-gray-200 dark:bg-zinc-800 rounded-md mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-80 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
      ))}
    </div>
  </div>
);

const ProductsSkeleton = () => (
  <div className="container py-16">
    <div className="h-12 w-72 bg-gray-200 dark:bg-zinc-800 rounded-md mb-8 animate-pulse"></div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
      ))}
    </div>
  </div>
);

// Composants avec chargement basé sur la visibilité
const LazyStoreSelection = createViewportLoadedComponent<any>(
  () => import('../StoreSelection').then(mod => ({ default: mod.StoreSelection })),
  {
    loadingComponent: <StoreSelectionSkeleton />,
    threshold: 0.1,
    rootMargin: '200px',
    preload: true,
    priority: 'high',
  }
);

const LazyLatestCollections = createViewportLoadedComponent<any>(
  () => import('../LatestCollections').then(mod => ({ default: mod.LatestCollections })),
  {
    loadingComponent: <CollectionsSkeleton />,
    threshold: 0.1,
    rootMargin: '200px',
  }
);

const LazyRandomAdultProducts = createViewportLoadedComponent<any>(
  () => import('../RandomAdultProducts').then(mod => ({ default: mod.RandomAdultProducts })),
  {
    loadingComponent: <ProductsSkeleton />,
    threshold: 0.1,
    rootMargin: '200px',
  }
);

const LazyRandomSneakersProducts = createViewportLoadedComponent<any>(
  () => import('../RandomSneakersProducts').then(mod => ({ default: mod.RandomSneakersProducts })),
  {
    loadingComponent: <ProductsSkeleton />,
    threshold: 0.1,
    rootMargin: '200px',
  }
);

const LazyRandomKidsProducts = createViewportLoadedComponent<any>(
  () => import('../RandomKidsProducts').then(mod => ({ default: mod.RandomKidsProducts })),
  {
    loadingComponent: <ProductsSkeleton />,
    threshold: 0.1,
    rootMargin: '300px',
  }
);

const LazyTheCornerShowcase = createViewportLoadedComponent<any>(
  () => import('../TheCornerShowcase').then(mod => ({ default: mod.TheCornerShowcase })),
  {
    loadingComponent: <div className="h-96 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md my-16"></div>,
    threshold: 0.1,
    rootMargin: '300px',
  }
);

const LazyArchives = createViewportLoadedComponent<any>(
  () => import('../Archives').then(mod => ({ default: mod.Archives })),
  {
    loadingComponent: <div className="h-80 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md my-16"></div>,
    threshold: 0.1,
    rootMargin: '300px',
  }
);

const LazyAdvantages = createViewportLoadedComponent<any>(
  () => import('../Advantages').then(mod => ({ default: mod.Advantages })),
  {
    loadingComponent: <div className="h-64 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md my-16"></div>,
    threshold: 0.1,
    rootMargin: '300px',
  }
);

/**
 * Version optimisée du contenu de la page d'accueil
 * 
 * Cette implémentation utilise les stratégies de chargement dynamique pour réduire
 * significativement la taille du bundle JavaScript initial. Les composants sont chargés
 * uniquement lorsqu'ils deviennent visibles dans le viewport.
 */
export default function OptimizedHomeContent() {
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Préchargement intelligent des sections importantes pendant les périodes d'inactivité
  useIdlePreload([
    { fn: () => import('../StoreSelection'), priority: 'high' },
    { fn: () => import('../LatestCollections'), priority: 'medium' },
    { fn: () => import('../RandomAdultProducts'), priority: 'medium' },
    { fn: () => import('../TheCornerShowcase'), priority: 'low' },
  ]);

  // Mesure de l'impact sur les performances
  useEffect(() => {
    const startTime = performance.now();
    
    // Mesurer le LCP (approximation)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        console.log('LCP:', entries[0].startTime);
        observer.disconnect();
      }
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    
    return () => {
      // Mesurer le temps total de montage du composant
      const totalTime = performance.now() - startTime;
      console.log('Temps de montage total (ms):', totalTime.toFixed(2));
      
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* Section principale - Chargée immédiatement pour optimiser le LCP */}
      <HeroSection />
      
      {/* Sections chargées dynamiquement basées sur la visibilité */}
      <LazyStoreSelection />
      
      {/* Section de produits en vedette - Chargée immédiatement car importante */}
      <FeaturedProducts />
      
      {/* Sections secondaires - Chargées lorsqu'elles deviennent visibles */}
      <LazyLatestCollections />
      <LazyRandomAdultProducts />
      <LazyRandomSneakersProducts />
      <LazyRandomKidsProducts />
      
      {/* Sections finales - Chargées lorsqu'elles deviennent visibles */}
      <LazyTheCornerShowcase />
      <LazyArchives />
      <LazyAdvantages />
    </div>
  );
} 