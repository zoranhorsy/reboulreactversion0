'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnnouncementBar() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 bg-black text-white py-2 overflow-hidden z-50">
      {/* Effet de fondu à gauche */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-black to-transparent z-10" />
      {/* Effet de fondu à droite */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black to-transparent z-10" />
      
      <motion.div
        className="whitespace-nowrap"
        animate={{
          x: [0, -2000],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0
        }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        <span className="inline-block px-4 text-sm font-medium uppercase">
          🎉 Offre Spéciale : 10% de réduction pour les nouveaux inscrits avec le code BIENVENUE10 | 
          🚚 Livraison gratuite pour toute commande supérieure à 50€ | 
          ✨ Nouveaux produits disponibles chaque semaine 🎉
        </span>
      </motion.div>
    </div>
  );
} 