'use client'

import React, { useEffect, useRef } from 'react'
import { useGSAP } from './GsapProvider'

interface ParallaxSectionProps {
  children: React.ReactNode
  bgImage?: string
  speed?: number
  className?: string
  overlayOpacity?: number
  darkMode?: boolean
  direction?: 'vertical' | 'horizontal'
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  bgImage,
  speed = 0.5,
  className = '',
  overlayOpacity = 0.3,
  darkMode = false,
  direction = 'vertical'
}) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const { gsap, ScrollTrigger, isReady } = useGSAP()
  
  useEffect(() => {
    if (!isReady || !gsap || !ScrollTrigger || !sectionRef.current || !bgRef.current) return
    
    const ctx = gsap.context(() => {
      // Effet de parallaxe au scroll
      const yMovement = direction === 'vertical' ? `-${30 * speed}%` : '0%'
      const xMovement = direction === 'horizontal' ? `-${20 * speed}%` : '0%'
      
      gsap.fromTo(bgRef.current,
        { 
          y: direction === 'vertical' ? '0%' : undefined,
          x: direction === 'horizontal' ? '0%' : undefined,
          backgroundPosition: '50% 0%'
        },
        {
          y: direction === 'vertical' ? yMovement : undefined,
          x: direction === 'horizontal' ? xMovement : undefined,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      )
    }, sectionRef)
    
    return () => ctx.revert()
  }, [isReady, gsap, ScrollTrigger, speed, direction])
  
  const backgroundStyle = bgImage 
    ? { backgroundImage: `url(${bgImage})` }
    : {};
  
  return (
    <div 
      ref={sectionRef} 
      className={`relative overflow-hidden ${className}`}
    >
      {/* Background avec effet parallaxe */}
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={backgroundStyle}
      />
      
      {/* Overlay pour améliorer la lisibilité du contenu */}
      {overlayOpacity > 0 && (
        <div 
          className={`absolute inset-0 ${darkMode ? 'bg-black' : 'bg-white'}`}
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {/* Contenu de la section */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}; 