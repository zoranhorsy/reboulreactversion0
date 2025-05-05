'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { LoaderComponent } from '@/components/ui/Loader'

export function LoadingIndicator() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleRouteChange = () => {
            setLoading(true)
        }

        const handleRouteComplete = () => {
            setLoading(false)
        }

        // Simulating route change events
        window.addEventListener('routeChangeStart', handleRouteChange)
        window.addEventListener('routeChangeComplete', handleRouteComplete)
        window.addEventListener('routeChangeError', handleRouteComplete)

        return () => {
            window.removeEventListener('routeChangeStart', handleRouteChange)
            window.removeEventListener('routeChangeComplete', handleRouteComplete)
            window.removeEventListener('routeChangeError', handleRouteComplete)
        }
    }, [])

    // Reset loading state when pathname changes
    useEffect(() => {
        setLoading(false)
    }, [pathname])

    if (!loading) return null

    return <LoaderComponent />
}

