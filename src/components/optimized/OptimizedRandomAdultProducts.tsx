"use client";

import React, { useState, useEffect } from "react";
import { FeaturedProductCard } from "../products/FeaturedProductCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { Product } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useSWRApi";
import { OptimizedImage } from "./OptimizedImage";

export function OptimizedRandomAdultProducts() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: true,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ],
  );

  // Utiliser notre hook SWR pour charger les produits
  const {
    products: allProducts,
    isLoading,
    error,
  } = useProducts({
    store_type: "adult",
    limit: "50",
  });

  // Mélanger les produits et les séparer en deux groupes
  const shuffleProducts = (products: Product[] = []) => {
    return [...products].sort(() => 0.5 - Math.random());
  };

  const shuffledProducts = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0)
      return { carousel: [], featured: [] };

    const shuffled = shuffleProducts(allProducts);
    return {
      carousel: shuffled.slice(0, 8),
      featured: shuffled.slice(8, 11),
    };
  }, [allProducts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 sm:py-12 md:py-16">
        <span>⏳</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground p-4">
        {error.message ||
          "Une erreur est survenue lors du chargement des produits"}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Section d'en-tête avec image de fond et cartes produits */}
      <div className="relative overflow-hidden bg-zinc-900">
        {/* Image de fond avec effet flou */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <div className="bg-[url('/images/header/reboul/1.png')] bg-cover bg-center bg-no-repeat w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/70 to-transparent backdrop-blur-sm" />
          </div>
        </div>

        {/* Contenu de l'en-tête */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20">
          {/* Logo */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <OptimizedImage
                src="/images/logo_light.png"
                alt="Reboul Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex flex-col">
            <div className="max-w-2xl mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
                Produits Adultes
              </h1>
              <p className="text-lg sm:text-xl text-zinc-300">
                Explorez notre sélection exclusive de produits réservés aux
                adultes
              </p>
            </div>

            {/* Carousel intégré dans le hero */}
            <Carousel
              ref={emblaRef}
              className="w-full relative"
              opts={{
                loop: true,
                align: "start",
                skipSnaps: false,
                dragFree: true,
                containScroll: "trimSnaps",
              }}
            >
              <CarouselContent>
                {shuffledProducts.carousel.map((product, index) => (
                  <CarouselItem
                    key={product.id}
                    className="pl-1 sm:pl-2 md:pl-3
                                            basis-[49%]
                                            xs:basis-[45%] 
                                            sm:basis-[33.333%] 
                                            md:basis-[25%] 
                                            lg:basis-[20%] 
                                            xl:basis-[16.666%]"
                  >
                    <div className="h-full">
                      <FeaturedProductCard
                        product={product}
                        
                        className="border-0 bg-white/10 backdrop-blur-md text-white"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="flex items-center justify-center gap-2 mt-8 sm:hidden">
                <CarouselPrevious className="relative static translate-y-0 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                <CarouselNext className="relative static translate-y-0 bg-white/10 border-white/20 text-white hover:bg-white/20" />
              </div>
            </Carousel>

            <div className="mt-8 text-center">
              <Button
                asChild
                className="bg-white text-zinc-900 hover:bg-zinc-100 py-6 px-8 text-base"
              >
                <Link href="/catalogue?store_type=adult">
                  Voir tout <span>→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section produits en vedette */}
      <div className="py-16 sm:py-20 container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">
              Produits en vedette
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Découvrez notre sélection exclusive de produits adultes
            </p>
          </div>
          <Link
            href="/catalogue?store_type=adult&featured=true"
            className="inline-flex items-center mt-4 md:mt-0 text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Voir plus
            <span>→</span>
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {shuffledProducts.featured.map((product, index) => (
            <div key={product.id} className="group">
              <FeaturedProductCard
                product={product}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
