"use client";

// Importer la configuration globale pour forcer le rendu dynamique
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import confetti from "canvas-confetti";
import config from "@/config";
import { useToast } from "@/components/ui/use-toast";

export const viewport: Viewport = defaultViewport;

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    status: string;
    total?: number;
  } | null>(null);

  // Récupérer les paramètres de l'URL
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Lance le confetti à l'arrivée sur la page
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token non trouvé");
        }

        // Récupérer les détails de la session depuis l'API
        const response = await fetch(
          `${config.urls.api}/checkout/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des détails de la commande",
          );
        }

        const data = await response.json();
        console.log("Détails de la session:", data);

        setOrderDetails({
          orderNumber: data.order.order_number,
          status: data.session.payment_status,
          total: data.session.amount_total,
        });

        // Vider le panier (si ce n'est pas déjà fait via localStorage)
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails de votre commande.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, toast]);

  // Si ni session ID ni localStorage, rediriger vers l'accueil
  useEffect(() => {
    if (!isLoading && !sessionId && !localStorage.getItem("lastOrder")) {
      router.push("/");
    }
  }, [isLoading, sessionId, router]);

  if (isLoading) {
    return (
      <ClientPageWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <span>⏳</span>
            <p>Chargement des détails de votre commande...</p>
          </div>
        </div>
      </ClientPageWrapper>
    );
  }

  return (
    <ClientPageWrapper>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <span>✅</span>
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl">
                Commande confirmée !
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Merci pour votre commande. Nous vous enverrons un email de
                confirmation avec les détails.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 text-muted-foreground"
              >
                <span>📧</span>
                <p>Un email de confirmation a été envoyé à votre adresse.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 text-muted-foreground"
              >
                <span>🛍️</span>
                <p>
                  Vous pouvez suivre votre commande dans votre espace client.
                </p>
              </motion.div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Numéro de commande
                </p>
                <p className="font-mono text-lg">
                  {orderDetails?.orderNumber ||
                  localStorage.getItem("lastOrder")
                    ? JSON.parse(localStorage.getItem("lastOrder") || "{}")
                        .orderNumber
                    : "#ORDER-" +
                      Math.random().toString(36).substring(7).toUpperCase()}
                </p>
              </div>

              {orderDetails?.total && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="font-mono text-lg">
                    {orderDetails.total.toFixed(2)} €
                  </p>
                </div>
              )}

              <p className="text-muted-foreground">
                Votre commande a été confirmée. Vous recevrez un email dès
                qu&apos;elle sera expédiée.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full sm:w-auto"
                onClick={() => router.push("/profil")}
              >
                <span>🛍️</span>
                Voir mes commandes
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/")}
              >
                <span>🏠</span>
                Retour à l&apos;accueil
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </ClientPageWrapper>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <ClientPageWrapper>
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <span>⏳</span>
              <p>Chargement...</p>
            </div>
          </div>
        </ClientPageWrapper>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
