"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarLogo,
  SidebarAvatar,
} from "@/components/ui/reboul-sidebar";
import { useTheme } from "next-themes";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

interface ReboulNavigationSimpleProps {
  children: React.ReactNode;
  showUserSection?: boolean;
  mode?: "sidebar-only" | "with-dock";
}

export function ReboulNavigationSimple({
  children,
  showUserSection = true,
  mode = "sidebar-only",
}: ReboulNavigationSimpleProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Utilisateur factice pour les tests
  const mockUser = {
    username: "Utilisateur Demo",
    email: "demo@reboul.com",
    isAdmin: true,
    avatar_url: undefined,
  };

  // Navigation principale
  const mainNavigation: NavigationItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: <span>&quot;Home&quot;</span>,
      isActive: pathname === "/",
    },
    {
      label: "Catalogue",
      href: "/catalogue",
      icon: <span>🛍️</span>,
      isActive: pathname?.startsWith("/catalogue"),
    },
    {
      label: "The Corner",
      href: "/the-corner",
      icon: <span>&quot;Sparkles&quot;</span>,
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
  const userNavigation: NavigationItem[] = [
    {
      label: "Mon Profil",
      href: "/profil",
      icon: <span>&quot;UserCircle2&quot;</span>,
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
    ...(mockUser.isAdmin
      ? [
          {
            label: "Administration",
            href: "/admin",
            icon: <span>&quot;Settings&quot;</span>,
            isActive: pathname?.startsWith("/admin"),
          },
        ]
      : []),
    {
      label: "Déconnexion",
      href: "#",
      icon: <span>&quot;LogOut&quot;</span>,
      onClick: () => {
        console.log("Déconnexion demo");
      },
    },
  ];

  // Navigation système
  const systemNavigation: NavigationItem[] = [
    {
      label: theme === "dark" ? "Mode Clair" : "Mode Sombre",
      href: "#",
      icon:
        theme === "dark" ? (
          <span>&quot;Sun&quot;</span>
        ) : (
          <span>&quot;Moon&quot;</span>
        ),
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
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo Reboul */}

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
          {showUserSection && (
            <SidebarAvatar
              name={mockUser.username}
              email={mockUser.email}
              avatarUrl={mockUser.avatar_url}
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

// Version simplifiée des layouts pour les tests
export function ReboulPageLayoutSimple({
  children,
  showUserSection = true,
}: {
  children: React.ReactNode;
  showUserSection?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ReboulNavigationSimple showUserSection={showUserSection}>
        {children}
      </ReboulNavigationSimple>
    </div>
  );
}

export function ReboulSidebarLayoutSimple({
  children,
  showUserSection = true,
}: {
  children: React.ReactNode;
  showUserSection?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ReboulNavigationSimple showUserSection={showUserSection}>
        {children}
      </ReboulNavigationSimple>
    </div>
  );
}
