"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Composants d'icônes simples avec emojis
const Home = ({ className }: { className?: string }) => (
  <span className={className}>🏠</span>
);

const ShoppingBag = ({ className }: { className?: string }) => (
  <span className={className}>🛍️</span>
);

const Heart = ({ className }: { className?: string }) => (
  <span className={className}>❤️</span>
);

const User = ({ className }: { className?: string }) => (
  <span className={className}>👤</span>
);

const dockItems: DockItem[] = [
  {
    id: "home",
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    id: "catalogue",
    label: "Catalogue",
    href: "/catalogue",
    icon: ShoppingBag,
  },
  {
    id: "favorites",
    label: "Favoris",
    href: "/favorites",
    icon: Heart,
  },
  {
    id: "profile",
    label: "Profil",
    href: "/profil",
    icon: User,
  },
];

export function Dock() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const dockStyles = {
    base: cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
      "bg-background/80 backdrop-blur-md border border-border/50",
      "rounded-2xl shadow-lg px-4 py-2",
      "flex items-center gap-2",
      "transition-all duration-300 ease-in-out",
    ),
    button: cn(
      "relative flex items-center justify-center",
      "w-12 h-12 rounded-xl",
      "transition-all duration-200 ease-in-out",
      "hover:bg-accent/50 hover:scale-110",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    ),
    icon: "w-5 h-5",
    label: cn(
      "absolute -top-8 left-1/2 transform -translate-x-1/2",
      "bg-foreground text-background text-xs px-2 py-1 rounded",
      "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      "pointer-events-none whitespace-nowrap",
    ),
    menuContainer: cn(
      "absolute bottom-full left-0 right-0 mb-2",
      "bg-background/90 backdrop-blur-md border border-border/50",
      "rounded-xl shadow-lg p-2",
      "opacity-0 scale-95 pointer-events-none",
      "transition-all duration-200 ease-in-out",
    ),
    menuVisible: "opacity-100 scale-100 pointer-events-auto",
    item: cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg",
      "text-sm font-medium transition-colors duration-200",
      "hover:bg-accent/50",
    ),
  };

  return (
    <div className={dockStyles.base}>
      {dockItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              dockStyles.button,
              "group",
              isActive && "bg-primary text-primary-foreground",
            )}
          >
            <Icon className={dockStyles.icon} />
            <span className={dockStyles.label}>{item.label}</span>
          </Link>
        );
      })}

      {/* Menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          dockStyles.button,
          "group ml-2 border-l border-border/30 pl-4",
        )}
      >
        {isOpen ? <span>×</span> : <span>☰</span>}
        <span className={dockStyles.label}>Menu</span>
      </button>

      {/* Extended menu */}
      <div
        className={cn(
          dockStyles.menuContainer,
          isOpen && dockStyles.menuVisible,
        )}
      >
        <Link href="/about" className={dockStyles.item}>
          À propos
        </Link>
        <Link href="/contact" className={dockStyles.item}>
          Contact
        </Link>
        <Link href="/the-corner" className={dockStyles.item}>
          The Corner
        </Link>
      </div>
    </div>
  );
}
