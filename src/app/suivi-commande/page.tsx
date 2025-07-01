"use client";

// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from "@/app/config";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { UserOrders } from "@/components/UserOrders";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const viewport: Viewport = defaultViewport;

export default function TrackOrder() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ClientPageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ClientPageWrapper>
    );
  }

  if (!user) {
    return (
      <ClientPageWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Mes Commandes</h1>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté pour voir vos commandes.
            </p>
            <Button asChild>
              <Link href="/connexion">Se connecter</Link>
            </Button>
          </div>
        </div>
      </ClientPageWrapper>
    );
  }

  return (
    <ClientPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Mes Commandes</h1>
            <Button variant="outline" asChild>
              <Link href="/catalogue">Continuer mes achats</Link>
            </Button>
          </div>
          <UserOrders />
        </div>
      </div>
    </ClientPageWrapper>
  );
}
