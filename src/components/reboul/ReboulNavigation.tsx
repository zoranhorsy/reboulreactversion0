"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarLogo,
  SidebarAvatar,
} from "@/components/ui/reboul-sidebar";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/contexts/AuthContext";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

interface ReboulNavigationProps {
  children: React.ReactNode;
  showUserSection?: boolean;
  mode?: "sidebar-only" | "with-dock";
}

export function ReboulNavigation({
  children,
  showUserSection = true,
  mode = "sidebar-only",
}: ReboulNavigationProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Navigation principale
  const mainNavigation: NavigationItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: <span>Home</span>,
      isActive: pathname === "/",
    },
    {
      label: "Catalogue Global",
      href: "/catalogue",
      icon: <span>🛍️</span>,
      isActive: pathname?.startsWith("/catalogue"),
    },
    {
      label: "Reboul Adult",
      href: "/reboul",
      icon: <span>👔</span>,
      isActive: pathname?.startsWith("/reboul"),
    },
    {
      label: "Sneakers",
      href: "/sneakers",
      icon: <span>👟</span>,
      isActive: pathname?.startsWith("/sneakers"),
    },
    {
      label: "Kids",
      href: "/kids",
      icon: <span>👶</span>,
      isActive: pathname?.startsWith("/kids"),
    },
    {
      label: "The Corner",
      href: "/the-corner",
      icon: <span>Sparkles</span>,
      isActive: pathname?.startsWith("/the-corner"),
    },
    {
      label: "À propos",
      href: "/about",
      icon: <span>ℹ️</span>,
      isActive: pathname === "/about",
    },
  ];

  // Navigation utilisateur
  const userNavigation: NavigationItem[] = user
    ? [
        {
          label: "Mon Profil",
          href: "/profil",
          icon: <span>User</span>,
          isActive: pathname === "/profil",
        },
        {
          label: "Mes Favoris",
          href: "/favoris",
          icon: <span>♥</span>,
          isActive: pathname === "/favoris",
        },
        {
          label: "Mon Panier",
          href: "/panier",
          icon: <span>🛒</span>,
          isActive: pathname === "/panier",
        },
        ...(user.is_admin
          ? [
              {
                label: "Administration",
                href: "/admin",
                icon: <span>Settings</span>,
                isActive: pathname?.startsWith("/admin"),
              },
            ]
          : []),
        {
          label: "Déconnexion",
          href: "#",
          icon: <span>LogOut</span>,
          onClick: () => {
            logout();
            router.push("/");
          },
        },
      ]
    : [
        {
          label: "Connexion",
          href: "/connexion",
          icon: <span>LogIn</span>,
          isActive: pathname === "/connexion",
        },
      ];

  // Navigation système
  const systemNavigation: NavigationItem[] = [
    {
      label: theme === "dark" ? "Mode Clair" : "Mode Sombre",
      href: "#",
      icon: theme === "dark" ? <span>Sun</span> : <span>Moon</span>,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];

  // Style adapté selon le mode
  const containerClasses =
    mode === "with-dock"
      ? "flex flex-col md:flex-row bg-background w-full flex-1 mx-auto overflow-hidden min-h-screen"
      : "rounded-md flex flex-col md:flex-row bg-background w-full flex-1 mx-auto border border-border/50 overflow-hidden min-h-screen";

  const contentClasses =
    mode === "with-dock"
      ? "flex-1 bg-background overflow-auto"
      : "flex-1 rounded-tl-2xl border border-border/50 bg-background overflow-auto";

  return (
    <div className={containerClasses}>
      <Sidebar animate={true}>
        <SidebarBody>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo Reboul */}
            <SidebarLogo />

            {/* Navigation principale */}
            <div className="mt-8 flex flex-col gap-2">
              {mainNavigation.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Séparateur */}
            <div className="my-6 border-t border-border/30" />

            {/* Navigation utilisateur */}
            {showUserSection && (
              <div className="flex flex-col gap-2">
                {userNavigation.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            )}

            {/* Navigation système */}
            <div className="mt-6 flex flex-col gap-2">
              {systemNavigation.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          {/* Avatar utilisateur en bas */}
          {user && showUserSection && (
            <SidebarAvatar
              name={user.username || "Utilisateur"}
              email={user.email}
              avatarUrl={user.avatar_url}
            />
          )}
        </SidebarBody>
      </Sidebar>

      {/* Contenu principal */}
      <div className="flex flex-1 flex-col">
        <div className={contentClasses}>{children}</div>
      </div>
    </div>
  );
}

// Composant wrapper pour les pages qui utilisent SEULEMENT la sidebar (remplace le dock)
export function ReboulPageLayout({
  children,
  showUserSection = true,
}: {
  children: React.ReactNode;
  showUserSection?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ReboulNavigation showUserSection={showUserSection} mode="sidebar-only">
        {children}
      </ReboulNavigation>
    </div>
  );
}

// Nouveau : Composant wrapper pour les pages qui utilisent la sidebar AVEC le dock
export function ReboulSidebarLayout({
  children,
  showUserSection = true,
}: {
  children: React.ReactNode;
  showUserSection?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ReboulNavigation showUserSection={showUserSection} mode="with-dock">
        {children}
      </ReboulNavigation>
    </div>
  );
}

// Composant sidebar simple qui peut être injecté dans n'importe quel layout
export function ReboulSidebarOnly({
  showUserSection = true,
  className = "",
}: {
  showUserSection?: boolean;
  className?: string;
}) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const mainNavigation: NavigationItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: <span>Home</span>,
      isActive: pathname === "/",
    },
    {
      label: "Catalogue Global",
      href: "/catalogue",
      icon: <span>🛍️</span>,
      isActive: pathname?.startsWith("/catalogue"),
    },
    {
      label: "Reboul Adult",
      href: "/reboul",
      icon: <span>👔</span>,
      isActive: pathname?.startsWith("/reboul"),
    },
    {
      label: "Sneakers",
      href: "/sneakers",
      icon: <span>👟</span>,
      isActive: pathname?.startsWith("/sneakers"),
    },
    {
      label: "Kids",
      href: "/kids",
      icon: <span>👶</span>,
      isActive: pathname?.startsWith("/kids"),
    },
    {
      label: "The Corner",
      href: "/the-corner",
      icon: <span>Sparkles</span>,
      isActive: pathname?.startsWith("/the-corner"),
    },
    {
      label: "À propos",
      href: "/about",
      icon: <span>ℹ️</span>,
      isActive: pathname === "/about",
    },
  ];

  const userNavigation: NavigationItem[] = user
    ? [
        {
          label: "Mon Profil",
          href: "/profil",
          icon: <span>User</span>,
          isActive: pathname === "/profil",
        },
        {
          label: "Mes Favoris",
          href: "/favoris",
          icon: <span>♥</span>,
          isActive: pathname === "/favoris",
        },
        {
          label: "Mon Panier",
          href: "/panier",
          icon: <span>🛒</span>,
          isActive: pathname === "/panier",
        },
        ...(user.is_admin
          ? [
              {
                label: "Administration",
                href: "/admin",
                icon: <span>Settings</span>,
                isActive: pathname?.startsWith("/admin"),
              },
            ]
          : []),
        {
          label: "Déconnexion",
          href: "#",
          icon: <span>LogOut</span>,
          onClick: () => {
            logout();
            router.push("/");
          },
        },
      ]
    : [
        {
          label: "Connexion",
          href: "/connexion",
          icon: <span>LogIn</span>,
          isActive: pathname === "/connexion",
        },
      ];

  const systemNavigation: NavigationItem[] = [
    {
      label: theme === "dark" ? "Mode Clair" : "Mode Sombre",
      href: "#",
      icon: theme === "dark" ? <span>Sun</span> : <span>Moon</span>,
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];

  return (
    <Sidebar animate={true} className={className}>
      <SidebarBody>
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarLogo />

          <div className="mt-8 flex flex-col gap-2">
            {mainNavigation.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>

          <div className="my-6 border-t border-border/30" />

          {showUserSection && (
            <div className="flex flex-col gap-2">
              {userNavigation.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {systemNavigation.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {user && showUserSection && (
          <SidebarAvatar
            name={user.username || "Utilisateur"}
            email={user.email}
            avatarUrl={user.avatar_url}
          />
        )}
      </SidebarBody>
    </Sidebar>
  );
}
