import React, { HTMLAttributes, useEffect, useState, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface AnimatedBoxProps extends HTMLAttributes<HTMLDivElement> {
  animation?: 'fadeIn' | 'fadeOut' | 'scaleIn' | 'scaleOut' | 'slideInRight' | 'slideInLeft' |
    'slideInTop' | 'slideInBottom' | 'slideOutRight' | 'slideOutLeft' | 'slideOutTop' | 'slideOutBottom' |
    'rotate' | 'pulse' | 'bounce';
  duration?: 'fast' | 'normal' | 'slow';
  easing?: 'default' | 'in' | 'out' | 'bounce';
  delay?: 100 | 200 | 300 | 500 | 700 | 1000;
  animateOnMount?: boolean;
}

/**
 * Composant de boîte animée utilisant uniquement CSS sans framer-motion
 */
const OptimizedAnimatedBox = forwardRef<HTMLDivElement, AnimatedBoxProps>(
  (
    {
      children,
      className,
      animation = 'fadeIn',
      duration = 'normal',
      easing = 'default',
      delay,
      animateOnMount = true,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(!animateOnMount);

    useEffect(() => {
      if (animateOnMount) {
        setIsVisible(true);
      }
    }, [animateOnMount]);

    // Mapping des animations vers les classes CSS
    const animationClassMap = {
      fadeIn: 'animate-fade-in',
      fadeOut: 'animate-fade-out',
      scaleIn: 'animate-scale-in',
      scaleOut: 'animate-scale-out',
      slideInRight: 'animate-slide-in-right',
      slideInLeft: 'animate-slide-in-left',
      slideInTop: 'animate-slide-in-top',
      slideInBottom: 'animate-slide-in-bottom',
      slideOutRight: 'animate-slide-out-right',
      slideOutLeft: 'animate-slide-out-left',
      slideOutTop: 'animate-slide-out-top',
      slideOutBottom: 'animate-slide-out-bottom',
      rotate: 'animate-rotate',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce'
    };

    // Durée
    const durationClassMap = {
      fast: 'duration-fast',
      normal: 'duration-normal',
      slow: 'duration-slow'
    };

    // Easing
    const easingClassMap = {
      default: 'easing-default',
      in: 'easing-in',
      out: 'easing-out',
      bounce: 'easing-bounce'
    };

    // Delay
    const delayClass = delay ? `delay-${delay}` : '';

    // Classes d'animation combinées
    const animationClasses = isVisible ? cn(
      animationClassMap[animation],
      durationClassMap[duration],
      easingClassMap[easing],
      delayClass
    ) : 'opacity-0';

    return (
      <div
        ref={ref}
        className={cn(animationClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

OptimizedAnimatedBox.displayName = 'OptimizedAnimatedBox';

export default OptimizedAnimatedBox; 