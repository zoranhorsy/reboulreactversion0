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
        setError(false);
        
        // Récupérer le produit
        const productData = await api.getCornerProductById(params.id);
        if (!productData) {
          console.error(`Produit The Corner avec ID ${params.id} non trouvé`);
          setError(true);
          return;
        }

        console.log("Produit The Corner chargé:", productData);
        setProduct(productData);

        // Récupérer les produits similaires
        try {
          const similarProductsData = await api.fetchCornerProducts({
            category_id: productData.category_id,
            limit: 8,
          });
          setSimilarProducts(similarProductsData.products || []);
        } catch (similarError) {
          console.warn("Erreur lors du chargement des produits similaires:", similarError);
          setSimilarProducts([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du produit:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 🚨 FIX: Gérer correctement l'état d'erreur
  if (error) {
    console.log("Redirection vers 404 pour le produit:", params.id);
    notFound();
  }

  // 🚨 FIX: Retourner un loader au lieu de undefined
  if (isLoading) {
    return (
      <ClientPageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <LoaderComponent />
        </div>
      </ClientPageWrapper>
    );
  }

  // 🚨 FIX: Vérifier que le produit existe avant de rendre
  if (!product) {
    console.log("Produit non trouvé après chargement:", params.id);
    notFound();
  }

  return (
    <ClientPageWrapper>
      <Suspense fallback={<LoaderComponent />}>
        <TheCornerProductDetails 
          product={product} 
          similarProducts={similarProducts}
        />
      </Suspense>
    </ClientPageWrapper>
  );
}
