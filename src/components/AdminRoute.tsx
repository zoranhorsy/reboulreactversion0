"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[AdminRoute][${timestamp}] ${message}`, data);
  } else {
    console.log(`[AdminRoute][${timestamp}] ${message}`);
  }
};

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  logWithTime("AdminRoute rendu", {
    isLoading,
    isAuthenticated,
    isAdmin,
    hasRedirected,
  });

  // Effet pour la redirection
  useEffect(() => {
    if (hasRedirected || isLoading) {
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      router.push("/");
      setHasRedirected(true);
    }
  }, [hasRedirected, isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    logWithTime("Affichage du chargement");
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    logWithTime("Non authentifié ou non admin - pas de rendu");
    return null;
  }

  logWithTime("Rendu final");
  return <>{children}</>;
}
