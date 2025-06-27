"use client";

import { gsap } from "gsap";

let ScrollTrigger: any = null;

export const initGSAP = async () => {
  try {
    // Import dynamique de ScrollTrigger pour éviter les erreurs SSR
    if (typeof window !== "undefined" && !ScrollTrigger) {
      const { ScrollTrigger: ST } = await import("gsap/ScrollTrigger");
      ScrollTrigger = ST;
      gsap.registerPlugin(ScrollTrigger);
    }

    return { gsap, ScrollTrigger };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de GSAP:", error);
    return { gsap, ScrollTrigger: null };
  }
};
