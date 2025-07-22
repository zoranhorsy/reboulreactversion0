"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index: number;
  onHover?: (isHovered: boolean) => void;
}

const TheCornerProductCard = React.memo(
  ({ product, index, onHover }: ProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = useMemo(() => {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(product.price);
    }, [product.price]);

    const uniqueSizes = useMemo(() => {
      return Array.from(new Set(product.variants?.map((v) => v.size) || []));
    }, [product.variants]);

    const getTruncatedSizes = () => {
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        return { max: 3 };
      }
      return { max: 5 };
    };

    const { max } = getTruncatedSizes();
    const displayedSizes = uniqueSizes.slice(0, max);
    const remaining = uniqueSizes.length - max;

    const handleMouseEnter = React.useCallback(() => {
      setIsHovered(true);
      onHover?.(true);
    }, [onHover]);

    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false);
      onHover?.(false);
    }, [onHover]);

    const imageUrl = useMemo(() => {
      if (typeof product.image_url === "string") return product.image_url;
      if (typeof product.image === "string") return product.image;
      if (Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === "string") return firstImage;
        if (typeof firstImage === "object" && "url" in firstImage)
          return firstImage.url;
      }
      return "/placeholder.png";
    }, [product.image_url, product.image, product.images]);

    return (
      <div
        className={cn(
          "group relative bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 ease-out transform hover:shadow-lg dark:hover:shadow-zinc-800/30",
          isHovered && "scale-[1.02] z-10",
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transitionDelay: `${index * 50}ms`,
        }}
      >
        <Link href={`/the-corner/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover w-full h-full transition-transform duration-500 ease-out",
                isHovered && "scale-110",
              )}
              priority={index < 4}
            />
            {product.new && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Nouveau
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1 truncate">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {formatPrice}
              </p>
              {uniqueSizes.length > 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-full overflow-hidden whitespace-nowrap">
                  {displayedSizes.join(", ")}
                  {remaining > 0 && <span> +{remaining}</span>}
                </p>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  },
);

TheCornerProductCard.displayName = "TheCornerProductCard";

export default TheCornerProductCard; 