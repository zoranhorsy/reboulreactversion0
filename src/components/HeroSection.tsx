"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Highlight } from "./ui/hero-highlight";
import { GridBackground } from "./ui/grid-background";
import DecryptedText from "@/blocks/TextAnimations/DecryptedText/DecryptedText";

export function HeroSection() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="relative min-h-[600px] pt-0 pb-16 w-full bg-white dark:bg-black overflow-hidden">
      <GridBackground className="absolute inset-0 w-full h-full">
        {/* Contenu du hero au premier plan */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 pt-12 pb-12 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full mx-auto mb-8 relative flex justify-center"
          >
            <div className="relative w-[280px] h-[84px] xs:w-[400px] xs:h-[120px] sm:w-[500px] sm:h-[150px] md:w-[600px] md:h-[180px] lg:w-[700px] lg:h-[210px] drop-shadow-2xl filter">
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/images/logotype_w.png"
                    : "/images/logotype_b.png"
                }
                alt="Reboul Store"
                fill
                priority
                sizes="(max-width: 480px) 280px, (max-width: 640px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 600px, 700px"
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-center max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-2xl mx-auto mb-12 text-base xs:text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 px-3 xs:px-4 sm:px-6 leading-relaxed drop-shadow-lg text-shadow-sm"
            style={{
              textShadow:
                resolvedTheme === "dark"
                  ? "0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)"
                  : "0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(255, 255, 255, 0.6)",
            }}
          >
            <DecryptedText
              text="univers de la mode premium avec Reboul Store, où chaque pièce raconte "
              className="text-center"
              animateOn="view"
              sequential={true}
              speed={50}
            />
            <motion.span
              initial={{
                backgroundSize: "0% 100%",
              }}
              animate={{
                backgroundSize: "100% 100%",
              }}
              transition={{
                duration: 2,
                ease: "linear",
                delay: 4, // Délai de 4s pour attendre que DecryptedText finisse
              }}
              style={{
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left center",
                display: "inline",
              }}
              className="relative inline-block rounded-lg bg-gradient-to-r from-blue-300 to-sky-100 dark:from-blue-900/90 dark:to-sky-900/90 px-1 pb-1 shadow-lg backdrop-blur-sm text-blue-950 dark:text-blue-100"
            >
              <DecryptedText
                text="une histoire de qualité exceptionnelle et de design avant-gardiste."
                className="text-center"
                animateOn="view"
                sequential={true}
                speed={50}
              />
            </motion.span>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto px-4"
          >
            <Button
              asChild
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-white/90 text-white hover:text-white dark:text-zinc-900 dark:hover:text-zinc-900 h-12 w-full sm:w-auto px-8 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 backdrop-blur-sm border border-white/10 dark:border-black/10"
            >
              <Link
                href="/catalogue"
                className="flex items-center justify-center gap-2 text-sm font-medium"
              >
                Explorer la collection
                <span>→</span>
              </Link>
            </Button>

            <Button
              asChild
              className="bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-900 hover:text-zinc-900 dark:text-white dark:hover:text-white h-12 w-full sm:w-auto px-8 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <Link
                href="/about"
                className="flex items-center justify-center gap-2 text-sm font-medium"
              >
                Notre histoire
              </Link>
            </Button>
          </motion.div>
        </div>
      </GridBackground>
    </div>
  );
}
