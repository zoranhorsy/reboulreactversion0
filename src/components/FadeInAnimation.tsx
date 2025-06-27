"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface FadeInAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  triggerOnce?: boolean;
}

export const FadeInAnimation: React.FC<FadeInAnimationProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  y = 20,
  className = "",
  triggerOnce = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;

    // Animation de base
    gsap.set(element, {
      opacity: 0,
      y: y,
    });

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: duration,
      delay: delay,
      ease: "power2.out",
      clearProps: "transform",
    });

    return () => {
      // Nettoyer l'animation au démontage
      if (animation) animation.kill();
    };
  }, [delay, duration, y]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
