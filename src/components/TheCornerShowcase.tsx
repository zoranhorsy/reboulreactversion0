"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { DefinitiveProductCard } from "./DefinitiveProductCard";
import { api, type Product } from "@/lib/api";
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

export function TheCornerShowcase() {
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

  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCornerProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchCornerProducts({
          limit: "50",
        });

        const shuffled = [...response.products].sort(() => 0.5 - Math.random());

        // S'assurer que tous les produits ont is_corner_product défini à true
        const productsWithFlag = shuffled.map((product) => ({
          ...product,
          is_corner_product: true,
        }));

        const randomProducts = productsWithFlag.slice(0, 8);
        const featured = productsWithFlag.slice(8, 11); // 3 produits pour la section hero

        setProducts(randomProducts);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des produits The Corner:",
          err,
        );
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCornerProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 sm:py-12 md:py-16">
        <span>⏳</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-muted-foreground p-4">{error}</div>;
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Section d'en-tête avec image de fond et cartes produits */}
      <div className="relative overflow-hidden bg-zinc-900">
        {/* Image de fond avec effet flou */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <div
              className="/images/header/thecorner/1.png')] 
                            bg-cover bg-center bg-no-repeat
                            transition-opacity duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/70 to-transparent backdrop-blur-sm" />
          </div>
        </div>

        {/* Contenu de l'en-tête */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20">
          {/* Logo */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <Image
                src="/images/the-corner-logo-white.png"
                alt="The Corner Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex flex-col">
            <div className="max-w-2xl mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
                The Corner
              </h1>
              <p className="text-lg sm:text-xl text-zinc-300">
                Découvrez notre sélection exclusive de produits rares et limités
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
                {products.map((product, index) => (
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
                      <DefinitiveProductCard 
                        product={product} 
                        index={index}
                        baseUrl="/the-corner"
                        variant="corner"
                        size="small"
                        showDescription={false}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="flex items-center justify-center gap-2 mt-8 sm:hidden">
                <CarouselPrevious className="relative inset-auto h-8 w-8 text-white border-white/20 hover:bg-white/20" />
                <CarouselNext className="relative inset-auto h-8 w-8 text-white border-white/20 hover:bg-white/20" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
}
