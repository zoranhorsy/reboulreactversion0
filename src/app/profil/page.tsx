'use client'




// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from '@/app/config';
import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import { Suspense } from 'react'
import { DynamicUserProfile } from "@/components/dynamic-imports"
import { LazyLoadWrapper } from "@/components/LazyLoadWrapper"
import { LoadingIndicator } from "@/components/LoadingIndicator"

export const viewport: Viewport = defaultViewport;

export default function ProfilePage() {
    return (
    <ClientPageWrapper>
      <LazyLoadWrapper fallback={<LoadingIndicator />}>
            <DynamicUserProfile />
        </LazyLoadWrapper>
    </ClientPageWrapper>
  );}

