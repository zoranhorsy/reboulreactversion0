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
import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { toast } from "@/components/ui/use-toast";

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
  const { addItem } = useCart();

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    if (!selectedSize || !selectedColor) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez sélectionner une taille et une couleur.",
        variant: "destructive",
      });
      return;
    }

    const selectedVariant = product.variants?.find(
      (v: any) => v.size === selectedSize && v.color === selectedColor,
    );

    if (!selectedVariant) {
      toast({
        title: "Erreur",
        description: "Cette variante n'est pas disponible",
        variant: "destructive",
      });
      return;
    }

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    addItem({
      id: cartItemId,
      productId: product.id.toString(),
      name: `${product.name} - ${selectedColor} - ${selectedSize}`,
      price: product.price,
      quantity: quantity,
      image: product.image_url || product.images?.[0] || "/placeholder.svg",
      storeType: 'the_corner',
      variant: {
        size: selectedSize,
        color: selectedColor,
        colorLabel: selectedColor,
        stock: selectedVariant.stock,
      },
    });

    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} - ${selectedColor} - ${selectedSize}`,
    });
  }, [product, selectedSize, selectedColor, quantity, addItem]);

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
        onAddToCart={handleAddToCart}
        onToggleWishlist={() => setIsWishlist((v) => !v)}
        onShare={() => {}}
        isWishlist={isWishlist}
      />
    </ClientPageWrapper>
  );
}
