"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSwipeable } from "react-swipeable";

interface CarouselProps {
  items: JSX.Element[];
}

export type CardType = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const Carousel = ({ items }: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback pour les événements tactiles natifs
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Configuration avancée pour react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      console.log("Swipe left détecté", eventData);
      // Swipe vers la gauche = carte suivante
      if (activeIndex < items.length - 1 && !isTransitioning) {
        setIsTransitioning(true);
        setSwipeDirection("left");
        setActiveIndex(activeIndex + 1);

        // Reset après animation
        setTimeout(() => {
          setIsTransitioning(false);
          setSwipeDirection(null);
        }, 600);
      }
    },
    onSwipedRight: (eventData) => {
      console.log("Swipe right détecté", eventData);
      // Swipe vers la droite = carte précédente
      if (activeIndex > 0 && !isTransitioning) {
        setIsTransitioning(true);
        setSwipeDirection("right");
        setActiveIndex(activeIndex - 1);

        // Reset après animation
        setTimeout(() => {
          setIsTransitioning(false);
          setSwipeDirection(null);
        }, 600);
      }
    },
    onSwipedUp: (eventData) => {
      console.log("Swipe up détecté", eventData);
      // Swipe vers le haut = retourner à la première carte
      if (activeIndex !== 0 && !isTransitioning) {
        setIsTransitioning(true);
        setActiveIndex(0);

        setTimeout(() => {
          setIsTransitioning(false);
        }, 600);
      }
    },
    onSwipedDown: (eventData) => {
      console.log("Swipe down détecté", eventData);
      // Swipe vers le bas = aller à la dernière carte
      if (activeIndex !== items.length - 1 && !isTransitioning) {
        setIsTransitioning(true);
        setActiveIndex(items.length - 1);

        setTimeout(() => {
          setIsTransitioning(false);
        }, 600);
      }
    },
    onSwiping: (eventData) => {
      // Feedback visuel pendant le swipe
      const { deltaX, deltaY, absX, absY } = eventData;

      // Ajouter un effet de résistance visuelle seulement si le mouvement est significatif
      if (containerRef.current && (absX > 10 || absY > 10)) {
        const resistance = 0.2;
        const maxOffset = 30;

        let offsetX = deltaX * resistance;
        let offsetY = deltaY * resistance;

        // Limiter l'offset
        offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
        offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));

        containerRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    },
    onTouchEndOrOnMouseUp: () => {
      // Reset de la position après le swipe
      if (containerRef.current) {
        containerRef.current.style.transform = "translate(0px, 0px)";
      }
    },
    onTap: (eventData) => {
      console.log("Tap détecté", eventData);
    },
    // Configuration optimisée pour mobile
    trackMouse: true, // Support souris pour desktop
    trackTouch: true, // Support tactile pour mobile
    preventScrollOnSwipe: false, // Permettre le scroll vertical
    delta: 30, // Distance minimale plus élevée pour éviter les faux positifs
    swipeDuration: 1000, // Durée plus longue pour les gestes lents
    touchEventOptions: { passive: false }, // Pour preventDefault
    rotationAngle: 0, // Pas de rotation
  });

  // Gestionnaires tactiles de fallback
  const handleTouchStart = (e: React.TouchEvent) => {
    console.log("Touch start détecté");
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;

    console.log("Touch end - distances:", { distanceX, distanceY });

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Swipe horizontal
      if (isLeftSwipe && activeIndex < items.length - 1 && !isTransitioning) {
        console.log("Fallback: Swipe left");
        setIsTransitioning(true);
        setSwipeDirection("left");
        setActiveIndex(activeIndex + 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setSwipeDirection(null);
        }, 600);
      }
      if (isRightSwipe && activeIndex > 0 && !isTransitioning) {
        console.log("Fallback: Swipe right");
        setIsTransitioning(true);
        setSwipeDirection("right");
        setActiveIndex(activeIndex - 1);
        setTimeout(() => {
          setIsTransitioning(false);
          setSwipeDirection(null);
        }, 600);
      }
    } else {
      // Swipe vertical
      if (isUpSwipe && activeIndex !== 0 && !isTransitioning) {
        console.log("Fallback: Swipe up");
        setIsTransitioning(true);
        setActiveIndex(0);
        setTimeout(() => setIsTransitioning(false), 600);
      }
      if (isDownSwipe && activeIndex !== items.length - 1 && !isTransitioning) {
        console.log("Fallback: Swipe down");
        setIsTransitioning(true);
        setActiveIndex(items.length - 1);
        setTimeout(() => setIsTransitioning(false), 600);
      }
    }
  };

  // Navigation par clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning) return;

      switch (event.key) {
        case "ArrowLeft":
          if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
          }
          break;
        case "ArrowRight":
          if (activeIndex < items.length - 1) {
            setActiveIndex(activeIndex + 1);
          }
          break;
        case "Home":
          setActiveIndex(0);
          break;
        case "End":
          setActiveIndex(items.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, items.length, isTransitioning]);

  return (
    <div className="relative w-full py-4 md:py-6 lg:py-10 px-2 md:px-4 lg:px-6">
      <div
        {...swipeHandlers}
        ref={containerRef}
        className={cn(
          "relative h-[420px] md:h-[540px] lg:h-[660px] xl:h-[700px] w-full flex items-center justify-center",
          "cursor-grab active:cursor-grabbing select-none",
          "transition-transform duration-200 ease-out",
          isTransitioning && "pointer-events-none",
        )}
        role="region"
        aria-label="Carousel de produits"
        aria-live="polite"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full max-w-[320px] md:max-w-[380px] lg:max-w-[520px] xl:max-w-[600px] h-[400px] md:h-[520px] lg:h-[640px] xl:h-[680px]">
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isActive = index === activeIndex;
            const isVisible = Math.abs(offset) <= 2;

            return (
              <motion.div
                key={index}
                className="absolute top-0 left-0 w-full h-full"
                initial={false}
                animate={{
                  x: `${offset * 100}%`,
                  scale: isActive ? 1 : 0.88,
                  opacity: !isVisible ? 0 : 1 - Math.abs(offset) * 0.15,
                  rotateY: offset * -6,
                  z: -Math.abs(offset) * 40,
                  filter: isActive
                    ? "blur(0px)"
                    : `blur(${Math.abs(offset) * 1}px)`,
                }}
                transition={{
                  type: "spring",
                  stiffness: swipeDirection ? 500 : 400,
                  damping: swipeDirection ? 40 : 35,
                  mass: 0.6,
                  duration: isTransitioning ? 0.5 : 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: items.length - Math.abs(offset),
                }}
                aria-hidden={!isActive}
              >
                {item}
              </motion.div>
            );
          })}
        </div>

        {/* Indicateurs de direction de swipe */}
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-50",
              "w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm",
              "flex items-center justify-center text-primary text-xl",
              swipeDirection === "left" ? "right-4" : "left-4",
            )}
          >
            {swipeDirection === "left" ? "→" : "←"}
          </motion.div>
        )}
      </div>

      {/* Indicateurs de pagination améliorés */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setActiveIndex(index)}
            disabled={isTransitioning}
            className={cn(
              "h-2 rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              index === activeIndex
                ? "w-8 bg-primary shadow-lg"
                : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-primary/50",
            )}
            aria-label={`Aller à la carte ${index + 1}`}
          />
        ))}
      </div>

      {/* Instructions de navigation */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        <p className="hidden md:block">
          Utilisez les flèches du clavier ou glissez pour naviguer
        </p>
        <p className="md:hidden">
          Glissez horizontalement ou verticalement pour naviguer
        </p>
      </div>
    </div>
  );
};

export const Card = ({
  card,
  index,
  layout = true,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardClick = (e: React.MouseEvent) => {
    // Vérifier si le clic provient d'un bouton ou d'un lien
    const target = e.target as HTMLElement;
    const isButton = target.closest("button") || target.closest("a");

    // Si ce n'est pas un bouton/lien, alors on peut retourner la carte
    if (!isButton) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      layoutId={layout ? `card-${index}` : undefined}
      className="relative w-full h-full cursor-pointer select-none"
      onClick={handleCardClick}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{
        duration: 0.6,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        rotateX: 5,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
      whileTap={{
        scale: 0.96,
        transition: { duration: 0.1 },
      }}
    >
      {/* Face avant */}
      <div
        className="absolute inset-0 w-full h-full rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl md:shadow-2xl"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-20" />

          {/* Image */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={card.src}
              alt={card.title}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isLoading ? "blur-lg scale-110" : "blur-0 scale-100",
              )}
              onLoad={() => setIsLoading(false)}
              priority={index === 0}
            />
          </div>

          {/* Contenu */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-30">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-white/80 text-xs md:text-sm font-medium mb-2 uppercase tracking-wider">
                {card.category}
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight">
                {card.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-white/90 text-xs md:text-sm">
                  Toucher pour plus de détails
                </span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-white/60 text-sm"
                >
                  →
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Face arrière */}
      <div
        className="absolute inset-0 w-full h-full rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl md:shadow-2xl bg-white dark:bg-neutral-900"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <div className="relative w-full h-full overflow-hidden">
          {/* Header avec image floue en arrière-plan */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src={card.src}
              alt={card.title}
              fill
              className="object-cover blur-3xl"
            />
          </div>

          {/* Contenu scrollable avec clipping approprié */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start p-6 md:p-8 pb-4 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="text-primary text-xs md:text-sm font-medium mb-2 uppercase tracking-wider">
                  {card.category}
                </p>
                <h3 className="text-xl md:text-2xl font-bold mb-2 pr-4 truncate text-gray-900 dark:text-white">
                  {card.title}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="p-2 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex-shrink-0 hover:scale-110 text-gray-600 dark:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Zone de contenu scrollable avec clipping strict */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div
                className="h-full overflow-y-auto overflow-x-hidden px-6 md:px-8 pb-6 md:pb-8 
                scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent
                hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
              >
                <div className="space-y-4 text-sm md:text-base">
                  {card.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const BlurImage = ({ src, className, alt, ...rest }: any) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-700",
        isLoading ? "blur-lg scale-110" : "blur-0 scale-100",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      alt={alt || "Image"}
      {...rest}
    />
  );
};
