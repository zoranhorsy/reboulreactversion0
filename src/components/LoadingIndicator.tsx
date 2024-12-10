'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'

export function LoadingIndicator() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleStart = () => setLoading(true)
        const handleComplete = () => setLoading(false)

        handleComplete() // Initial load

        return () => {
            // Cleanup if needed
        }
    }, [pathname, searchParams])

    if (!loading) return null

    return <Loader />
}

