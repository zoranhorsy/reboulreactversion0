"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { CartSheet } from "@/components/cart/CartSheet";
import { Menu, MenuContent, MenuTrigger, MenuItem } from "@/components/ui/menu";
import { Logo } from "@/components/Logo";

export function ReboulNavbarOriginal() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const catalogueItems = [
    { href: "/catalogue", label: "Tous les produits" },
    { href: "/catalogue/adulte", label: "Adulte" },
    { href: "/catalogue/enfant", label: "Enfant" },
    { href: "/catalogue/sneakers", label: "Sneakers" },
    { href: "/the-corner", label: "The Corner" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/10 dark:border-zinc-200/10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="w-32 h-12" />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              }`}
            >
              Accueil
            </Link>

            {/* Mega Menu Catalogue */}
            <Menu>
              <MenuTrigger>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith("/catalogue")
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Catalogue
                </button>
              </MenuTrigger>
              <MenuContent className="w-48 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg">
                {catalogueItems.map((item) => (
                  <MenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className="block w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-black hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-900 rounded-md transition-colors"
                    >
                      {item.label}
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </Menu>

            <Link
              href="/the-corner"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith("/the-corner")
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              }`}
            >
              The Corner
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              }`}
            >
              À propos
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {/* Cart */}
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen}>
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden md:flex px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
              >
                Panier
              </button>
            </CartSheet>

            <Link
              href="/connexion"
              className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Connexion
            </Link>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Menu
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/catalogue"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalogue
              </Link>
              <Link
                href="/the-corner"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                The Corner
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2">
                <Link
                  href="/cart"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors rounded-lg block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Panier
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
