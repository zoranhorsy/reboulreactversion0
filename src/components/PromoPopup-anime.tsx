"use client";

import React, { useState, useEffect, useRef } from "react";
// NOUVELLE VERSION : AnimeJS au lieu de Framer-Motion (120KB → 8KB)
import { fadeInOut } from "@/lib/animations/anime-utils";
import Link from "next/link";

interface PromoPopupProps {
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
}

export default function PromoPopupAnime({
  title,
  message,
  buttonText,
  buttonLink,
}: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Afficher le popup après 3 secondes
    const timer = setTimeout(() => {
      const hasSeenPromo = localStorage.getItem("hasSeenPromo");
      if (!hasSeenPromo) {
        setIsVisible(true);

        // Animer l'entrée avec AnimeJS
        if (overlayRef.current && popupRef.current) {
          // Préparer les éléments
          overlayRef.current.style.opacity = "0";
          popupRef.current.style.opacity = "0";
          popupRef.current.style.transform = "scale(0.9)";

          // Animer l'overlay
          fadeInOut.enter(overlayRef.current, { duration: 300 });

          // Animer le popup avec un délai
          setTimeout(() => {
            if (popupRef.current) {
              fadeInOut.enter(popupRef.current, {
                duration: 400,
                easing: "easeOutBack",
              });
            }
          }, 100);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (overlayRef.current && popupRef.current) {
      // Animer la sortie
      fadeInOut.exit(popupRef.current, { duration: 200 });

      setTimeout(() => {
        if (overlayRef.current) {
          fadeInOut.exit(overlayRef.current, { duration: 200 });
        }

        setTimeout(() => {
          setIsVisible(false);
          localStorage.setItem("hasSeenPromo", "true");
        }, 200);
      }, 100);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl z-50 
                   max-w-md w-full mx-4 border border-zinc-200 dark:border-zinc-800"
      >
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 
                     transition-colors duration-200"
        >
          <span>×</span>
        </button>

        {/* Contenu */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {title}
          </h3>

          <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {message}
          </p>

          <Link
            href={buttonLink}
            onClick={handleClose}
            className="inline-block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 
                       px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 
                       transition-colors duration-200 hover:scale-105 active:scale-95 
                       transform transition-transform"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </>
  );
}
