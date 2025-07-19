"use client";

import { useParams } from "next/navigation";
import ProductPageShared from "@/components/ProductPageShared";
import { ClientPageWrapper, defaultViewport } from "@/components/ClientPageWrapper";
import { Viewport } from "next";

export const viewport: Viewport = defaultViewport;

export default function SneakersProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <ClientPageWrapper>
      <ProductPageShared
        productId={productId}
        storeType="sneakers"
        title="Sneakers"
        subtitle="Collection urbaine et street style"
        backLink="/sneakers"
        backText="Retour aux sneakers"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Sneakers", href: "/sneakers" },
        ]}
      />
    </ClientPageWrapper>
  );
} 