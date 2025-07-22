"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

// Tableau des annonces à afficher
const announcements = [
  {
    text: "NOUVEAUX PRODUITS DISPONIBLES CHAQUE SEMAINE",
    link: "/nouveautes",
  },
  {
    text: "🚚 LIVRAISON GRATUITE À PARTIR DE 50€ D'ACHAT",
    link: "/livraison",
  },
  {
    text: "OFFRE EXCLUSIVE: -10% AVEC LE CODE BIENVENUE10",
    link: "/offres",
  },
];

// Styles CSS pour les animations
const scrollingStyles = `
  @keyframes scrolling {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-1500px);
    }
  }
  
  .scrolling-animation {
    animation: scrolling 25s linear infinite;
  }
  
  .scrolling-animation:hover {
    animation-play-state: paused;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .fade-in-up {
    animation: fadeInUp 300ms ease-out;
  }
`;

export default function AnnouncementBar() {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Injecter les styles CSS pour les animations
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollingStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Gérer la fermeture de la barre (seulement pour la session en cours)
  const handleClose = () => {
    setIsVisible(false);
  };

  // Changer l'annonce toutes les 5 secondes
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  // Si la barre est masquée, ne rien afficher
  if (!isVisible) return null;

  return (
    <div className="relative bg-black text-white py-1 overflow-hidden z-30 group">
      {/* Effet de surbrillance au survol */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Effet de fondu à gauche */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black to-transparent z-10" />

      {/* Effet de fondu à droite */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black to-transparent z-10" />

      {/* Bouton de fermeture */}
      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors duration-200"
        aria-label="annonce"
      >
        <span>×</span>
      </button>

      <div className="container mx-auto px-4 relative overflow-hidden">
        {/* Animation de défilement horizontal */}
        <div
          className="whitespace-nowrap flex justify-center scrolling-animation"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {/* Répéter les annonces pour l'effet continu */}
          {[...announcements, ...announcements].map((announcement, index) => (
            <Link
              href={announcement.link}
              key={index}
              className="inline-block px-6 text-xs font-medium uppercase hover:text-primary transition-colors duration-200"
            >
              <span>{announcement.text}</span>
              <span className="mx-5 text-white/30">|</span>
            </Link>
          ))}
        </div>

        {/* Animation de fondu entre annonces (alternative à l'animation horizontale) */}
        <div className="hidden absolute inset-0 flex items-center justify-center">
          <div key={currentIndex} className="text-center fade-in-up">
            <Link
              href={announcements[currentIndex].link}
              className="text-xs font-medium uppercase hover:text-primary transition-colors duration-200"
            >
              {announcements[currentIndex].text}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
