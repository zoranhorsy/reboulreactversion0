'use client'

import React, { useRef, Suspense } from 'react';
import { HeroSection } from '../HeroSection';
import { LazyLoadWrapper } from '../LazyLoadWrapper';
import { FeaturedProducts } from '../FeaturedProducts';
import { RandomAdultProducts } from '../RandomAdultProducts';
import { RandomSneakersProducts } from '../RandomSneakersProducts';
import { RandomKidsProducts } from '../RandomKidsProducts';
import { TheCornerShowcase } from '../TheCornerShowcase';
import { Archives } from '../Archives';
import { Advantages } from '../Advantages';
import { LoadingIndicator } from '../LoadingIndicator';

// Import dynamique pour les composants volumineux
import dynamic from 'next/dynamic';

// Définition des imports dynamiques
const DynamicStoreSelection = dynamic(() => import('../StoreSelection').then(mod => ({ default: mod.StoreSelection })), {
  loading: () => <LoadingIndicator />,
  ssr: true
});

const DynamicLatestCollections = dynamic(() => import('../LatestCollections').then(mod => ({ default: mod.LatestCollections })), {
  loading: () => <LoadingIndicator />,
  ssr: true
});

// Version simplifiée sans animations GSAP pour résoudre l'erreur
export default function OptimizedHomeContent() {
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={mainRef} className="relative">
      {/* Sections avec priorité d'affichage - Visibles immédiatement */}
      <HeroSection />
      
      {/* Sections chargées dynamiquement via le code splitting */}
      <Suspense fallback={<LoadingIndicator />}>
        <DynamicStoreSelection />
      </Suspense>
      
      {/* Produits en vedette - Priorité moyenne */}
      <FeaturedProducts />
      
      {/* Collections récentes - Chargées de façon paresseuse */}
      <Suspense fallback={<LoadingIndicator />}>
        <DynamicLatestCollections />
      </Suspense>
      
      {/* Utiliser le composant standard */}
      <RandomAdultProducts />
      
      {/* Autres sections de produits */}
      <RandomSneakersProducts />
      <RandomKidsProducts />
      
      {/* Sections finales */}
      <TheCornerShowcase />
      <Archives />
      <Advantages />
    </div>
  );
} 