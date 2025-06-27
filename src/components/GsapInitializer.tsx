"use client";

import { useEffect } from "react";
import { initGSAP } from "@/lib/gsap-config";

export default function GsapInitializer() {
  useEffect(() => {
    // Initialiser GSAP côté client uniquement
    if (typeof window !== "undefined") {
      initGSAP().catch(console.error);
    }
  }, []);

  // Ce composant ne rend rien, il initialise juste GSAP
  return null;
}
