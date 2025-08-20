"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCollections, CollectionCarousel } from "@/lib/collectionsCarouselApi";

// Données de fallback en cas d'erreur API
const fallbackCollections: CollectionCarousel[] = [
  {
    id: 1,
    name: "Collection CP Company",
    description: "Design italien - Les essentiels CP Company",
    image_url: "/images/collections/cp-company.jpg",
    link_url: "/catalogue?brand=cp-company",
    badge: "Tendance",
    sort_order: 1,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: 2,
    name: "Collection Sneakers",
    description: "Les dernières nouveautés en sneakers",
    image_url: "/images/collections/sneakers-collection.jpg",
    link_url: "/catalogue?category=sneakers",
    badge: "Nouveau",
    sort_order: 2,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: 3,
    name: "Collection Adultes",
    description: "Élégance contemporaine pour adultes",
    image_url: "/images/collections/adult-collection.jpg",
    link_url: "/catalogue?category=adult",
    badge: "Populaire",
    sort_order: 3,
    is_active: true,
    created_at: "",
    updated_at: ""
  },
  {
    id: 4,
    name: "Collection Kids",
    description: "Style et confort pour les plus jeunes",
    image_url: "/images/collections/kids-collection.jpg",
    link_url: "/catalogue?category=kids",
    badge: "Exclusif",
    sort_order: 4,
    is_active: true,
    created_at: "",
    updated_at: ""
  }
];

export function CollectionsCarousel() {
  const { resolvedTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [collections, setCollections] = useState<CollectionCarousel[]>(fallbackCollections);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour corriger les URLs d'images
  const fixImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return "/placeholder.png";
    
    // Si c'est déjà une URL complète, la retourner
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si c'est un chemin relatif, le convertir en URL complète de Railway
    if (imageUrl.startsWith('/')) {
      const railwayBaseUrl = "https://reboul-store-api-production.up.railway.app";
      return `${railwayBaseUrl}${imageUrl}`;
    }
    
    return imageUrl;
  };

  // Charger les collections depuis l'API
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCollections();
        
        // Gérer le format de réponse {status: 'success', data: [...]}
        console.log("🔍 DEBUG - Données reçues de l'API:", data);
        console.log("🔍 DEBUG - Type de data:", typeof data);
        console.log("🔍 DEBUG - data est null/undefined:", data === null || data === undefined);
        
        let collectionsData = data;
        
        if (data && typeof data === 'object') {
          console.log("🔍 DEBUG - data est un objet");
          console.log("🔍 DEBUG - Clés de data:", Object.keys(data));
          
          if ('data' in data) {
            console.log("🔍 DEBUG - data.data existe:", data.data);
            console.log("🔍 DEBUG - Type de data.data:", typeof data.data);
            console.log("🔍 DEBUG - data.data est un array:", Array.isArray(data.data));
            
            if (Array.isArray(data.data)) {
              collectionsData = data.data;
              console.log("🔍 DEBUG - Extraction de data.data:", collectionsData);
            }
          }
        } else if (Array.isArray(data)) {
          console.log("🔍 DEBUG - data est directement un array");
          collectionsData = data;
        }

        console.log("🔍 DEBUG - collectionsData final:", collectionsData);
        console.log("🔍 DEBUG - collectionsData.length:", collectionsData ? collectionsData.length : 'undefined');
        console.log("🔍 DEBUG - collectionsData est truthy:", !!collectionsData);

        if (collectionsData && collectionsData.length > 0) {
          // Corriger les URLs d'images pour chaque collection
          const collectionsWithFixedUrls = collectionsData.map(collection => ({
            ...collection,
            image_url: fixImageUrl(collection.image_url)
          }));
          
          setCollections(collectionsWithFixedUrls);
          console.log("Collections chargées depuis l'API:", collectionsWithFixedUrls);
        } else {
          console.log("Aucune collection trouvée, utilisation du fallback");
          setCollections(fallbackCollections);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des collections:", err);
        setError("Erreur lors du chargement des collections");
        setCollections(fallbackCollections);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  // Auto-play
  useEffect(() => {
    if (collections.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % collections.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [collections.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + collections.length) % collections.length);
  };

    // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] pt-0 pb-16 sm:pb-20 lg:pb-24 w-full bg-white dark:bg-black overflow-hidden sm:rounded-xl lg:rounded-2xl -mt-14 sm:mt-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <p className={`text-xs sm:text-sm ${resolvedTheme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Chargement des collections...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] pt-0 pb-16 sm:pb-20 lg:pb-24 w-full bg-white dark:bg-black overflow-hidden sm:rounded-xl lg:rounded-2xl -mt-16 sm:mt-0">
      {/* Titre discret */}
      <div className="absolute top-4 left-4 z-30">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className={`text-sm font-medium ${resolvedTheme === "dark" ? "text-white/80" : "text-black/80"}`}
        >
        </motion.h2>
      </div>
      
      {/* Carousel avec animations */}
      <motion.div 
        className="absolute inset-0"
        key={currentIndex}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) * velocity.x;
          if (swipe > 50000) {
            setCurrentIndex((prev) => (prev + 1) % collections.length);
          } else if (swipe < -50000) {
            setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length);
          }
        }}
      >
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src={collections[currentIndex].image_url}
            alt={collections[currentIndex].name}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient plus léger */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>

        {/* Contenu avec bouton et informations */}
        <div className="relative z-10 flex flex-col justify-end w-full h-full p-4 sm:p-6 lg:p-8 pb-2 sm:pb-4">
          {/* Informations de la collection (tous écrans) */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="!text-white"
            >
              <h3 className="!text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-1">{collections[currentIndex].name}</h3>
              <p className="!text-white text-sm sm:text-base opacity-90 mb-1">{collections[currentIndex].description}</p>
              <div className="flex items-center gap-3 mt-2">
                {collections[currentIndex].badge && (
                  <span className="inline-block px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full text-white">
                    {collections[currentIndex].badge}
                  </span>
                )}
                {collections[currentIndex].product_count && (
                  <span className="!text-white text-xs sm:text-sm opacity-80">
                    {collections[currentIndex].product_count} articles
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bouton */}
          <div className="flex justify-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Button
                asChild
                className="bg-white/90 hover:bg-white text-black hover:text-black dark:text-black h-8 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                <Link href={collections[currentIndex].link_url}>
                  Découvrir la collection
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Indicateurs de navigation (mobile) */}
      {collections.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 sm:hidden">
          <div className="flex space-x-2">
            {collections.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Aller à la collection ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Boutons de navigation (desktop) */}
      {collections.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200"
            aria-label="Collection précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200"
            aria-label="Collection suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
