"use client";

import React from "react";

/**
 * EXEMPLE - Composant utilisant Tailwind CSS
 * Version migrée du composant ChakraBoxExample
 */
export function TailwindBoxExample() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        Exemples de Conteneurs Tailwind CSS
      </h2>

      {/* Box simple (div avec classes Tailwind) */}
      <div className="p-5 shadow-md border border-gray-200 rounded-md bg-white mb-6">
        <h3 className="text-lg font-semibold mb-4">Box simple</h3>
        <p>
          Un composant Box basique avec padding, ombre, bordure et rayon de
          bordure.
        </p>
      </div>

      {/* Container */}
      <div className="container max-w-3xl mx-auto flex flex-col items-center mb-6">
        <div className="p-5 shadow-md border border-gray-200 rounded-md bg-gray-50 w-full">
          <h3 className="text-lg font-semibold mb-4">Container centré</h3>
          <p>Un conteneur avec une largeur maximale, centré horizontalement.</p>
        </div>
      </div>

      {/* Flex */}
      <div className="flex justify-between items-center p-4 mb-6 bg-blue-50 rounded-md">
        <div className="p-2 bg-blue-200 rounded-md">Élément 1</div>
        <div className="p-2 bg-blue-300 rounded-md">Élément 2</div>
        <div className="p-2 bg-blue-400 rounded-md">Élément 3</div>
      </div>

      {/* VStack (Flex column) */}
      <div className="flex flex-col gap-4 p-4 mb-6 bg-green-50 rounded-md">
        <div className="p-2 bg-green-200 rounded-md">Élément vertical 1</div>
        <div className="p-2 bg-green-300 rounded-md">Élément vertical 2</div>
        <div className="p-2 bg-green-400 rounded-md">Élément vertical 3</div>
      </div>

      {/* HStack (Flex row) */}
      <div className="flex flex-row gap-4 p-4 mb-6 bg-purple-50 rounded-md">
        <div className="p-2 bg-purple-200 rounded-md">Élément horizontal 1</div>
        <div className="p-2 bg-purple-300 rounded-md">Élément horizontal 2</div>
        <div className="p-2 bg-purple-400 rounded-md">Élément horizontal 3</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-6 p-4 mb-6 bg-orange-50 rounded-md">
        <div className="p-2 bg-orange-200 rounded-md">Cellule 1</div>
        <div className="p-2 bg-orange-300 rounded-md">Cellule 2</div>
        <div className="p-2 bg-orange-400 rounded-md">Cellule 3</div>
        <div className="p-2 bg-orange-500 rounded-md">Cellule 4</div>
        <div className="p-2 bg-orange-600 rounded-md text-white">Cellule 5</div>
        <div className="p-2 bg-orange-700 rounded-md text-white">Cellule 6</div>
      </div>

      {/* Box avec styles responsifs */}
      <div className="p-5 bg-red-50 md:bg-blue-50 lg:bg-green-50 text-red-500 md:text-blue-500 lg:text-green-500 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Box avec styles responsifs
        </h3>
        <p>Ce Box change de couleur selon la taille de l&apos;écran.</p>
      </div>

      {/* Box avec pseudo-classes */}
      <div className="p-5 bg-gray-100 rounded-md hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 cursor-pointer">
        <h3 className="text-lg font-semibold mb-4">Box avec pseudo-classes</h3>
        <p>Survolez ce box pour voir la couleur changer.</p>
      </div>
    </div>
  );
}
