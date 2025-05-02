"use client"

import { ImageIcon } from "lucide-react"

interface ProductImageFallbackProps {
  className?: string
}

export function ProductImageFallback({ className = "" }: ProductImageFallbackProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-secondary/20 ${className}`}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
        <ImageIcon className="w-8 h-8" />
        <span className="text-xs font-medium">Image non disponible</span>
      </div>
    </div>
  )
} 