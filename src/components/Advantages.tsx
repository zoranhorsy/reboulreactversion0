"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  IconShield,
  IconUsers,
  IconShoppingBag,
  IconTrendingUp,
  IconTruck,
  IconClock,
} from "@tabler/icons-react";

const ADVANTAGES = [
  {
    title: "Authenticité garantie",
    description:
      "Tous nos produits sont authentiques et proviennent directement des marques",
    icon: <IconShield className="w-6 h-6" />,
  },
  {
    title: "Expertise",
    description:
      "Une équipe de passionnés à votre service pour vous conseiller",
    icon: <IconUsers className="w-6 h-6" />,
  },
  {
    title: "Sélection exclusive",
    description: "Les meilleures pièces des plus grandes marques",
    icon: <IconShoppingBag className="w-6 h-6" />,
  },
  {
    title: "Dernières tendances",
    description: "Une sélection constamment mise à jour selon les tendances",
    icon: <IconTrendingUp className="w-6 h-6" />,
  },
  {
    title: "Livraison rapide",
    description: "Livraison express disponible sur toute la France",
    icon: <IconTruck className="w-6 h-6" />,
  },
  {
    title: "Service client",
    description: "Une équipe disponible pour répondre à vos questions",
    icon: <IconClock className="w-6 h-6" />,
  },
];

export function Advantages() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          Nos Services
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          REBOUL redéfinit l&apos;expérience shopping en fusionnant
          l&apos;élégance traditionnelle avec les tendances contemporaines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto">
        {ADVANTAGES.map((advantage, index) => (
          <Feature key={advantage.title} {...advantage} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 3) && "lg:border-l dark:border-neutral-800",
        index < 3 && "lg:border-b dark:border-neutral-800",
      )}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
