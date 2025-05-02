'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from './GsapProvider'

interface TextAnimationProps {
  text: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  className?: string
  wordStagger?: number
  delay?: number
  duration?: number
  onComplete?: () => void
  animateOnScroll?: boolean
}

export const TextAnimation: React.FC<TextAnimationProps> = ({
  text,
  tag = 'div',
  className = '',
  wordStagger = 0.05,
  delay = 0,
  duration = 0.5,
  onComplete,
  animateOnScroll = false
}) => {
  const containerRef = useRef<HTMLElement>(null)
  const { gsap, ScrollTrigger, isReady } = useGSAP()
  const [words, setWords] = useState<string[]>([])
  
  // Diviser le texte en mots
  useEffect(() => {
    if (text) {
      setWords(text.split(' '))
    }
  }, [text])
  
  // Appliquer l'animation
  useEffect(() => {
    if (!isReady || !gsap || !containerRef.current || words.length === 0) return
    
    const wordElements = containerRef.current.querySelectorAll('.word')
    
    // Configuration de base de l'animation
    gsap.set(wordElements, { 
      opacity: 0,
      y: 20,
      display: 'inline-block'
    })
    
    // Paramètres de l'animation
    const animationConfig = {
      opacity: 1,
      y: 0,
      duration: duration,
      stagger: wordStagger,
      ease: 'power2.out',
      onComplete: onComplete,
      delay: delay
    }
    
    let animation: gsap.core.Timeline
    
    if (animateOnScroll && ScrollTrigger) {
      // Animation déclenchée au scroll
      animation = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true
        }
      })
      
      animation.to(wordElements, animationConfig)
    } else {
      // Animation immédiate
      animation = gsap.timeline()
      animation.to(wordElements, animationConfig)
    }
    
    return () => {
      if (animation) animation.kill()
    }
  }, [isReady, gsap, ScrollTrigger, words, wordStagger, delay, duration, onComplete, animateOnScroll])
  
  // Créer les éléments texte enfants
  const childElements = words.map((word, index) => (
    <span key={index} className="word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
      {word}
    </span>
  ))
  
  // Rendu avec React.createElement pour éviter les problèmes de type avec la ref
  return React.createElement(
    tag,
    { ref: containerRef, className },
    childElements
  )
} 