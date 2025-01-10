'use client'

import { useEffect, useState } from 'react'

export default function DynamicBodyAttributes() {
    const [documentId, setDocumentId] = useState('')

    useEffect(() => {
        const newDocumentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setDocumentId(newDocumentId)
    }, [])

    return <div data-demoway-document-id={documentId} />
}

