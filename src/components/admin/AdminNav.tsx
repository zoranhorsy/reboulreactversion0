"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "🏠" },
  { href: "/admin/products", label: "Produits", icon: "📦" },
  { href: "/admin/orders", label: "Commandes", icon: "🛒" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/archives", label: "Archives", icon: "🖼️" },
  { href: "/admin/stats", label: "Statistiques", icon: "📊" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = pathname === href || pathname?.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
              "hover:bg-accent",
              isActive
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {icon}
            </span>
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
