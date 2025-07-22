"use client";

import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { Suspense } from "react";
import { LoaderComponent } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { ProductDetails } from "@/components/ProductDetailsCP";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface TheCornerProductPageProps {
  params: {
    id: string;
  };
}

export const viewport: Viewport = defaultViewport;

export default function TheCornerProductPage({
  params,
}: TheCornerProductPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const productData = await api.getCornerProductById(params.id);
        if (!productData) {
          setError(true);
          return;
        }
        setProduct(productData);
        // Initialiser la couleur et la taille par défaut si dispo
        if (productData.variants && productData.variants.length > 0) {
          const colors = Array.from(new Set(productData.variants.map((v: any) => v.color).filter(Boolean)));
          const sizes = Array.from(new Set(productData.variants.map((v: any) => v.size).filter(Boolean)));
          if (colors.length > 0) setSelectedColor(colors[0]);
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (error) {
    notFound();
  }
  if (isLoading) {
    return (
      <ClientPageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <LoaderComponent />
        </div>
      </ClientPageWrapper>
    );
  }
  if (!product) {
    notFound();
  }

  return (
    <ClientPageWrapper>
      <ProductDetails
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        onSizeChange={setSelectedSize}
        onColorChange={setSelectedColor}
        onQuantityChange={setQuantity}
        onAddToCart={() => {}}
        onToggleWishlist={() => setIsWishlist((v) => !v)}
        onShare={() => {}}
        isWishlist={isWishlist}
      />
    </ClientPageWrapper>
  );
}
