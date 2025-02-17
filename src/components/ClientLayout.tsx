"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Générer un ID unique pour le document basé sur le chemin actuel
    const newDocumentId = `doc-${pathname.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`

    // Appliquer l'ID du document au body
    document.body.setAttribute("data-demoway-document-id", newDocumentId)

    // Supprimer l'attribut style s'il est vide
    if (document.body.getAttribute("style") === "") {
      document.body.removeAttribute("style")
    }

    // Nettoyage
    return () => {
      document.body.removeAttribute("data-demoway-document-id")
    }
  }, [pathname])

  return <>{children}</>
}

