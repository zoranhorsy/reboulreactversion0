"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export interface TechnicalSpec {
  code: string;
  title: string;
  value: string;
  description?: string;
}

interface ProductTechnicalSpecsProps {
  specs: TechnicalSpec[];
}

export function ProductTechnicalSpecs({ specs }: ProductTechnicalSpecsProps) {
  const [selectedSpec, setSelectedSpec] = useState<TechnicalSpec | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {specs.map((spec, index) => (
          <Button
            key={`${spec.code}-${index}`}
            variant="outline"
            className="relative h-auto p-3 sm:p-4 hover:border-primary/50 hover:bg-accent/5 transition-colors text-left group touch-manipulation"
            onClick={() => setSelectedSpec(spec)}
          >
            <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col items-start gap-1.5 sm:gap-2 text-left pr-5">
              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {spec.code}
              </div>
              <div className="font-medium text-xs sm:text-sm leading-tight">
                {spec.title}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-tight">
                {spec.value}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Dialog pour les détails des spécifications */}
      <Dialog open={!!selectedSpec} onOpenChange={() => setSelectedSpec(null)}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                {selectedSpec?.code}
              </span>
              {selectedSpec?.title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {selectedSpec?.description || selectedSpec?.value}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
