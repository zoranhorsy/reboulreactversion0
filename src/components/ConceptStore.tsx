"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  IconShield,
  IconUsers,
  IconShoppingBag,
  IconTrendingUp,
  IconTruck,
  IconClock,
  IconDiamond,
  IconPalette,
  IconStars,
  IconCrown,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconPhone,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

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

const ADVANTAGES = [
  {
    title: "Authenticité garantie",
    description:
      "Tous nos produits sont authentiques et proviennent directement des marques",
    icon: <IconShield className="w-5 h-5" />,
  },
  {
    title: "Expertise",
    description:
      "Une équipe de passionnés à votre service pour vous conseiller",
    icon: <IconUsers className="w-5 h-5" />,
  },
  {
    title: "Sélection exclusive",
    description: "Les meilleures pièces des plus grandes marques",
    icon: <IconShoppingBag className="w-5 h-5" />,
  },
  {
    title: "Dernières tendances",
    description: "Une sélection constamment mise à jour selon les tendances",
    icon: <IconTrendingUp className="w-5 h-5" />,
  },
  {
    title: "Livraison rapide",
    description: "Livraison express disponible sur toute la France",
    icon: <IconTruck className="w-5 h-5" />,
  },
  {
    title: "Service client",
    description: "Une équipe disponible pour répondre à vos questions",
    icon: <IconClock className="w-5 h-5" />,
  },
];

const PREMIUM_SERVICES = [
  {
    title: "Personal Shopping",
    description: "Service de shopping personnalisé avec nos experts mode",
    icon: <IconDiamond className="w-5 h-5" />,
    price: "Sur mesure",
  },
  {
    title: "Styling Privé",
    description: "Séance de styling individuelle dans notre showroom",
    icon: <IconPalette className="w-5 h-5" />,
    price: "À partir de 150€",
  },
  {
    title: "VIP Experience",
    description: "Accès privilégié aux nouvelles collections et événements",
    icon: <IconStars className="w-5 h-5" />,
    price: "Membership",
  },
  {
    title: "Retouches Premium",
    description: "Service de retouches haute couture par nos artisans",
    icon: <IconCrown className="w-5 h-5" />,
    price: "Variable",
  },
];

const BRANDS_FEATURED = [
  { name: "Balenciaga", category: "Luxury" },
  { name: "Saint Laurent", category: "Luxury" },
  { name: "Bottega Veneta", category: "Luxury" },
  { name: "Jacquemus", category: "Contemporary" },
  { name: "Ganni", category: "Contemporary" },
  { name: "Staud", category: "Contemporary" },
];

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    text: "Une expérience shopping exceptionnelle ! L'équipe REBOUL a su me conseiller parfaitement.",
    rating: 5,
    location: "Paris",
  },
  {
    name: "Marie L.",
    text: "La sélection est incroyable, je trouve toujours des pièces uniques chez REBOUL.",
    rating: 5,
    location: "Lyon",
  },
  {
    name: "Camille D.",
    text: "Le service client est irréprochable, livraison ultra rapide et emballage soigné.",
    rating: 5,
    location: "Marseille",
  },
];

const STORE_STATS = [
  { number: "30+", label: "Marques partenaires" },
  { number: "10K+", label: "Clients satisfaits" },
  { number: "50+", label: "Nouvelles pièces/semaine" },
  { number: "24h+", label: "Livraison express" },
];

const getImageUrl = (path: string): string => {
  if (!path) return "/placeholder.png";

  if (path.includes("cloudinary.com")) {
    return path;
  }

  const RAILWAY_BASE_URL = "https://reboul-store-api-production.up.railway.app";

      if (path.includes("localhost:5001") || path.includes("reboul-store-api-production.up.railway.app")) {
      const parts = path.includes("localhost:5001") 
        ? path.split("localhost:5001")
        : path.split("reboul-store-api-production.up.railway.app");
    return `${RAILWAY_BASE_URL}${parts[1]}`;
  }

  if (path.startsWith("http")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${RAILWAY_BASE_URL}${cleanPath}`;
};

export function ConceptStore() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Archive | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Charger les archives au montage du composant
  useEffect(() => {
    const loadArchives = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchArchives();
        setArchives(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Erreur lors du chargement des archives:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadArchives();
  }, []);

  const features = [
    {
      title: "Nos Services Premium",
      description: "L'excellence REBOUL à travers nos services dédiés",
      skeleton: <ServicesGrid />,
      className:
        "col-span-1 lg:col-span-6 border-b dark:border-neutral-800 flex flex-col",
    },
    {
      title: "Galerie Boutique",
      description: "L'univers REBOUL en images - Découvrez notre concept store",
      skeleton: (
        <GalleryPreview
          archives={archives.filter((a) => a.category === "store").slice(0, 6)}
          onImageClick={setSelectedImage}
        />
      ),
      className: "border-b col-span-1 lg:col-span-6 dark:border-neutral-800",
    },
    {
      title: "Nos Shootings",
      description: "Les coulisses de nos collections",
      skeleton: (
        <ShootingGallery
          archives={archives
            .filter((a) => a.category === "shooting")
            .slice(0, 3)}
        />
      ),
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Événements REBOUL",
      description: "Revivez nos moments forts",
      skeleton: (
        <EventsGallery
          archives={archives.filter((a) => a.category === "event").slice(0, 3)}
        />
      ),
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Témoignages Clients",
      description: "Ce que disent nos clients",
      skeleton: <TestimonialsSection />,
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Statistiques",
      description: "REBOUL en chiffres",
      skeleton: <StatsSection />,
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Nous Contacter",
      description: "Restez connectés avec REBOUL",
      skeleton: <ContactSection />,
      className:
        "col-span-1 lg:col-span-2 border-b lg:border-none dark:border-neutral-800",
    },
  ];

  useEffect(() => {
    if (selectedImage) {
      setSelectedImageIndex(0);
    }
  }, [selectedImage]);

  return (
    <div className="w-full">
      <div className="relative z-20 py-10 lg:py-20 max-w-7xl mx-auto">
        <div className="px-4 sm:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white"
          >
            L&apos;Univers REBOUL
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300"
          >
            Découvrez notre concept store révolutionnaire. Une expérience
            shopping redéfinie, alliant excellence, innovation et passion pour
            la mode contemporaine.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800 min-h-[600px]">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={cn(
                  "p-4 sm:p-6 relative overflow-hidden",
                  feature.className,
                )}
              >
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg md:text-xl font-medium text-black dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-300">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex-1">{feature.skeleton}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal de visualisation */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl w-full p-0 border-0 bg-transparent">
          {selectedImage && (
            <div className="relative aspect-square sm:aspect-[3/2] rounded-2xl overflow-hidden bg-black">
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

              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-5 right-5 z-50 p-3 rounded-full 
                                    bg-black text-white hover:bg-zinc-900
                                    transition-colors duration-200"
                aria-label="Fermer"
              >
                <span>×</span>
              </button>

              <Image
                src={getImageUrl(selectedImage.image_paths[selectedImageIndex])}
                alt={selectedImage.title}
                fill
                className="object-cover"
                sizes="100vw"
                quality={95}
              />

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

const ServicesGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 h-full">
      {ADVANTAGES.map((advantage, index) => (
        <motion.div
          key={advantage.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center justify-center text-center p-3 rounded-lg bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-300 h-full"
        >
          <div className="mb-2 text-neutral-600 dark:text-neutral-400">
            {advantage.icon}
          </div>
          <h4 className="text-xs font-medium text-neutral-800 dark:text-neutral-100 mb-1">
            {advantage.title}
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {advantage.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const PremiumServices = () => {
  return (
    <div className="space-y-3 h-full">
      {PREMIUM_SERVICES.map((service, index) => (
        <motion.div
          key={service.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 hover:shadow-sm transition-all duration-300"
        >
          <div className="text-amber-600 dark:text-amber-400 mt-1">
            {service.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {service.title}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
              {service.description}
            </p>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {service.price}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const BrandsShowcase = () => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {BRANDS_FEATURED.map((brand, index) => (
        <motion.div
          key={brand.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center hover:shadow-md transition-all duration-300"
        >
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-1">
            {brand.name}
          </h4>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {brand.category}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <div className="space-y-3 h-full">
      {TESTIMONIALS.map((testimonial, index) => (
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-sm transition-all duration-300"
        >
          <div className="flex items-center gap-1 mb-2">
            {[...Array(testimonial.rating)].map((_, i) => (
              <span key={i}>⭐</span>
            ))}
          </div>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-2 italic">
            &quot;{testimonial.text}&quot;
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-100">
              {testimonial.name}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {testimonial.location}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const StatsSection = () => {
  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {STORE_STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
        >
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {stat.number}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ContactSection = () => {
  return (
    <div className="space-y-4 h-full">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <IconMapPin className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <div>
            <p className="text-sm text-neutral-800 dark:text-neutral-100">
              523 Bis Rue Paradis
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              13006 Marseille, France
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <IconPhone className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <p className="text-sm text-neutral-800 dark:text-neutral-100">
            +33 1 23 45 67 89
          </p>
        </div>
        <div className="flex items-center gap-3">
          <IconMail className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <p className="text-sm text-neutral-800 dark:text-neutral-100">
            contact@reboul.fr
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all duration-300"
        >
          <IconBrandInstagram className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-blue-600 text-white hover:shadow-lg transition-all duration-300"
        >
          <IconBrandFacebook className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-sky-500 text-white hover:shadow-lg transition-all duration-300"
        >
          <IconBrandTwitter className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

const GalleryPreview = ({ 
  archives, 
  onImageClick 
}: { 
  archives: Archive[]; 
  onImageClick?: (archive: Archive) => void;
}) => {
  return (
    <div className="h-full">
      {archives.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
          {archives.map((archive, idx) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onImageClick?.(archive)}
              className="rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square relative">
                <Image
                  src={getImageUrl(archive.image_paths[0])}
                  alt={archive.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-white text-xs font-medium line-clamp-1">
                    {archive.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span>🏪</span>
            <p className="text-sm text-neutral-500">
              Galerie boutique bientôt disponible
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ShootingGallery = ({ archives }: { archives: Archive[] }) => {
  return (
    <div className="h-full">
      {archives.length > 0 ? (
        <div className="flex gap-2 h-full">
          {archives.slice(0, 3).map((archive, idx) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, rotate: Math.random() * 20 - 10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 cursor-pointer flex-1"
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src={getImageUrl(archive.image_paths[0])}
                  alt={archive.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span>📷</span>
            <p className="text-sm text-neutral-500">
              Shootings bientôt disponibles
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const EventsGallery = ({ archives }: { archives: Archive[] }) => {
  return (
    <div className="h-full">
      {archives.length > 0 ? (
        <div className="space-y-2 h-full">
          {archives.slice(0, 2).map((archive, idx) => (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-[16/9] relative">
                <Image
                  src={getImageUrl(archive.image_paths[0])}
                  alt={archive.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="text-white text-sm font-medium line-clamp-1">
                    {archive.title}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <span className="text-2xl mb-2 block">🎉</span>
            <p className="text-sm text-neutral-500">
              Événements bientôt disponibles
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
