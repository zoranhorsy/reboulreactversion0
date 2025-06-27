"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ClientInitializer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Footer />
    </>
  );
}
