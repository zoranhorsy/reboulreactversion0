'use client'

import { useEffect, useState } from 'react'

export function BodyWrapper({ children }: { children: React.ReactNode }) {
    const [_documentId, setDocumentId] = useState<string | null>(null)

    useEffect(() => {
        // Générer un ID unique pour le document
        const newDocumentId = `doc-${Math.random().toString(36).substr(2, 9)}`
        setDocumentId(newDocumentId)

        // Appliquer l'ID du document au body
        document.body.setAttribute('data-demoway-document-id', newDocumentId)

        // Supprimer l'attribut style s'il est vide
        if (document.body.getAttribute('style') === '') {
            document.body.removeAttribute('style')
        }

        // Nettoyage
        return () => {
            document.body.removeAttribute('data-demoway-document-id')
        }
    }, [])

    return <>{children}</>
}

