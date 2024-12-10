'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleRouteChange = () => {
            setLoading(true)
            // Simulate a delay to show the loading indicator
            setTimeout(() => setLoading(false), 500)
        }

        handleRouteChange() // Initial load
    }, [pathname, searchParams])

    return (
        <>
            {loading && <Loader />}
            {children}
        </>
    )
}

