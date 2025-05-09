"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { ShoppingCart, Heart, Share, Loader2 } from 'lucide-react'

/**
 * Exemple d'utilisation du ButtonGroup migré
 * Version migrée depuis Chakra UI vers notre implémentation Tailwind CSS
 */
export function ButtonGroupExample() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Espacement standard</h2>
        <ButtonGroup spacing={4}>
          <Button variant="default">Bouton 1</Button>
          <Button variant="default">Bouton 2</Button>
          <Button variant="default">Bouton 3</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Espacement personnalisé</h2>
        <ButtonGroup spacing={2}>
          <Button variant="outline">Petit</Button>
          <Button variant="outline">Espacement</Button>
          <Button variant="outline">Entre</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Direction colonne</h2>
        <ButtonGroup direction="column" spacing={2}>
          <Button variant="default">Premier</Button>
          <Button variant="default">Deuxième</Button>
          <Button variant="default">Troisième</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Boutons attachés</h2>
        <ButtonGroup isAttached>
          <Button variant="default">Précédent</Button>
          <Button variant="default">Actuel</Button>
          <Button variant="default">Suivant</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Variante partagée</h2>
        <ButtonGroup variant="outline">
          <Button>Partage</Button>
          <Button>la</Button>
          <Button>variante</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Avec icônes</h2>
        <ButtonGroup spacing={4}>
          <Button variant="default" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Ajouter au panier
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Heart size={16} />
            Favoris
          </Button>
          <Button variant="ghost" className="flex items-center gap-2">
            <Share size={16} />
            Partager
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonGroup - Avec IconButton</h2>
        <ButtonGroup spacing={2}>
          <Button variant="default" size="icon" aria-label="Ajouter au panier">
            <ShoppingCart size={16} />
          </Button>
          <Button variant="outline" size="icon" aria-label="Ajouter aux favoris">
            <Heart size={16} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Partager">
            <Share size={16} />
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Comparaison avec l&apos;exemple Chakra UI</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">Avant (Chakra UI)</h3>
          <pre className="bg-white dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm">
{`<ButtonGroup spacing={4} mt={4}>
  <Button colorScheme="blue">Ajouter au panier</Button>
  <Button colorScheme="red" variant="solid">Supprimer</Button>
  <Button colorScheme="green" variant="outline">Sauvegarder</Button>
</ButtonGroup>`}
          </pre>
          
          <h3 className="text-lg font-medium mb-2 mt-4">Après (Radix UI + Tailwind)</h3>
          <pre className="bg-white dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm">
{`<ButtonGroup spacing={4} className="mt-4">
  <Button variant="default">Ajouter au panier</Button>
  <Button variant="destructive">Supprimer</Button>
  <Button variant="outline">Sauvegarder</Button>
</ButtonGroup>`}
          </pre>
        </div>
      </div>
    </div>
  )
} 