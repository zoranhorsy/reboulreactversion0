"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface TechnicalSpec {
  code: string
  title: string
  value: string
  description?: string
}

interface ProductTechnicalSpecsProps {
  specs: TechnicalSpec[]
}

export function ProductTechnicalSpecs({ specs }: ProductTechnicalSpecsProps) {
  const [selectedSpec, setSelectedSpec] = useState<TechnicalSpec | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {specs.map((spec) => (
          <Button
            key={spec.code}
            variant="outline"
            className="relative h-auto p-4 hover:border-primary/50 hover:bg-accent/5 transition-colors"
            onClick={() => setSelectedSpec(spec)}
          >
            <div className="absolute top-2 right-2">
              <Info className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <div className="flex flex-col items-start gap-2 text-left">
              <div className="text-xs font-medium text-muted-foreground">
                {spec.code}
              </div>
              <div className="font-medium">{spec.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {spec.value}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedSpec} onOpenChange={() => setSelectedSpec(null)}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            {/* En-tête */}
            <div className="space-y-1.5">
              <div className="inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                {selectedSpec?.code}
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {selectedSpec?.title}
              </h2>
            </div>

            {/* Valeur */}
            <p className="text-base">
              {selectedSpec?.value}
            </p>

            {/* Description */}
            {selectedSpec?.description && (
              <div className="flex gap-2 text-sm text-muted-foreground bg-accent/5 p-3 rounded-md">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{selectedSpec.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 