"use client";

import React from "react";
import { gsap } from "gsap";

// Données statiques des collections avec images
const STORE_COLLECTIONS = [
  {
    id: "adult",
    title: "REBOUL STORE 2.0",
    href: "/catalogue?store_type=adult",
    description: "COLLECTION ADULTE 2.0",
    tagline: "Style et élégance pour tous",
    image: "/images/collections/adult-collection.jpg",
  },
  {
    id: "kids",
    title: "LES MINOTS DE REBOUL",
    href: "/kids",
    description: "COLLECTION ENFANT",
    tagline: "Mode tendance pour les petits",
    image: "/images/collections/kids-collection.jpg",
  },
  {
    id: "sneakers",
    title: "SNEAKERS",
    href: "/sneakers",
    description: "ÉDITION LIMITÉE",
    tagline: "Pour les passionnés de streetwear",
    image: "/images/collections/sneakers-collection.jpg",
  },
  {
    id: "cpcompany",
    title: "THE CORNER MARSEILLE",
    href: "/the-corner",
    description: "C.P.COMPANY",
    tagline: "L'exclusivité à l'italienne",
    image: "/images/collections/cp-company.jpg",
  },
];

interface StoreCollectionItemProps {
  collection: typeof STORE_COLLECTIONS[0];
}

const StoreCollectionItem: React.FC<StoreCollectionItemProps> = ({ collection }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

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
    );
  };

  const repeatedMarqueeContent = React.useMemo(() => {
    return Array.from({ length: 4 }).map((_, idx) => (
      <React.Fragment key={idx}>
        <div className="flex flex-col items-center gap-2 px-[2vw]">
          <span className="text-zinc-900 dark:text-zinc-900 uppercase font-medium text-[4vh] leading-[1.2]">
            {collection.title}
          </span>
          <span className="text-sm font-light text-zinc-600 dark:text-zinc-600">
            {collection.description}
          </span>
          <span className="text-xs font-light text-zinc-500 dark:text-zinc-500 italic">
            {collection.tagline}
          </span>
        </div>
        <div
          className="w-[200px] h-[7vh] my-[2em] mx-[2vw] rounded-[12px] bg-cover bg-center border border-zinc-200"
          style={{ 
            backgroundImage: `url(${collection.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </React.Fragment>
    ));
  }, [collection]);

  return (
    <div
      className="flex-1 relative overflow-hidden text-center border-b border-zinc-100 dark:border-white/5 last:border-b-0"
      ref={itemRef}
    >
      <a
        className="flex items-center justify-center h-full relative cursor-pointer 
                   uppercase no-underline font-geist font-medium text-zinc-800 dark:text-zinc-200 text-[4vh] 
                   hover:text-zinc-900 dark:hover:text-zinc-900
                   focus:text-zinc-800 focus-visible:text-zinc-900 
                   dark:focus:text-zinc-200 dark:focus-visible:text-zinc-900
                   transition-all duration-300 py-16 group"
        href={collection.href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="relative">
            {collection.title}
            <span
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-zinc-800 dark:bg-zinc-200 
                         group-hover:bg-zinc-900 dark:group-hover:bg-zinc-900 group-hover:w-full transition-all duration-300"
            ></span>
          </span>
          <span
            className="text-sm font-light font-geist text-zinc-500 dark:text-zinc-400 
                       group-hover:text-zinc-600 dark:group-hover:text-zinc-600 
                       transition-colors duration-300"
          >
            {collection.description}
          </span>
        </div>
      </a>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none 
                   bg-white dark:bg-white translate-y-[101%]"
        ref={marqueeRef}
      >
        <div className="h-full w-[200%] flex" ref={marqueeInnerRef}>
          <div className="flex items-center relative h-full w-[200%] will-change-transform animate-marquee">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OptimizedStoreSelection() {
  return (
    <section className="w-full bg-white dark:bg-zinc-950">
      <div className="w-full">
        <nav className="flex flex-col h-full">
          {STORE_COLLECTIONS.map((collection) => (
            <StoreCollectionItem 
              key={collection.id} 
              collection={collection} 
            />
          ))}
        </nav>
      </div>
    </section>
  );
}
