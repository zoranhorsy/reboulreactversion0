'use client'

import React, { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWindowSize } from '@/hooks/useWindowSize';
import { ProductCard } from './MemoizedComponents';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/api';

interface VirtualProductListProps {
  products: Product[];
  className?: string;
  onProductClick?: (product: Product) => void;
}

const CARD_SIZE = 300; // Hauteur approximative de chaque carte produit

export function VirtualProductList({
  products,
  className,
  onProductClick
}: VirtualProductListProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  
  // Calcul du nombre d'éléments par ligne en fonction de la largeur de l'écran
  const getItemsPerRow = () => {
    if (width < 640) return 1; // Mobile
    if (width < 768) return 2; // Tablet
    if (width < 1024) return 3; // Small desktop
    if (width < 1280) return 4; // Medium desktop
    return 5; // Large desktop
  };
  
  const itemsPerRow = getItemsPerRow();
  
  // Nombre de lignes total
  const rowCount = Math.ceil(products.length / itemsPerRow);
  
  // Création du virtualiseur pour les lignes de produits
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_SIZE,
    overscan: 5, // Nombre de lignes supplémentaires à rendre en dehors de la vue
  });
  
  const items = virtualizer.getVirtualItems();
  
  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto h-[500px] w-full", className)}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        className="w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const rowStartIndex = virtualRow.index * itemsPerRow;
          const rowEndIndex = Math.min(rowStartIndex + itemsPerRow, products.length);
          const rowProducts = products.slice(rowStartIndex, rowEndIndex);
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                {rowProducts.map((product) => (
                  <div
                    key={product.id}
                    className="transition-all hover:scale-[1.02]"
                    onClick={() => onProductClick?.(product)}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 