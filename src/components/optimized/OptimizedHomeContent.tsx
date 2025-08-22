"use client";

import React, { useRef, useEffect } from "react";
import { HeroSection } from "../HeroSection";
import { CollectionsCarousel } from "../CollectionsCarousel";
import OptimizedFeaturedProducts from "./OptimizedFeaturedProducts";
import OptimizedStoreSelection from "./OptimizedStoreSelection";
import dynamic from "next/dynamic";

// Import dynamique de LatestCollections
const DynamicLatestCollections = dynamic(() => import("../LatestCollections"), {
  loading: () => (
    <div className="w-full relative py-16">
      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl aspect-[16/8] animate-pulse" />
    </div>
  ),
  ssr: true,
});

// Import dynamique de ConceptStore
const DynamicConceptStore = dynamic(
  () => import("../ConceptStore").then((mod) => mod.ConceptStore),
  {
    loading: () => (
      <div className="w-full relative py-16">
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl aspect-[16/8] animate-pulse">
          <div className="h-full w-full flex items-center justify-center text-zinc-400">
            Chargement de l&apos;univers REBOUL...
          </div>
        </div>
      </div>
    ),
    ssr: true,
  },
);

export default function OptimizedHomeContent() {
  const mainRef = useRef<HTMLDivElement>(null);

  // Mesure de performance simple
  useEffect(() => {
    const startTime = performance.now();
    const mountTime = performance.now() - startTime;
    console.log("⚡ Temps de montage:", mountTime.toFixed(2) + "ms");
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* Section principale */}
      <div className="opacity-100">
        <HeroSection />
      </div>

      {/* Carousel des collections */}
      <div className="opacity-100 mb-8">
        <CollectionsCarousel />
      </div>

      {/* Sections */}
      <div className="opacity-100">
        <OptimizedFeaturedProducts />
      </div>

      <div className="opacity-100">
        <OptimizedStoreSelection />
      </div>

      <div className="opacity-100">
        <DynamicLatestCollections />
      </div>

      <div className="opacity-100">
        <DynamicConceptStore />
      </div>
    </div>
  );
}
