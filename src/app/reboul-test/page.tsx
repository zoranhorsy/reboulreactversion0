"use client"

import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper';
import type { Viewport } from 'next';
import { useState } from "react"
import { ReboulPageHeader } from "@/components/reboul/components/ReboulPageHeader"
import { Heart, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

export const viewport: Viewport = defaultViewport;

export default function ReboulTestPage() {
  const [isWishlist, setIsWishlist] = useState(false)

  const handleShare = () => {
    console.log("Partage du produit")
  }

  const toggleWishlist = () => {
    setIsWishlist(!isWishlist)
  }

  return (
    <ClientPageWrapper>
      <div className="min-h-screen bg-background">
        <div className="space-y-8 p-8">
          <h1 className="text-2xl font-bold">Test des composants Reboul</h1>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">ReboulPageHeader - Version Catalogue</h2>
            <ReboulPageHeader 
              title="REBOUL STORE"
              subtitle="Collection exclusive de vêtements premium"
              backLink="/"
              backText="Retour à l'accueil"
              breadcrumbs={[
                { label: "Accueil", href: "/" },
                { label: "Catalogue", href: "/catalogue" }
              ]}
              actions={[]}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">ReboulPageHeader - Version Produit</h2>
            <ReboulPageHeader 
              title="T-Shirt Oversized"
              subtitle="Collection Printemps/Été 2024"
              backLink="/catalogue"
              backText="Retour au catalogue"
              breadcrumbs={[
                { label: "Accueil", href: "/" },
                { label: "Catalogue", href: "/catalogue" },
                { label: "T-Shirt Oversized", href: "/produit/1" }
              ]}
              actions={[
                {
                  icon: <Heart className={cn(
                    "w-5 h-5",
                    isWishlist ? "fill-rose-500 text-rose-500" : "text-zinc-100"
                  )} />,
                  onClick: toggleWishlist,
                  label: "Favoris"
                },
                {
                  icon: <Share2 className="w-5 h-5 text-zinc-100" />,
                  onClick: handleShare,
                  label: "Partager"
                }
              ]}
            />
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
} 