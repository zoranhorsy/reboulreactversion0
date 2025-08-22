import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Breadcrumb {
  label: string;
  href: string;
}

interface Action {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}

interface ReboulPageHeaderProps {
  title: string;
  subtitle?: string;
  backLink: string;
  backText: string;
  breadcrumbs: Breadcrumb[];
  actions?: Action[];
  backgroundImage?: string;
  logoImage?: string;
}

export function ReboulPageHeader({
  title,
  subtitle,
  backLink,
  backText,
  breadcrumbs,
  actions = [],
  backgroundImage = "/images/header/reboul/1.png",
  logoImage = "/images/logotype_w.png",
}: ReboulPageHeaderProps) {
  return (
    <div className="relative w-full h-[220px] overflow-hidden bg-zinc-900 transition-all duration-500 ease-out sm:rounded-xl">
      {/* Image de fond avec overlay amélioré */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover opacity-50 hover:opacity-60 transition-opacity duration-700 ease-out"
            priority
            fetchPriority="high"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-zinc-900/60 to-zinc-900/30 transition-opacity duration-500 ease-out" />
        </div>
      )}

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation simplifiée avec ombre */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-10">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80">
            <Link
              href={backLink}
              className="flex items-center gap-1 text-white hover:text-white/80 transition-colors duration-300 font-medium"
            >
              <span>←</span>
              <span className="transition-all duration-300 ease-out">
                {backText}
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                  {index > 0 && <span>→</span>}
                  <Link
                    href={crumb.href}
                    className="text-white hover:text-white/80 transition-all duration-300 ease-out truncate max-w-[80px] sm:max-w-[200px]"
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Logo plus petit et plus élégant */}
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 transition-all duration-500 ease-out">
            <Image
              src={logoImage}
              alt="Reboul Logo"
              fill
              className="object-contain filter drop-shadow-md transition-transform duration-700 hover:scale-105 ease-out"
              priority
            />
          </div>
        </div>

        {/* Contenu principal centré et plus aéré */}
        <div className="flex-1 flex flex-col justify-end px-4 pb-8 sm:px-6 md:px-8 lg:px-10">
          {/* Texte avec animation et ombre */}
          <div className="transform transition-all duration-300 ease-out">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 filter drop-shadow-sm">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl transition-all duration-300 ease-out transform">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions améliorées */}
          {actions?.length > 0 && (
            <div className="flex items-center gap-2 mt-4 transition-all duration-300 ease-out">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 ease-out transform hover:scale-105"
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
