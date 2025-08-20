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

  // Charger les collections depuis l'API
  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCollections();
        
        if (data && data.length > 0) {
          setCollections(data);
          console.log("Collections chargées depuis l'API:", data);
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
      <div className="relative min-h-[400px] pt-0 pb-24 w-full bg-white dark:bg-black overflow-hidden md:rounded-2xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <p className={`text-sm ${resolvedTheme === "dark" ? "text-white/60" : "text-black/60"}`}>
              Chargement des collections...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px] pt-0 pb-24 w-full bg-white dark:bg-black overflow-hidden md:rounded-2xl">
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
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Contenu centré avec animations */}
        <div className="relative z-10 flex flex-col items-center justify-end w-full h-full max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          {/* Bouton */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button
              asChild
              className="bg-white hover:bg-white/90 text-black hover:text-black h-12 px-8 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <Link href={collections[currentIndex].link_url}>
                Découvrir la collection
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
