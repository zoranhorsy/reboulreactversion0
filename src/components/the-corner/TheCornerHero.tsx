'use client'

import Image from "next/image"
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { ArrowDown, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

export function TheCornerHero() {
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === 'dark' ? "/images/the-corner-logo-white.png" : "/images/the-corner-logo-black.png"

  return (
    <div className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] overflow-hidden">
      {/* Fond avec effet de grain */}
      <div className="absolute inset-0 bg-noise opacity-[0.15] dark:opacity-[0.25] pointer-events-none" />
      
      {/* Image de fond avec effet de parallaxe */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/80">
        <div className="absolute inset-0 bg-grid-zinc-900 dark:bg-grid-zinc-100 opacity-[0.05]" />
      </div>

      {/* Contenu du Hero */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
        {/* Logo The Corner */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src={logoSrc}
            alt="The Corner"
            width={200}
            height={80}
            className="w-auto h-10 sm:h-12 md:h-14"
            priority
          />
        </motion.div>

        {/* Titre principal */}
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-foreground tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          The Corner
        </motion.h1>

        {/* Sous-titre */}
        <motion.p 
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Une sélection exclusive de pièces premium et de collaborations uniques
        </motion.p>

        {/* Bouton d'exploration */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary-hover transition-colors flex items-center gap-2 group"
          onClick={() => {
            const productsSection = document.getElementById('products-section');
            productsSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span>Explorer la collection</span>
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </motion.button>
      </div>

      {/* Indicateur de défilement */}
      <motion.div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <ChevronDown className="w-5 h-5 text-muted-foreground animate-scroll" />
      </motion.div>
    </div>
  )
} 