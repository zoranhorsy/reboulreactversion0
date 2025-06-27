"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { initGSAP } from "@/lib/gsap-config";

interface ScrollTriggerAnimationProps {
  children: React.ReactNode;
  startPosition?: string;
  endPosition?: string;
  delay?: number;
  duration?: number;
  fromY?: number;
  stagger?: number;
  scrub?: boolean | number;
  once?: boolean;
  className?: string;
}

export const ScrollTriggerAnimation: React.FC<ScrollTriggerAnimationProps> = ({
  children,
  startPosition = "top bottom-=100",
  endPosition,
  delay = 0,
  duration = 0.8,
  fromY = 50,
  stagger = 0,
  scrub = false,
  once = true,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let ctx: ReturnType<typeof gsap.context> | null = null;

    const setupGSAP = async () => {
      try {
        // Initialiser GSAP de manière dynamique
        const { gsap, ScrollTrigger } = await initGSAP();
        if (!ScrollTrigger) return;

        // Créer le contexte GSAP pour nettoyer correctement
        ctx = gsap.context(() => {
          const childElements = Array.from(element.children);

          // Animation au scroll pour tous les enfants
          if (childElements.length > 0) {
            // Configurer les options de ScrollTrigger de base
            const scrollOptions: any = {
              trigger: element,
              start: startPosition,
              toggleActions: scrub ? undefined : "play none none none",
              once: once && !scrub,
              scrub: scrub ? (typeof scrub === "number" ? scrub : 0.5) : false,
            };

            // Ajouter end position si définie
            if (endPosition) {
              scrollOptions.end = endPosition;
            }

            const tl = gsap.timeline({
              scrollTrigger: scrollOptions,
              delay: delay,
            });

            // Animation avec stagger pour les enfants multiples
            if (stagger > 0 && childElements.length > 1) {
              tl.fromTo(
                childElements,
                {
                  opacity: 0,
                  y: fromY,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: duration,
                  stagger: stagger,
                  ease: "power2.out",
                  clearProps: scrub ? "" : "transform",
                },
              );
            } else {
              // Animation simple sans stagger
              tl.fromTo(
                childElements,
                {
                  opacity: 0,
                  y: fromY,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: duration,
                  ease: "power2.out",
                  clearProps: scrub ? "" : "transform",
                },
              );
            }
          }
        }, element);

        // Observer le redimensionnement pour mettre à jour les animations
        const resizeObserver = new ResizeObserver(() => {
          ScrollTrigger.refresh();
        });
        resizeObserver.observe(element);

        // Nettoyer l'observer au démontage
        return () => {
          resizeObserver.disconnect();
          if (ctx) ctx.revert();
        };
      } catch (error) {
        console.error("Erreur lors de la configuration de GSAP:", error);
      }
    };

    setupGSAP();

    // Cleanup
    return () => {
      if (ctx) ctx.revert();
    };
  }, [
    startPosition,
    endPosition,
    delay,
    duration,
    fromY,
    stagger,
    scrub,
    once,
  ]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
