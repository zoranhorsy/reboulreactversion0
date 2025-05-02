'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Dock } from '@/components/Dock'
import { LoaderComponent } from '@/components/ui/Loader'

const DynamicBodyAttributes = dynamic(() => import('@/components/DynamicBodyAttributes'), { ssr: false })
const GsapInitializer = dynamic(() => import('@/components/GsapInitializer'), { ssr: false })

export default function ClientWrapper() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    return (
        <>
            <DynamicBodyAttributes />
            <LoaderComponent />
            <GsapInitializer />
            <Dock />
        </>
    )
}

