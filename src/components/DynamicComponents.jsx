'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Dock from '@/components/Dock'
import { LoaderComponent } from '@/components/ui/Loader'
import Footer from '@/components/Footer'

export default function DynamicComponents() {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger)

        const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        document.body.setAttribute('data-demoway-document-id', documentId)

        return () => {
            document.body.removeAttribute('data-demoway-document-id')
        }
    }, [])

    return (
        <>
            <LoaderComponent />
            <Dock />
            <Footer />
        </>
    )
}

