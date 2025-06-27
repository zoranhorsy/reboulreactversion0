"use client";

import { useEffect, useState } from "react";

// Créer un hook personnalisé pour l'hydratation
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);

  // useEffect est plus sûr pour l'hydratation dans Next.js
  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};

export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasMounted = useHasMounted();

  // Retourner un fallback jusqu'à ce que le montage soit confirmé
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
