"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/lib/api";
import { LayoutGrid } from "@/components/ui/layout-grid";
// import { Camera, Store, Calendar } from "lucide-react"; // Supprimé temporairement

interface Archive {
  id: number;
  title: string;
  description: string;
  category: "store" | "shooting" | "event";
  image_paths: string[];
  date: string;
  active: boolean;
  display_order: number;
}

const CATEGORIES = [
  { id: "all", label: "Tout", icon: () => <span>📷</span> },
  { id: "store", label: "Boutique", icon: () => <span>🏪</span> },
  { id: "shooting", label: "Shootings", icon: () => <span>📸</span> },
  { id: "event", label: "Événements", icon: () => <span>📅</span> },
] as const;

const getImageUrl = (path: string): string => {
  if (!path) return "/placeholder.png";

  // Si c'est déjà une URL Cloudinary, la retourner telle quelle
  if (path.includes("cloudinary.com")) {
    return path;
  }

  const RAILWAY_BASE_URL = "https://reboul-store-api-production.up.railway.app";

  // Si c'est une URL localhost, la convertir en URL Railway
  if (path.includes("localhost:5001")) {
    const parts = path.split("localhost:5001");
    return `${RAILWAY_BASE_URL}${parts[1]}`;
  }

  // Si c'est déjà une URL complète (non-localhost)
  if (path.startsWith("http")) {
    return path;
  }

  // Pour les chemins relatifs
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${RAILWAY_BASE_URL}${cleanPath}`;
};

export function Archives() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<Archive | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Charger les archives depuis l'API
  useEffect(() => {
    const loadArchives = async () => {
      try {
        setIsLoading(true);
        console.log("Chargement des archives...");
        const response = await api.fetchArchives();
        console.log("Réponse des archives:", response);
        setArchives(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erreur lors du chargement des archives:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArchives();
  }, []);

  const filteredItems = archives
    .filter(
      (item) =>
        selectedCategory === "all" || item.category === selectedCategory,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Convertir les archives en format Card pour LayoutGrid
  const cards = filteredItems.map((archive, index) => ({
    id: archive.id,
    content: (
      <div className="text-white p-3 sm:p-4 lg:p-6">
        <h3 className="text-base sm:text-lg lg:text-xl font-medium mb-2 sm:mb-3 line-clamp-2">
          {archive.title}
        </h3>
        <p className="text-xs sm:text-sm lg:text-base opacity-90 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">
          {archive.description}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm opacity-75">
          <span>📅</span>
          <span className="truncate">
            {format(new Date(archive.date), "d MMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>
    ),
    className:
      index === 0
        ? "sm:col-span-2 lg:col-span-2 sm:row-span-2"
        : index === 1
          ? "col-span-1 row-span-1"
          : index === 2
            ? "col-span-1 row-span-1"
            : index === 3
              ? "col-span-1 lg:row-span-2"
              : index === 4
                ? "col-span-1 row-span-1"
                : "col-span-1 row-span-1",
    thumbnail: getImageUrl(archive.image_paths[0]),
    archive: archive,
  }));

  // Fonction pour gérer le clic sur une carte
  const handleCardClick = (card: any) => {
    setSelectedImage(card.archive);
  };

  // Debug logs
  console.log("Filtered items:", filteredItems.length);
  console.log("Cards:", cards.length);
  console.log("Cards data:", cards);

  // Réinitialiser l'index quand on ouvre le modal
  useEffect(() => {
    if (selectedImage) {
      setSelectedImageIndex(0);
    }
  }, [selectedImage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span>⏳</span>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-8 text-center px-4">
        <span>📷</span>
        <h3 className="text-base font-medium sm:text-lg">
          Aucune archive disponible
        </h3>
        <p className="text-sm text-muted-foreground sm:text-base">
          Les archives seront bientôt disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Titre et description */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          Nos Magasins
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Découvrez l&apos;univers REBOUL à travers notre galerie de photos
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-wrap gap-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:justify-center sm:gap-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm whitespace-nowrap",
                  "flex items-center justify-center gap-2",
                  "w-[calc(50%-4px)] sm:w-auto",
                  "sm:px-5 sm:py-2.5 sm:rounded-full",
                  "transition-all duration-300",
                  selectedCategory === category.id
                    ? "bg-white text-zinc-900 font-medium shadow-lg"
                    : "bg-zinc-900/90 text-white border border-white/20 hover:bg-zinc-800 hover:border-white/40",
                )}
              >
                <Icon />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Grid */}
      <div className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] w-full">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <span>⏳</span>
          </div>
        ) : cards.length > 0 ? (
          <LayoutGrid cards={cards} onCardClick={handleCardClick} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px] text-center">
            <div>
              <p className="text-lg text-muted-foreground mb-2">
                Aucune archive dans cette catégorie
              </p>
              <p className="text-sm text-muted-foreground">
                Essayez de sélectionner une autre catégorie
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de visualisation - adapté pour mobile */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <div className="relative aspect-square sm:aspect-[3/2] rounded-2xl overflow-hidden bg-black">
              {/* Navigation buttons in modal */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : selectedImage.image_paths.length - 1,
                  );
                }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full 
                                    bg-black text-white hover:bg-zinc-900
                                    transition-colors duration-200"
                aria-label="Image précédente"
              >
                <span>←</span>
              </button>

              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-5 right-5 z-50 p-3 rounded-full 
                                    bg-black text-white hover:bg-zinc-900
                                    transition-colors duration-200"
                aria-label="Fermer"
              >
                <span>×</span>
              </button>

              {/* Image */}
              <Image
                src={getImageUrl(selectedImage.image_paths[selectedImageIndex])}
                alt={selectedImage.title}
                fill
                className="object-cover"
                sizes="100vw"
                quality={95}
              />

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black to-transparent">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white">
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-white/90 bg-black/50 px-3 py-1.5 rounded-full self-start">
                      <span>📅</span>
                      <span className="text-xs sm:text-sm">
                        {format(new Date(selectedImage.date), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm sm:text-base max-w-3xl">
                    {selectedImage.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
