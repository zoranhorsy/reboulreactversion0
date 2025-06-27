"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "up" | "down";
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className = "",
  direction = "up",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Enregistrer ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const element = containerRef.current;
    const yMovement = direction === "up" ? -100 * speed : 100 * speed;

    const animation = gsap.fromTo(
      element,
      { y: 0 },
      {
        y: yMovement,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );

    return () => {
      // Nettoyer l'animation au démontage
      if (animation) animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [speed, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
