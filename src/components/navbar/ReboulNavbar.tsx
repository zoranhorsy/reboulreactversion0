"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

export function ReboulNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
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
                pathname === "/" ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/catalogue"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith("/catalogue")
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Catalogue
            </Link>
            <Link
              href="/the-corner"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname?.startsWith("/the-corner")
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              The Corner
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/about"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/contact"
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <Link
              href="/favorites"
              className="hidden md:flex px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
            >
              ❤ Favoris
            </Link>
            <Link
              href="/cart"
              className="hidden md:flex px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
            >
              🛒 Panier
            </Link>
            <Link
              href="/connexion"
              className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Connexion
            </Link>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/catalogue"
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalogue
              </Link>
              <Link
                href="/the-corner"
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                The Corner
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  href="/favorites"
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ❤ Favoris
                </Link>
                <Link
                  href="/cart"
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🛒 Panier
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
