"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/reboul-sidebar";
import {
  IconHome,
  IconShoppingBag,
  IconStar,
  IconInfoCircle,
  IconUser,
  IconHeart,
  IconShoppingCart,
  IconSettings,
  IconLogout,
  IconLogin,
  IconSun,
  IconMoon,
  IconMail,
  IconPackage,
  IconTruck,
  IconBell,
  IconSearch,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";

import { useCart } from "@/app/contexts/CartContext";
import { Tooltip } from "@/components/ui/tooltip-sidebar";
import Link from "next/link";

interface ReboulNavbarSidebarProps {
  children: ReactNode;
}

// Composant Logo Reboul réutilisable
function ReboulLogoImage({ 
  size = "md", 
  className = ""
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { theme } = useTheme();
  
  const dimensions = {
    sm: { width: 28, height: 28, className: "w-7 h-7" },
    md: { width: 40, height: 40, className: "w-10 h-10" },
    lg: { width: 56, height: 56, className: "w-14 h-14" }
  };
  
  const { width, height, className: sizeClass } = dimensions[size];
  
  // Utiliser logo_white (blanc) pour dark mode et logo_black (noir) pour light mode
  const logoSrc = theme === "dark" ? "/images/logo_white.png" : "/images/logo_black.png";
  
  return (
    <div className={cn(
      "relative shrink-0 flex items-center justify-center",
      sizeClass,
      className
    )}>
      <Image
        src={logoSrc}
        alt="Reboul Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}

// Composant mobile séparé - Simple Modal/Popover
function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  
  const cartItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const mainLinks = [
    { label: "Accueil", href: "/", icon: <IconHome className="h-5 w-5" /> },
    { label: "Catalogue", href: "/catalogue", icon: <IconShoppingBag className="h-5 w-5" /> },
    { label: "The Corner", href: "/the-corner", icon: <IconStar className="h-5 w-5" /> },
    { label: "À propos", href: "/about", icon: <IconInfoCircle className="h-5 w-5" /> },
    { label: "Contact", href: "/contact", icon: <IconMail className="h-5 w-5" /> },
  ];

  const userLinks = user ? [
    { label: "Mon Profil", href: "/profil", icon: <IconUser className="h-5 w-5" /> },
    { label: "Mes Favoris", href: "/favorites", icon: <IconHeart className="h-5 w-5" /> },
    { label: "Mes Commandes", href: "/suivi-commande", icon: <IconPackage className="h-5 w-5" /> },
    ...(user?.is_admin ? [{ label: "Administration", href: "/admin", icon: <IconSettings className="h-5 w-5" /> }] : []),
  ] : [
    { label: "Connexion", href: "/connexion", icon: <IconLogin className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Header mobile fixe */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 px-4 py-4 flex items-center justify-between bg-gradient-to-r from-background via-background/95 to-background/90 border-b border-border/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <ReboulLogoImage size="sm" />
            <span className="font-bold text-foreground text-lg">REBOUL STORE 2.0  </span>
          </Link>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-foreground hover:text-primary transition-colors p-2"
          aria-label="Ouvrir le menu"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
      </div>

      {/* Spacer pour compenser le header fixe */}
      <div className="md:hidden h-14" />

      {/* Modal/Popover mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu content */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 z-50 w-80 max-w-[85vw] h-full bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-md shadow-2xl border-r border-border/50 md:hidden"
            >
              {/* Header du menu */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-3 group">
                  <ReboulLogoImage size="md" />
                  <div>
                  <h2 className="text-lg font-bold text-foreground">REBOUL STORE 2.0</h2>
                  <p className="text-xs text-muted-foreground">Concept Store</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:text-primary transition-colors p-1"
                  aria-label="Fermer le menu"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              {/* Contenu du menu */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Navigation principale */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    {mainLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                          "text-foreground/80 hover:text-foreground hover:bg-accent/50",
                          "border border-transparent hover:border-border/30",
                          pathname === link.href && "bg-accent text-accent-foreground shadow-sm border-border/50"
                        )}
                      >
                        {link.icon}
                        <span className="font-medium text-sm">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Section utilisateur */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {user ? "Mon Compte" : "Connexion"}
                  </h3>
                  <div className="space-y-1">
                    {userLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                          "text-foreground/80 hover:text-foreground hover:bg-accent/50",
                          "border border-transparent hover:border-border/30",
                          pathname === link.href && "bg-accent text-accent-foreground shadow-sm border-border/50"
                        )}
                      >
                        {link.icon}
                        <span className="font-medium text-sm">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Actions
                  </h3>
                  <div className="space-y-1">
                    {/* Panier */}
                    <Link
                      href="/panier"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-accent/50 border border-transparent hover:border-border/30"
                    >
                      <div className="relative">
                        <IconShoppingCart className="h-5 w-5" />
                        {cartItemsCount > 0 && (
                          <div className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {cartItemsCount > 9 ? '9+' : cartItemsCount}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-sm">Mon Panier{cartItemsCount > 0 ? ` (${cartItemsCount})` : ''}</span>
                    </Link>
                    
                    {/* Mode sombre/clair */}
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-accent/50 border border-transparent hover:border-border/30"
                    >
                      {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
                      <span className="font-medium text-sm">{theme === "dark" ? "Mode Clair" : "Mode Sombre"}</span>
                    </button>

                    {/* Déconnexion */}
                    {user && (
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-accent/50 border border-transparent hover:border-border/30"
                      >
                        <IconLogout className="h-5 w-5" />
                        <span className="font-medium text-sm">Déconnexion</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Profil utilisateur */}
                {user && (
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg border border-border/50">
                      <div className="relative">
                        <img
                          src={user.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                          className="h-10 w-10 rounded-full border-2 border-border/50"
                          width={40}
                          height={40}
                          alt="Avatar"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">
                          {user.username || "Utilisateur"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>En ligne</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function ReboulNavbarSidebar({ children }: ReboulNavbarSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { items: cartItems } = useCart();
  const { user, logout } = useAuth();
  
  const cartItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  const mainLinks = [
    { label: "Accueil", href: "/", icon: <IconHome className="h-5 w-5 shrink-0" /> },
    { label: "Catalogue", href: "/catalogue", icon: <IconShoppingBag className="h-5 w-5 shrink-0" /> },
    { label: "The Corner", href: "/the-corner", icon: <IconStar className="h-5 w-5 shrink-0" /> },
    { label: "À propos", href: "/about", icon: <IconInfoCircle className="h-5 w-5 shrink-0" /> },
    { label: "Contact", href: "/contact", icon: <IconMail className="h-5 w-5 shrink-0" /> },
  ];

  const userLinks = user ? [
    { label: "Mon Profil", href: "/profil", icon: <IconUser className="h-5 w-5 shrink-0" /> },
    { label: "Mes Favoris", href: "/favorites", icon: <IconHeart className="h-5 w-5 shrink-0" /> },
    { label: "Mes Commandes", href: "/suivi-commande", icon: <IconPackage className="h-5 w-5 shrink-0" /> },
    ...(user?.is_admin ? [{ label: "Administration", href: "/admin", icon: <IconSettings className="h-5 w-5 shrink-0" /> }] : []),
  ] : [
    { label: "Connexion", href: "/connexion", icon: <IconLogin className="h-5 w-5 shrink-0" /> },
  ];

  const actionLinks = [
    {
      label: `Mon Panier${cartItemsCount > 0 ? ` (${cartItemsCount})` : ''}`,
      href: "/panier",
      icon: (
        <div className="relative">
          <IconShoppingCart className="h-5 w-5 shrink-0" />
          {cartItemsCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-4 w-4 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
            >
              {cartItemsCount > 9 ? '9+' : cartItemsCount}
            </motion.div>
          )}
        </div>
      ),
    },
    {
      label: theme === "dark" ? "Mode Clair" : "Mode Sombre",
      href: "#",
      icon: theme === "dark" ? <IconSun className="h-5 w-5 shrink-0" /> : <IconMoon className="h-5 w-5 shrink-0" />,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];

  if (user) {
    actionLinks.push({
      label: "Déconnexion",
      href: "#",
      icon: <IconLogout className="h-5 w-5 shrink-0" />,
      onClick: () => logout(),
    });
  }

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/catalogue?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* Menu mobile */}
      <MobileMenu />

      {/* Sidebar desktop */}
      <div className="hidden md:flex w-full min-h-screen">
        <Sidebar open={open} setOpen={setOpen} className="min-h-screen">
          <SidebarBody className="justify-between gap-6">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Logo */}
              <div className="mb-8">
                {open ? <ReboulLogo /> : <ReboulLogoIcon />}
              </div>

              {/* Barre de recherche rapide */}
              <div className="mb-6">
                {open ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Recherche rapide..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-accent/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div 
                    className="flex items-center justify-center p-3 hover:bg-accent/80 rounded-lg transition-colors cursor-pointer group"
                    onClick={() => setOpen(true)}
                    title="Rechercher"
                  >
                    <IconSearch className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                )}
              </div>
              
              {/* Navigation principale */}
              <div className="flex flex-col gap-1 mb-6">
                {open && (
                  <div className="mb-3">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3"
                    >
                      Navigation
                    </motion.p>
                  </div>
                )}
                {mainLinks.map((link, idx) => (
                  <div key={idx}>
                    {!open ? (
                      <Tooltip content={link.label}>
                        <SidebarLink 
                          link={link}
                          className={cn(
                            "transition-all duration-200",
                            pathname === link.href ? 
                              "bg-accent text-accent-foreground shadow-sm" : 
                              "hover:bg-accent/50"
                          )}
                        />
                      </Tooltip>
                    ) : (
                      <SidebarLink 
                        link={link}
                        className={cn(
                          "transition-all duration-200",
                          pathname === link.href ? 
                            "bg-accent text-accent-foreground shadow-sm" : 
                            "hover:bg-accent/50"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Séparateur visible seulement en mode ouvert */}
              {open && (
                <div className="mx-3 mb-6 border-t border-border/30"></div>
              )}

              {/* Section utilisateur */}
              <div className="flex flex-col gap-1 mb-6">
                {open && (
                  <div className="mb-3">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3"
                    >
                      {user ? "Mon Compte" : "Connexion"}
                    </motion.p>
                  </div>
                )}
                {userLinks.map((link, idx) => (
                  <div key={idx}>
                    {!open ? (
                      <Tooltip content={link.label}>
                        <SidebarLink 
                          link={link}
                          className={cn(
                            "transition-all duration-200",
                            pathname === link.href ? 
                              "bg-accent text-accent-foreground shadow-sm" : 
                              "hover:bg-accent/50"
                          )}
                        />
                      </Tooltip>
                    ) : (
                      <SidebarLink 
                        link={link}
                        className={cn(
                          "transition-all duration-200",
                          pathname === link.href ? 
                            "bg-accent text-accent-foreground shadow-sm" : 
                            "hover:bg-accent/50"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Séparateur visible seulement en mode ouvert */}
              {open && (
                <div className="mx-3 mb-6 border-t border-border/30"></div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-1">
                {open && (
                  <div className="mb-3">
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3"
                    >
                      Actions
                    </motion.p>
                  </div>
                )}
                {actionLinks.map((link, idx) => (
                  <div key={idx}>
                    {!open ? (
                      <Tooltip content={link.label}>
                        {link.href && link.href !== "#" ? (
                          <Link href={link.href} className="cursor-pointer hover:bg-accent/50 transition-all duration-200 flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg text-muted-foreground hover:text-accent-foreground border border-transparent hover:border-border/50">
                            <div className="text-foreground/80 group-hover/sidebar:text-primary transition-colors duration-300">
                              {link.icon}
                            </div>
                          </Link>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-accent/50 transition-all duration-200 flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg text-muted-foreground hover:text-accent-foreground border border-transparent hover:border-border/50"
                            onClick={link.onClick}
                          >
                            <div className="text-foreground/80 group-hover/sidebar:text-primary transition-colors duration-300">
                              {link.icon}
                            </div>
                          </div>
                        )}
                      </Tooltip>
                    ) : (
                      link.href && link.href !== "#" ? (
                        <Link href={link.href} className="cursor-pointer hover:bg-accent/50 transition-all duration-200 flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg text-muted-foreground hover:text-accent-foreground border border-transparent hover:border-border/50">
                          <div className="text-foreground/80 group-hover/sidebar:text-primary transition-colors duration-300">
                            {link.icon}
                          </div>
                          <motion.span
                            animate={{
                              display: "inline-block",
                              opacity: 1,
                            }}
                            className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0 group-hover/sidebar:translate-x-1 transition-all duration-300 text-foreground/80 group-hover/sidebar:text-foreground"
                          >
                            {link.label}
                          </motion.span>
                        </Link>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-accent/50 transition-all duration-200 flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg text-muted-foreground hover:text-accent-foreground border border-transparent hover:border-border/50"
                          onClick={link.onClick}
                        >
                          <div className="text-foreground/80 group-hover/sidebar:text-primary transition-colors duration-300">
                            {link.icon}
                          </div>
                          <motion.span
                            animate={{
                              display: "inline-block",
                              opacity: 1,
                            }}
                            className="text-sm font-medium whitespace-pre inline-block !p-0 !m-0 group-hover/sidebar:translate-x-1 transition-all duration-300 text-foreground/80 group-hover/sidebar:text-foreground"
                          >
                            {link.label}
                          </motion.span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        {/* Contenu principal */}
        <div className="flex-1 bg-background ml-[90px] transition-all duration-300" style={{ marginLeft: open ? '290px' : '90px' }}>
          <main className="min-h-screen w-full">
            <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
              <div className="min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] w-full bg-background rounded-lg md:rounded-xl lg:rounded-2xl shadow-sm border border-border/50 p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Contenu mobile */}
      <div className="md:hidden">
        <main>
          {children}
        </main>
      </div>


    </>
  );
}

export const ReboulLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-3 py-2 text-sm font-normal cursor-pointer group"
    >
      <ReboulLogoImage size="md" />
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="font-bold text-foreground text-xl tracking-tight group-hover:text-primary transition-colors duration-300"
      >
        Reboul Store 2.0
      </motion.span>
    </Link>
  );
};

export const ReboulLogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center justify-center py-2 cursor-pointer group mb-2"
      title="Retour à l'accueil"
    >
      <ReboulLogoImage 
        size="lg" 
        className="p-1"
      />
    </Link>
  );
}; 