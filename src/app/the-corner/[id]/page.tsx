"use client";

import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { Suspense } from "react";
import { LoaderComponent } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { TheCornerProductDetails } from "@/components/the-corner/TheCornerProductDetails";
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
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Récupérer le produit
        const productData = await api.getCornerProductById(params.id);
        if (!productData) {
          setError(true);
          return;
        }

        setProduct(productData);

        // Récupérer les produits similaires
        const similarProductsData = await api.fetchCornerProducts({
          category_id: productData.category_id,
          limit: 8,
        });
        setSimilarProducts(similarProductsData.products);
      } catch (err) {
        console.error("Erreur lors du chargement du produit:", err);
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
    return;
  }

  return (
    <ClientPageWrapper>
      <Suspense fallback={<LoaderComponent />}></Suspense>
    </ClientPageWrapper>
  );
}
