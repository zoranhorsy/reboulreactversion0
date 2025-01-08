'use client'

import { useDocumentId } from '@/hooks/useDocumentId'

export function DynamicAttributes({ children }: { children: React.ReactNode }) {
    const documentId = useDocumentId()

    if (!documentId) {
        return null // ou un composant de chargement si nécessaire
    }

    return (
        <div data-demoway-document-id={documentId} style={{}}>
            {children}
        </div>
    )
}

