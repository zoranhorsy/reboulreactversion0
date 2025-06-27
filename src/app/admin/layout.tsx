"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// Fonction pour logger avec timestamp
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[AdminLayout][${timestamp}] ${message}`, data);
  } else {
    console.log(`[AdminLayout][${timestamp}] ${message}`);
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  logWithTime("AdminLayout rendu", {
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px] shadow-none border-none bg-transparent">
          <CardContent>
            <span>⏳</span>
            <CardDescription>
              Chargement de l&apos;interface d&apos;administration...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    logWithTime("Non authentifié ou non admin - affichage du message d'erreur");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px] shadow-none border-none bg-transparent">
          <CardContent>
            <CardDescription>
              Vous n&apos;avez pas les permissions nécessaires pour accéder à
              l&apos;interface d&apos;administration.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  logWithTime("Rendu du contenu admin");
  return children;
}
