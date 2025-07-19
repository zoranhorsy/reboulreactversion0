"use client";

import { useParams } from "next/navigation";
import ProductPageShared from "@/components/ProductPageShared";
import { ClientPageWrapper, defaultViewport } from "@/components/ClientPageWrapper";
import { Viewport } from "next";

export const viewport: Viewport = defaultViewport;

export default function KidsProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ClientPageWrapper>
      <ProductPageShared
        productId={productId}
        storeType="kids"
        title="Kids"
        subtitle="Collection mode pour enfants"
        backLink="/kids"
        backText="Retour aux enfants"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Kids", href: "/kids" },
        ]}
      />
    </ClientPageWrapper>
  );
} 