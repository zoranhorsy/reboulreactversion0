"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TheCornerProductGalleryProps {
  images: string[];
  productName: string;
  onImageSelect?: (index: number) => void;
  selectedImageIndex?: number;
}

export function TheCornerProductGallery({
  images,
  productName,
  onImageSelect,
  selectedImageIndex = 0,
}: TheCornerProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] =
    useState(selectedImageIndex);

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
    onImageSelect?.(index);
  };

  const mainImage = images[currentImageIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={mainImage}
          alt={productName}
          fill
          className="object-cover transition-all duration-300 hover:scale-105"
          priority
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                currentImageIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600",
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
