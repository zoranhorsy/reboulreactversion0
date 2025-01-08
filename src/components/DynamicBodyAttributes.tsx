'use client'

import { useEffect, useState } from 'react'

export function DynamicBodyAttributes({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            const newDocumentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            document.body.setAttribute('data-demoway-document-id', newDocumentId)

            // Remove the style attribute if it's empty
            if (document.body.getAttribute('style') === '') {
                document.body.removeAttribute('style')
            }

            return () => {
                document.body.removeAttribute('data-demoway-document-id')
            }
        }
    }, [mounted])

    return <>{children}</>
}

