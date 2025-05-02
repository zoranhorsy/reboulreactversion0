'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { LoaderComponent } from '@/components/ui/Loader'

export function LoadingIndicator() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

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

    // Reset loading state when pathname or searchParams change
    useEffect(() => {
        setLoading(false)
    }, [pathname, searchParams])

    if (!loading) return null

    return <LoaderComponent />
}

