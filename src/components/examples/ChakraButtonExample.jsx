"use client";

import React from "react";
import { Button, ButtonGroup, IconButton } from "@chakra-ui/react";
/**
 * EXEMPLE - Composant utilisant des boutons Chakra UI
 * Ce fichier sert d'exemple pour la migration vers Radix UI + Tailwind CSS
 */
export function ChakraButtonExample() {
  return (
    <div>
      <h2>Exemples de Boutons Chakra UI</h2>

      {/* Boutons simples */}
      <div className="mb-6">
        <h3>Boutons standards</h3>
        <ButtonGroup>
          <Button colorScheme="blue">Ajouter au panier</Button>
          <Button colorScheme="red" variant="solid">
            Supprimer
          </Button>
          <Button colorScheme="green" variant="outline">
            Sauvegarder
          </Button>
          <Button colorScheme="gray" variant="ghost">
            Annuler
          </Button>
          <Button colorScheme="purple" variant="link">
            En savoir plus
          </Button>
        </ButtonGroup>
      </div>

      {/* Boutons de tailles différentes */}
      <div className="mb-6">
        <h3>Tailles différentes</h3>
        <ButtonGroup>
          <Button colorScheme="blue" size="xs">
            Très petit
          </Button>
          <Button colorScheme="blue" size="sm">
            Petit
          </Button>
          <Button colorScheme="blue" size="md">
            Moyen
          </Button>
          <Button colorScheme="blue" size="lg">
            Grand
          </Button>
        </ButtonGroup>
      </div>

      {/* Boutons avec icônes */}
      <div className="mb-6">
        <h3>Boutons avec icônes</h3>
        <ButtonGroup>
          <Button leftIcon={<span>🛒</span>} colorScheme="blue">
            Ajouter au panier
          </Button>
          <Button
            rightIcon={<span>♥</span>}
            colorScheme="red"
            variant="outline"
          >
            Favoris
          </Button>
          <Button
            leftIcon={<span>Share</span>}
            colorScheme="green"
            variant="ghost"
          >
            Partager
          </Button>
        </ButtonGroup>
      </div>

      {/* Boutons icônes */}
      <div className="mb-6">
        <h3>Boutons icônes</h3>
        <ButtonGroup>
          <IconButton
            aria-label="Panier"
            icon={<span>🛒</span>}
            colorScheme="blue"
          />
          <IconButton
            aria-label="Favoris"
            icon={<span>♥</span>}
            colorScheme="red"
            variant="outline"
          />
          <IconButton
            aria-label="Partager"
            icon={<span>Share</span>}
            colorScheme="green"
            variant="ghost"
          />
        </ButtonGroup>
      </div>

      {/* Boutons avec états */}
      <div className="mb-6">
        <h3>États</h3>
        <ButtonGroup>
          <Button colorScheme="blue" isLoading loadingText="Chargement...">
            Chargement
          </Button>
          <Button colorScheme="blue" isDisabled>
            Désactivé
          </Button>
        </ButtonGroup>
      </div>

      {/* Boutons avec largeur personnalisée */}
      <div className="mb-6">
        <h3>Largeur personnalisée</h3>
        <Button colorScheme="blue" width="full" mt={4}>
          Bouton pleine largeur
        </Button>
      </div>
    </div>
  );
}
