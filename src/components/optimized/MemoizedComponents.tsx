import React from "react";
import { ProductCard as OriginalProductCard } from "../ProductCard";
import { SizeSelector as OriginalSizeSelector } from "../SizeSelector";
import { ColorSelector as OriginalColorSelector } from "../ColorSelector";

// Version mémoïsée de ProductCard
export const ProductCard = React.memo(OriginalProductCard);

// Version mémoïsée de SizeSelector
export const SizeSelector = React.memo(OriginalSizeSelector);

// Version mémoïsée de ColorSelector
export const ColorSelector = React.memo(OriginalColorSelector);

// Utilité de la mémoïsation pour chaque composant :
/**
 * ProductCard - Mémoïsé car affiché en liste et ne change pas souvent
 * SizeSelector - Mémoïsé car les options de tailles sont généralement statiques
 * ColorSelector - Mémoïsé car les options de couleurs sont généralement statiques
 */
