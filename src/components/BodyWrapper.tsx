"use client"

import type React from "react"
import { useEffect } from "react"

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Générer un ID unique pour le document
    const documentId = `doc-${Math.random().toString(36).substr(2, 9)}`

    // Appliquer l'ID du document au body
    document.body.setAttribute("data-demoway-document-id", documentId)

    // Supprimer l'attribut style s'il est vide
    if (document.body.getAttribute("style") === "") {
      document.body.removeAttribute("style")
    }

    // Nettoyage
    return () => {
      document.body.removeAttribute("data-demoway-document-id")
    }
  }, [])

  return <>{children}</>
}

