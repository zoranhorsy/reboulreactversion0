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
  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold mb-4">Caractéristiques</h2>
      <ul className="list-disc pl-5 space-y-2">
        {specs.map((spec, index) => (
          <li key={index} className="text-sm text-muted-foreground leading-relaxed">
            {spec.description || spec.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
