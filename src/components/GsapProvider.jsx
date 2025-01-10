'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function GsapProvider({ children }) {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)
    }, [])

    return <>{children}</>
}

