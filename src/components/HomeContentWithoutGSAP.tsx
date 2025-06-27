"use client";

import React, { useRef } from "react";
import { HeroSection } from "./HeroSection";
import {
  DynamicStoreSelection,
  DynamicLatestCollections,
} from "./dynamic-imports";
import { LazyLoadWrapper } from "./LazyLoadWrapper";
import { FeaturedProducts } from "./FeaturedProducts";
import { TheCornerShowcase } from "./TheCornerShowcase";
import { Archives } from "./Archives";
import { Advantages } from "./Advantages";
import Link from "next/link";
import { useScrollReveal, useStaggerReveal } from "@/hooks/useScrollReveal";
import "@/styles/animation-utils.css";

/**
 * Version optimisée de HomeContent sans GSAP
 *
 * Cette version remplace toutes les animations GSAP par des animations CSS
 * et des hooks personnalisés pour de meilleures performances.
 *
 * Avantages :
 * - Réduction de ~140KB de JavaScript
 * - Pas de blocage du thread principal au chargement
 * - Animations plus fluides et performantes
 * - Support natif de prefers-reduced-motion
 */
export function HomeContentWithoutGSAP() {
  const mainRef = useRef<HTMLDivElement>(null);

  // Hook pour révéler les sections principales
  const { elementRef: heroRef } = useScrollReveal({
    threshold: 0.2,
    once: true,
    visibleClass: "animate-fade-in-up",
  });

  // Hook pour les animations en cascade des produits
  const { containerRef: featuredRef } = useStaggerReveal({
    threshold: 0.1,
    once: true,
    staggerDelay: 150,
    visibleClass: "stagger-container",
  });

  // Hook pour les sections secondaires
  const { elementRef: storeRef } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "50px",
    once: true,
    delay: 200,
    visibleClass: "scroll-reveal",
  });

  const { elementRef: collectionsRef } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "50px",
    once: true,
    delay: 300,
    visibleClass: "scroll-reveal",
  });

  return (
    <div ref={mainRef} className="relative">
      {/* Section héro avec animation d'entrée */}
      <div
        ref={heroRef as React.RefObject<HTMLDivElement>}
        className="gsap-section"
      >
        <HeroSection />
      </div>

      {/* Section sélection de magasin */}
      <div
        ref={storeRef as React.RefObject<HTMLDivElement>}
        className="scroll-reveal opacity-0"
      >
        
      </div>

      {/* Section produits en vedette avec animation staggered */}
      <div
        ref={featuredRef as React.RefObject<HTMLDivElement>}
        className="stagger-container"
      ></div>

      {/* Section collections avec animation */}
      <div
        ref={collectionsRef as React.RefObject<HTMLDivElement>}
        className="scroll-reveal opacity-0"
      >
      
      </div>

      {/* Sections produits avec animations individuelles */}
      <AnimatedSection delay={700}>
        <FeaturedProducts />
      </AnimatedSection>

      <AnimatedSection delay={800}>
        <Archives />
      </AnimatedSection>

      <AnimatedSection delay={900}>
        <Advantages />
      </AnimatedSection>
    </div>
  );
}

/**
 * Composant wrapper pour animer les sections individuelles
 */
function AnimatedSection({
  children,
  delay = 0,
  animationClass = "scroll-reveal",
  threshold = 0.1,
}: {
  children: React.ReactNode;
  delay?: number;
  animationClass?: string;
  threshold?: number;
}) {
  const { elementRef } = useScrollReveal({
    threshold,
    rootMargin: "100px",
    once: true,
    delay,
    visibleClass: "in-view",
  });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${animationClass} opacity-0`}
    >
      {children}
    </div>
  );
}

/**
 * Composant pour les titres animés (remplace gsap-title)
 */
export function AnimatedTitle({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { elementRef } = useScrollReveal({
    threshold: 0.5,
    once: true,
    delay,
    visibleClass: "animated",
  });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`gsap-title ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Composant pour les cartes produits avec effet stagger
 */
export function AnimatedProductGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { containerRef } = useStaggerReveal({
    threshold: 0.1,
    staggerDelay: 100,
    once: true,
  });

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`stagger-container ${className}`}
    >
      {children}
    </div>
  );
}

export default HomeContentWithoutGSAP;
