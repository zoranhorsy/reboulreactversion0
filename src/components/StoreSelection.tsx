"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { Api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

// Types pour les données de collections
interface StoreCollection {
  id: string;
  title: string;
  image: string;
  href: string;
  description: string;
  tagline: string;
  productCount?: number;
  newProductsCount?: number;
  hasNewProducts?: boolean;
}

// Type pour les props du MenuItem
interface MenuItemProps extends StoreCollection {
  index: number;
}

// Données statiques des collections
const STORE_COLLECTIONS: StoreCollection[] = [
  {
    id: "adult",
    title: "REBOUL ADULTE",
    image: "/images/collections/adult-collection.jpg",
    href: "/catalogue?store_type=adult",
    description: "COLLECTION ADULTE",
    tagline: "Style et élégance pour tous",
  },
  {
    id: "kids",
    title: "LES MINOTS DE REBOUL",
    image: "/images/collections/kids-collection.jpg",
    href: "/catalogue?store_type=kids",
    description: "COLLECTION ENFANT",
    tagline: "Mode tendance pour les petits",
  },
  {
    id: "sneakers",
    title: "SNEAKERS",
    image: "/images/collections/sneakers-collection.jpg",
    href: "/catalogue?store_type=sneakers",
    description: "ÉDITION LIMITÉE",
    tagline: "Pour les passionnés de streetwear",
  },
  {
    id: "cpcompany",
    title: "THE CORNER MARSEILLE",
    image: "/images/collections/cp-company.jpg",
    href: "/the-corner",
    description: "C.P.COMPANY",
    tagline: "L'exclusivité à l'italienne",
  },
];

// Composant MenuItem avec flowing menu effect
const MenuItem: React.FC<MenuItemProps> = ({
  title,
  image,
  href,
  description,
  tagline,
  productCount,
  hasNewProducts,
  newProductsCount,
  index,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const animationDefaults = { duration: 0.6, ease: "expo" };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ): "top" | "bottom" => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist =
      Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;

    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;

    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );

    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }).to(
      marqueeInnerRef.current,
      { y: edge === "top" ? "101%" : "-101%" },
      "-=0.6",
    );
  };

  // Contenu du marquee répété
  const marqueeContent = Array.from({ length: 4 }).map((_, idx) => (
    <div key={idx} className="flex items-center gap-6 mx-12">
      <div className="flex flex-col items-start">
        <span className="uppercase font-geist text-[4vh] leading-[1.2] whitespace-nowrap text-black">
          {title}
        </span>
        <span className="text-sm font-light font-geist whitespace-nowrap text-zinc-600">
          {tagline}
        </span>
        {productCount !== undefined && (
          <span className="text-xs mt-1 font-geist text-zinc-500">
            {productCount} articles disponibles
          </span>
        )}
      </div>
      <div
        className="w-[300px] h-[15vh] rounded-xl bg-cover bg-center shadow-sm"
        style={{ backgroundImage: `url(${image})` }}
      />
    </div>
  ));

  return (
    <div
      ref={itemRef}
      className={`flex-1 relative overflow-hidden text-center
                     animate-fade-in-up [animation-delay:${index * 150}ms]
                     [animation-fill-mode:backwards]`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer 
                         uppercase no-underline font-geist font-medium text-zinc-800 dark:text-zinc-200 text-[4vh] 
                         hover:text-black dark:hover:text-black
                         focus:text-zinc-800 focus-visible:text-black 
                         dark:focus:text-zinc-200 dark:focus-visible:text-white
                         transition-all duration-300 py-8 sm:py-12 group
                         hover:bg-zinc-50 dark:hover:bg-white"
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="relative">
            {title}
            <span
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black dark:bg-white 
                                     group-hover:bg-black dark:group-hover:bg-black group-hover:w-full transition-all duration-300"
            ></span>
          </span>
          <span
            className="text-sm font-light font-geist text-zinc-500 dark:text-zinc-400 
                                 group-hover:text-zinc-600 dark:group-hover:text-zinc-600 
                                 transition-colors duration-300"
          >
            {description}
          </span>
          {hasNewProducts && (
            <div
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full 
                            text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping-slow"></span>
              <span>{newProductsCount} nouveautés</span>
            </div>
          )}
        </div>
      </a>

      {/* Flowing marquee overlay */}
      <div
        ref={marqueeRef}
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none 
                         bg-white backdrop-blur-[2px] translate-y-[101%]"
      >
        <div
          ref={marqueeInnerRef}
          className="h-full w-[200%] flex translate-y-[-101%]"
        >
          <div className="flex items-center relative h-full w-[200%] animate-marquee">
            {marqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StoreSelection() {
  const { resolvedTheme } = useTheme();
  const [collections, setCollections] =
    useState<StoreCollection[]>(STORE_COLLECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Animation optimisée au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && sectionRef.current) {
            const ctx = gsap.context(() => {
              gsap.to(sectionRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                clearProps: "transform",
              });
            });
            observer.disconnect();
            return () => ctx.revert();
          }
        });
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadCollectionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const api = new Api();
      const stats = await api.fetchCollectionStats();

      const enrichedCollections = STORE_COLLECTIONS.map((collection) => {
        const storeStats = stats[collection.id] || { total: 0, new: 0 };
        return {
          ...collection,
          productCount: storeStats.total,
          newProductsCount: storeStats.new,
          hasNewProducts: storeStats.new > 0,
        };
      });

      setCollections(enrichedCollections);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données des collections:",
        error,
      );

      const simulatedData = STORE_COLLECTIONS.map((collection) => ({
        ...collection,
        productCount:
          collection.id === "adult"
            ? 178
            : collection.id === "kids"
              ? 94
              : collection.id === "sneakers"
                ? 67
                : 42,
        newProductsCount:
          collection.id === "adult" ? 12 : collection.id === "kids" ? 8 : 0,
        hasNewProducts: ["adult", "kids"].includes(collection.id),
      }));

      setCollections(simulatedData);
      toast({
        title: "Information",
        description:
          "Chargement des données de démonstration (mode hors ligne)",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollectionsData();
  }, [loadCollectionsData]);

  if (isLoading) {
    return (
      <section
        ref={sectionRef}
        className={`w-full min-h-[20vh] sm:min-h-[30vh] animate-fade-in-up
                         ${resolvedTheme === "dark" ? "bg-zinc-950" : "bg-white"}`}
      >
        <div className="w-full">
          <div className="animate-pulse space-y-4 py-4 sm:py-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-48 rounded-lg
                                         ${resolvedTheme === "dark" ? "bg-zinc-900/50" : "bg-zinc-100/50"}`}
                style={{
                  animationDelay: `${i * 150}ms`,
                  contain: "strict",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`w-full animate-fade-in-up
                     ${resolvedTheme === "dark" ? "bg-zinc-950" : "bg-white"}`}
    >
      <div className="w-full">
        <div
          className={`flex flex-col divide-y
                              ${resolvedTheme === "dark" ? "divide-white/5" : "divide-zinc-100"}`}
        >
          {collections.map((collection, index) => (
            <MenuItem key={collection.id} {...collection} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
