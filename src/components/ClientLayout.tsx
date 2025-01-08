'use client'

import { useEffect, useState } from 'react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [documentId, setDocumentId] = useState<string | null>(null)

    useEffect(() => {
        // Récupérer l'ID du document et le style depuis le body
        const bodyElement = document.body
        const bodyDocumentId = bodyElement.getAttribute('data-demoway-document-id')
        const bodyStyle = bodyElement.getAttribute('style')

        if (bodyDocumentId) {
            setDocumentId(bodyDocumentId)
        }

        // Appliquer l'ID du document et le style au body côté client
        if (bodyDocumentId) {
            bodyElement.setAttribute('data-demoway-document-id', bodyDocumentId)
        }
        if (bodyStyle) {
            bodyElement.setAttribute('style', bodyStyle)
        } else {
            bodyElement.removeAttribute('style')
        }

        // Nettoyage
        return () => {
            bodyElement.removeAttribute('data-demoway-document-id')
            bodyElement.removeAttribute('style')
        }
    }, [])

    return <>{children}</>
}

