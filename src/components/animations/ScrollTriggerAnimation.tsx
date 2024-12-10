'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollTriggerAnimationProps {
    children: React.ReactNode
}

export const ScrollTriggerAnimation: React.FC<ScrollTriggerAnimationProps> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (element) {
            const childElements = Array.from(element.children)

            const setupAnimations = () => {
                childElements.forEach((child, index) => {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: child as Element,
                            start: 'top bottom-=100',
                            end: 'top center',
                            toggleActions: 'play none none reverse',
                        }
                    });

                    tl.fromTo(child,
                        {
                            opacity: 0,
                            y: 50,
                            scale: 0.95,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.8,
                            ease: 'power3.out',
                        }
                    );
                });
            }

            setupAnimations();

            // Réinitialiser les animations lors du redimensionnement
            const resizeObserver = new ResizeObserver(() => {
                ScrollTrigger.refresh();
            });
            resizeObserver.observe(element);

            return () => {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
                resizeObserver.disconnect();
            }
        }
    }, []);

    return <div ref={ref}>{children}</div>
}

