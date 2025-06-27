import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface Action {
  icon: ReactNode;
  onClick: () => void;
  label: string;
}

interface TheCornerPageHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: Action[];
  backgroundImage?: string;
  logoImage?: string;
}

export function TheCornerPageHeader({
  title = "The Corner",
  subtitle = "Découvrez notre sélection exclusive de vêtements premium",
  backLink = "/",
  backText = "Accueil",
  breadcrumbs = [],
  actions = [],
  backgroundImage = "/images/header/thecorner/1.png",
  logoImage = "/images/the-corner-logo-white.png",
}: TheCornerPageHeaderProps) {
  return (
    <div className="relative w-full h-[280px] overflow-hidden bg-zinc-900 transition-all duration-500 ease-in-out">
      {/* Image de fond */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover opacity-60 transition-opacity duration-500 ease-in-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/30 to-transparent transition-opacity duration-500 ease-in-out" />
        </div>
      )}

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation et Logo */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6 transition-all duration-500 ease-in-out">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Link
              href={backLink}
              className="flex items-center gap-1 hover:text-white transition-colors duration-300"
            >
              <span>←</span>
              <span className="transition-all duration-500 ease-in-out">
                {backText}
              </span>
            </Link>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <span>→</span>}
                    <Link
                      href={crumb.href}
                      className={cn(
                        "hover:text-white transition-all duration-500 ease-in-out truncate max-w-[80px] sm:max-w-[200px]",
                        index === breadcrumbs.length - 1
                          ? "text-white"
                          : "text-white/70",
                      )}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 transition-all duration-500 ease-in-out transform">
            <Image
              src={logoImage}
              alt="The Corner Logo"
              fill
              className="object-contain transition-transform duration-500 ease-in-out"
              priority
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col justify-end px-4 pb-6 sm:px-6 sm:pb-8 transition-all duration-500 ease-in-out">
          {/* Texte */}
          <div className="transform transition-all duration-500 ease-in-out">
            <h1 className="text-[32px] leading-none font-bold text-white tracking-tight mb-3 sm:text-5xl sm:mb-4 transition-all duration-500 ease-in-out transform">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-zinc-300 leading-snug sm:text-lg sm:leading-relaxed max-w-xl transition-all duration-500 ease-in-out transform opacity-90 hover:opacity-100">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-2 mt-4 transition-all duration-500 ease-in-out">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-2 rounded-full hover:bg-zinc-800/50 transition-all duration-300 ease-in-out transform hover:scale-105"
                  aria-label={action.label}
                >
                  {action.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
