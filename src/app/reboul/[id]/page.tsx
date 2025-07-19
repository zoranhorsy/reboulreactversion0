"use client";

import { useParams } from "next/navigation";
import ProductPageShared from "@/components/ProductPageShared";
import { ClientPageWrapper, defaultViewport } from "@/components/ClientPageWrapper";
import { Viewport } from "next";

export const viewport: Viewport = defaultViewport;

export default function ReboulProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ClientPageWrapper>
      <ProductPageShared
        productId={productId}
        storeType="adult"
        title="Reboul Adult"
        subtitle="Collection premium pour adultes"
        backLink="/reboul"
        backText="Retour à la collection"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Reboul Adult", href: "/reboul" },
        ]}
      />
    </ClientPageWrapper>
  );
} 