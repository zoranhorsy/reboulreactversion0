"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Share, Loader2 } from 'lucide-react'

/**
 * EXEMPLE - Composant utilisant des boutons Radix UI + Tailwind CSS
 * Version migrée du composant ChakraButtonExample
 */
export function RadixButtonExample() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Exemples de Boutons Radix UI + Tailwind</h2>
      
      {/* Boutons simples */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Boutons standards</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="default">Ajouter au panier</Button>
          <Button variant="destructive">Supprimer</Button>
          <Button variant="outline">Sauvegarder</Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="link">En savoir plus</Button>
        </div>
      </div>
      
      {/* Boutons de tailles différentes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Tailles différentes</h3>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Note: Radix UI button n'a pas de taille xs par défaut, on peut créer custom */}
          <Button variant="default" size="sm">Petit</Button>
          <Button variant="default" size="default">Moyen</Button>
          <Button variant="default" size="lg">Grand</Button>
          <Button variant="default" className="h-8 text-xs px-2 rounded-md">Très petit (custom)</Button>
        </div>
      </div>
      
      {/* Boutons avec icônes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Boutons avec icônes</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="default" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Ajouter au panier
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            Favoris
            <Heart size={16} />
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            <Share size={16} />
            Partager
          </Button>
        </div>
      </div>
      
      {/* Boutons icônes */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Boutons icônes</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="default" size="icon" aria-label="Ajouter au panier">
            <ShoppingCart size={16} />
          </Button>
          <Button variant="outline" size="icon" aria-label="Ajouter aux favoris">
            <Heart size={16} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Partager">
            <Share size={16} />
          </Button>
        </div>
      </div>
      
      {/* Boutons avec états */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">États</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button variant="default" disabled className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Chargement
          </Button>
          <Button variant="default" disabled>
            Désactivé
          </Button>
        </div>
      </div>
      
      {/* Boutons avec largeur personnalisée */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Largeur personnalisée</h3>
        <Button variant="default" className="w-full mt-4">
          Bouton pleine largeur
        </Button>
      </div>
    </div>
  )
} 