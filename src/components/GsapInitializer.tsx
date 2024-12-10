'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GsapInitializer() {
    useEffect(() => {
        // This is necessary for ScrollTrigger to work correctly with Next.js client-side routing
        ScrollTrigger.refresh()

        // Add any global GSAP configurations here
        gsap.config({
            autoSleep: 60,
            force3D: true,
            nullTargetWarn: false,
        })

        return () => {
            // Clean up ScrollTrigger on component unmount
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    return null
}

