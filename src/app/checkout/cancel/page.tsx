"use client";

// import {
//   ClientPageWrapper,
//   defaultViewport,
// } from "@/components/ClientPageWrapper";
import { useRouter, useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Viewport } from "next";
import { Suspense } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
};

function CancelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Récupérer l'ID de commande, si présent
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex justify-center mb-4">
              <span>⚠️</span>
            </div>
            <h1 className="text-2xl font-bold">
              Paiement annulé
            </h1>
            <p className="text-lg mt-2 text-gray-600">
              Votre paiement a été annulé. Aucun montant n&apos;a été débité de
              votre compte.
            </p>
          </div>

          <div className="mb-6">
            <p className="text-center text-gray-500">
              Si vous avez rencontré un problème lors du processus de paiement
              ou si vous avez des questions, n&apos;hésitez pas à nous
              contacter. Nous sommes là pour vous aider.
            </p>

            {orderId && (
              <div className="bg-gray-100 p-4 rounded-md mt-4">
                <p className="text-sm text-gray-500">
                  Référence de commande
                </p>
                <p className="font-mono">{orderId}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => router.push("/")}
            >
              <span>🛒</span> Retourner au panier
            </button>
            <button
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => router.back()}
            >
              <span>←</span> Retour
            </button>
            <button
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-50 rounded"
              onClick={() => router.push("/")}
            >
              <span>🏠</span> Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    // <ClientPageWrapper>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement...</p>
            </div>
          </div>
        }
      >
        <CancelPageContent />
      </Suspense>
    // </ClientPageWrapper>
  );
}
