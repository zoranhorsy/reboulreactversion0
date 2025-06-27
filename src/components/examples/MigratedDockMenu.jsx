"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/AuthContext";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/menu";
import {
  Home,
  ShoppingBag,
  Info,
  UserCircle2,
  LogOut,
  LogIn,
  Settings2,
  Sun,
  Moon,
} from "lucide-react";

/**
 * Exemple de migration du menu Dock avec Radix UI et Tailwind
 * Version migrée du composant basé sur l'ancien Dock.tsx
 */
export default function MigratedDockMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Assurer que le rendu côté serveur et client correspondent
  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    theme === "dark" ? "/images/logo_light.png" : "/images/logo_dark.png";

  // Styles du menu avec Tailwind
  const dockStyles = {
    base: cn(
      "fixed bottom-0 left-0 right-0",
      "mb-2 sm:mb-4",
      "flex items-center justify-center",
      "mx-auto",
      "w-fit",
      "h-[45px] sm:h-[50px]",
      "px-1 sm:px-2",
      "bg-zinc-950/90 dark:bg-zinc-50/90 backdrop-blur-md rounded-full",
      "border border-zinc-900/50 dark:border-zinc-200/50",
      "shadow-lg shadow-zinc-900/20 dark:shadow-zinc-300/20",
      "z-[100]",
      "transition-all duration-300 ease-in-out",
    ),
    item: cn("relative", "px-[1px] sm:px-1"),
    icon: cn(
      "w-4 h-4 sm:w-5 sm:h-5",
      "text-zinc-400 dark:text-zinc-600",
      "hover:text-zinc-50 dark:hover:text-zinc-950",
      "opacity-80 hover:opacity-100",
      "transition-all duration-200",
    ),
    button: cn(
      "w-8 h-8 sm:w-10 sm:h-10",
      "flex items-center justify-center relative",
      "hover:bg-zinc-900/50 dark:hover:bg-zinc-200/50",
      "rounded-full",
      "transition-all duration-200",
    ),
    logo: cn(
      "w-4 h-4 sm:w-5 sm:h-5",
      "object-contain",
      "opacity-80 hover:opacity-100",
      "transition-all duration-300 ease-in-out",
    ),
    menuContainer: cn(
      "hidden opacity-0",
      "items-center gap-1",
      "ml-1",
      "transition-all duration-300 ease-in-out",
    ),
    menuVisible: "!flex !opacity-100",
    submenuItem: cn(
      "block w-full px-3 py-2 text-sm",
      "text-zinc-300 dark:text-zinc-700",
      "hover:bg-zinc-800/60 dark:hover:bg-zinc-300/60",
      "rounded",
      "transition-colors duration-150 ease-in-out",
    ),
  };

  const menuItems = [
    { id: "home", href: "/", icon: Home, label: "Accueil" },
    {
      id: "catalogue",
      href: "/catalogue",
      icon: ShoppingBag,
      label: "Catalogue",
    },
    { id: "about", href: "/about", icon: Info, label: "À propos" },
    ...(user
      ? [
          {
            id: "profile",
            href: "/profil",
            icon: UserCircle2,
            label: "Profil",
          },
          {
            id: "logout",
            href: "#",
            icon: LogOut,
            label: "Déconnexion",
            onClick: logout,
          },
        ]
      : [{ id: "login", href: "/connexion", icon: LogIn, label: "Connexion" }]),
    ...(user?.isAdmin
      ? [
          {
            id: "admin",
            href: "/admin",
            icon: Settings2,
            label: "Administration",
          },
        ]
      : []),
    {
      id: "theme",
      href: "#",
      icon: theme === "dark" ? Sun : Moon,
      label: "Thème",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];

  const catalogueSubitems = [
    { href: "/catalogue", label: "Tous les produits" },
    { href: "/catalogue/adulte", label: "Adulte" },
    { href: "/catalogue/enfant", label: "Enfant" },
    { href: "/catalogue/sneakers", label: "Sneakers" },
    { href: "/the-corner", label: "The Corner" },
  ];

  return (
    <motion.div
      className={dockStyles.base}
      layout
      transition={{
        layout: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
    >
      {/* Logo */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={dockStyles.button}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        animate={
          isOpen
            ? {
                scale: 1.1,
              }
            : {
                scale: 1,
              }
        }
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
      >
        {mounted && (
          <Image
            src={logoSrc}
            alt="Reboul Logo"
            width={20}
            height={20}
            className={dockStyles.logo}
            priority
          />
        )}
      </motion.button>

      {/* Menu Items - Utilise Framer Motion pour les animations */}
      <div
        className={cn(
          dockStyles.menuContainer,
          isOpen && dockStyles.menuVisible,
        )}
      >
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                className={dockStyles.item}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  duration: 0.2,
                  delay: 0.1 + index * 0.02,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {item.id === "catalogue" ? (
                  // Sous-menu catalogue avec Radix UI Menu
                  <Menu>
                    <MenuTrigger>
                      <motion.button
                        className={dockStyles.button}
                        aria-label={item.label}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <item.icon className={dockStyles.icon} />
                      </motion.button>
                    </MenuTrigger>
                    <MenuContent>
                      {catalogueSubitems.map((subItem) => (
                        <MenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-zinc-300 dark:text-zinc-700 outline-none hover:bg-zinc-800/60 dark:hover:bg-zinc-300/60 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        </MenuItem>
                      ))}
                    </MenuContent>
                  </Menu>
                ) : (
                  // Autres menus avec lien simple
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                      setIsOpen(false);
                    }}
                  >
                    <motion.button
                      className={dockStyles.button}
                      aria-label={item.label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className={dockStyles.icon} />
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Avant la migration:
 *
 * Le menu original utilise un système personnalisé pour afficher les sous-menus
 * avec des animations Framer Motion et une gestion manuelle de l'état.
 *
 * Pour le sous-menu catalogue, nous avons:
 *
 * <motion.div className="relative">
 *   <motion.button onClick={() => setShowSubmenu(!showSubmenu)}>
 *     <item.icon />
 *   </motion.button>
 *   <AnimatePresence>
 *     {showSubmenu && (
 *       <motion.div className="submenu">
 *         {submenuItems.map((subItem) => (
 *           <motion.div key={subItem.href}>
 *             <Link href={subItem.href}>{subItem.label}</Link>
 *           </motion.div>
 *         ))}
 *       </motion.div>
 *     )}
 *   </AnimatePresence>
 * </motion.div>
 *
 * Après la migration:
 *
 * Nous utilisons le composant Menu de Radix UI qui gère automatiquement
 * l'état ouvert/fermé et l'accessibilité, tout en conservant les animations
 * Framer Motion pour les éléments du menu principal.
 */
