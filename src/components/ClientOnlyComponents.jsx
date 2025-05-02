'use client'

import { useEffect, useState } from 'react'
import { Dock } from '@/components/Dock'
import { DynamicBodyAttributes } from '@/components/DynamicBodyAttributes'
import { LoaderComponent } from '@/components/ui/Loader'
import GsapInitializer from '@/components/GsapInitializer'

export default function ClientOnlyComponents() {
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

