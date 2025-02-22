'use client'

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

export function GsapProvider({ children }: { children: React.ReactNode }) {
    useLayoutEffect(() => {
        // Configuration globale de GSAP
        gsap.config({
            nullTargetWarn: false, // Désactive les avertissements pour les cibles null
        })

        // Configuration globale de ScrollTrigger
        ScrollTrigger.config({
            ignoreMobileResize: true, // Optimisation pour mobile
        })

        // Nettoyage lors du démontage
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill())
            gsap.killTweensOf('*') // Arrête toutes les animations en cours
        }
    }, [])

    return <>{children}</>
} 