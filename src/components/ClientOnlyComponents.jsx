"use client";

import { useEffect, useState } from "react";
import DynamicBodyAttributes from "@/components/DynamicBodyAttributes";
import GsapInitializer from "@/components/GsapInitializer";

export default function ClientOnlyComponents() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <GsapInitializer />
    </>
  );
}
