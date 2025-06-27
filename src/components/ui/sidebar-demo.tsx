"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
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
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/contexts/SSRSafeProviders";

export default function SidebarDemo() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const mainLinks = [
    {
      label: "Accueil",
      href: "/",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Catalogue",
      href: "/catalogue",
      icon: (
        <IconShoppingBag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "The Corner",
      href: "/the-corner",
      icon: (
        <IconStar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "À propos",
      href: "/about",
      icon: (
        <IconInfoCircle className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const userLinks = user ? [
    {
      label: "Mon Profil",
      href: "/profil",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Favoris",
      href: "/favorites",
      icon: (
        <IconHeart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Panier",
      href: "/cart",
      icon: (
        <IconShoppingCart className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Administration",
      href: "/admin",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Déconnexion",
      href: "#",
      icon: (
        <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ] : [
    {
      label: "Connexion",
      href: "/connexion",
      icon: (
        <IconLogin className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const systemLinks = [
    {
      label: theme === "dark" ? "Mode Clair" : "Mode Sombre",
      href: "#",
      icon: theme === "dark" ? (
        <IconSun className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ) : (
        <IconMoon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);
  
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-white md:flex-row dark:bg-neutral-900",
        "h-screen" // Utilise toute la hauteur de l'écran
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <ReboulLogo /> : <ReboulLogoIcon />}
            
            {/* Navigation principale */}
            <div className="mt-8 flex flex-col gap-2">
              {mainLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            {/* Séparateur */}
            <div className="my-6 border-t border-neutral-200 dark:border-neutral-700" />

            {/* Navigation utilisateur */}
            <div className="flex flex-col gap-2">
              {userLinks.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link}
                  className={link.href === "#" ? "cursor-pointer" : ""}
                />
              ))}
            </div>

            {/* Navigation système */}
            <div className="mt-6 flex flex-col gap-2">
              {systemLinks.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={{
                    ...link,
                    href: "#"
                  }}
                  className="cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              ))}
            </div>
          </div>

          {/* Avatar utilisateur si connecté */}
          {user && (
            <div>
              <SidebarLink
                link={{
                  label: user.username || "Utilisateur",
                  href: "/profil",
                  icon: (
                    <img
                      src={user.avatar_url || "https://assets.aceternity.com/manu.png"}
                      className="h-7 w-7 shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      <MainContent />
    </div>
  );
}

export const ReboulLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-black dark:text-white text-xl"
      >
        REBOUL
      </motion.span>
    </Link>
  );
};

export const ReboulLogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </Link>
  );
};

// Contenu principal de la page
const MainContent = () => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex gap-2">
          {[...new Array(4)].map((i, idx) => (
            <div
              key={"first-array-demo-1" + idx}
              className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            ></div>
          ))}
        </div>
        <div className="flex flex-1 gap-2">
          {[...new Array(2)].map((i, idx) => (
            <div
              key={"second-array-demo-1" + idx}
              className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}; 