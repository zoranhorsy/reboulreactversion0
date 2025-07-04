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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home, ShoppingCart } from "lucide-react";
import type { Viewport } from "next";
import { Suspense } from "react";
import Link from "next/link";

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
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-4">
              Paiement annulé
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Votre paiement a été annulé. Aucun montant n&apos;a été débité de votre compte.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Message d'information */}
            <div className="bg-accent/50 border border-accent rounded-lg p-4">
              <p className="text-sm text-foreground">
                Si vous avez rencontré un problème lors du processus de paiement ou si vous avez des questions, n&apos;hésitez pas à nous contacter. Nous sommes là pour vous aider.
              </p>
            </div>

            {/* Informations de référence */}
            {(orderId || sessionId) && (
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Informations de référence</h3>
                <div className="space-y-1 text-sm">
                  {orderId && (
                    <div>
                      <span className="text-muted-foreground">Référence de commande :</span>
                      <span className="font-mono ml-2 text-foreground">{orderId}</span>
                    </div>
                  )}
                  {sessionId && (
                    <div>
                      <span className="text-muted-foreground">ID de session :</span>
                      <span className="font-mono ml-2 text-foreground">{sessionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                asChild
                className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Link href="/panier">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Retourner au panier
                </Link>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 py-3 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
              <Button
                variant="secondary"
                asChild
                className="flex-1 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
              </Button>
            </div>

            {/* Aide supplémentaire */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Besoin d&apos;aide ?
              </p>
              <Button variant="link" asChild className="text-sm">
                <Link href="/contact">
                  Contactez notre service client
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    // <ClientPageWrapper>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        }
      >
        <CancelPageContent />
      </Suspense>
    // </ClientPageWrapper>
  );
}
