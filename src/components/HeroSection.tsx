"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import LightRays from "@/blocks/Backgrounds/LightRays/LightRays";
import TextType from "@/blocks/TextAnimations/TextType/TextType";
import AnimatedTextEntry from "@/blocks/TextAnimations/AnimatedTextEntry/AnimatedTextEntry";
import CircularText from "@/blocks/TextAnimations/CircularText/CircularText";

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const descContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-[500px] pt-0 pb-8 w-full bg-white dark:bg-black overflow-hidden md:rounded-2xl">
      {/* CircularText en haut à droite */}
      <div className="absolute top-4 right-4 z-30">
        <CircularText 
          text="REBOUL STORE 2.0 • FW25 •  " 
          spinDuration={18} 
          className={`hidden sm:block w-[80px] h-[80px] md:w-[170px] md:h-[170px] ${resolvedTheme === "dark" ? "text-white" : "text-black"}`} 
        />
      </div>
      <LightRays
        key={resolvedTheme}
        className="w-full h-full md:rounded-2xl"
        raysOrigin="top-center"
        raysColor={resolvedTheme === "dark" ? "#ffffff" : "#bfc3c9"}
        raysSpeed={1}
        lightSpread={1}
        rayLength={2}
        pulsating={false}
        fadeDistance={1.0}
        saturation={resolvedTheme === "dark" ? 1.0 : 0.85}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.0}
        distortion={0.0}
      >
        {/* Contenu du hero au premier plan */}
        <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 pt-12 pb-12 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full mx-auto mb-8 relative flex justify-center"
          >
            <div className="relative w-[280px] h-[84px] xs:w-[400px] xs:h-[120px] sm:w-[500px] sm:h-[150px] md:w-[600px] md:h-[180px] lg:w-[700px] lg:h-[210px]">
              <Image
                src={resolvedTheme === "dark" ? "/images/logotype_w.png" : "/images/logotype_b.png"}
                alt="Reboul Store"
                fill
                priority
                sizes="(max-width: 480px) 280px, (max-width: 640px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 600px, 700px"
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Description animée avec VariableProximity et TextType */}
          <div
            ref={descContainerRef}
            className="text-center max-w-6xl mx-auto mb-12 px-3 xs:px-4 sm:px-6 break-keep whitespace-pre-line text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
          >
            <AnimatedTextEntry
              text={
                "Reboul, référence de l'élégance contemporaine...." as string
              }
              className={`font-geist text-base xs:text-lg sm:text-xl md:text-2xl font-light leading-tight ${resolvedTheme === "dark" ? "text-white" : "text-black"}`}
              delay={300}
              duration={900}
              fontFamily="Geist, sans-serif"
            />
          </div>

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
                Explorer les collections
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
                A propos
              </Link>
            </Button>
          </motion.div>
        </div>
      </LightRays>
    </div>
  );
}
