"use client";

// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic as dynamicConfig, revalidate, fetchCache } from "@/app/config";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { Suspense } from "react";
import { DynamicFavoritesList } from "@/components/dynamic-imports";
import { LazyLoadWrapper } from "@/components/LazyLoadWrapper";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export const viewport: Viewport = defaultViewport;

export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return (
    <ClientPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mes Favoris</h1>
        <Suspense fallback={<LoadingIndicator />}>
          <LazyLoadWrapper>
            <DynamicFavoritesList />
          </LazyLoadWrapper>
        </Suspense>
      </div>
    </ClientPageWrapper>
  );
}
