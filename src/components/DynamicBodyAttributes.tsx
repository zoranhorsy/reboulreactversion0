'use client'

import { useEffect, useState } from 'react'

interface DynamicBodyAttributesProps {
    children?: React.ReactNode
}

export default function DynamicBodyAttributes({ children }: DynamicBodyAttributesProps) {
    const [documentId, setDocumentId] = useState('')

    useEffect(() => {
        const newDocumentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setDocumentId(newDocumentId)
    }, [])

    return (
        <div data-demoway-document-id={documentId}>
            {children}
        </div>
    )
}

