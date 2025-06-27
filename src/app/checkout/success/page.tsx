"use client";

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
        // Récupérer les détails de la session depuis l'API
        const response = await fetch(`/api/checkout/session?id=${sessionId}`);

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des détails de la session",
          );
        }

        const data = await response.json();
        console.log("Détails de la session:", data);

        // Sauvegarder l'email utilisé dans Stripe pour l'associer au compte utilisateur actuel
        if (data.customer_email) {
          try {
            console.log(`Email utilisé dans Stripe: ${data.customer_email}`);

            // Récupérer les emails existants ou créer un nouveau tableau
            const existingEmails = localStorage.getItem("stripe_user_emails");
            let emails = [];

            if (existingEmails) {
              try {
                emails = JSON.parse(existingEmails);
                if (!Array.isArray(emails)) emails = [];
              } catch (e) {
                console.error("Erreur lors du parsing des emails existants", e);
                emails = [];
              }
            }

            // Ajouter le nouvel email s'il n'existe pas déjà
            if (!emails.includes(data.customer_email)) {
              emails.push(data.customer_email);
              localStorage.setItem(
                "stripe_user_emails",
                JSON.stringify(emails),
              );
              console.log(
                `Email ${data.customer_email} ajouté aux emails associés pour les commandes`,
              );

              // Tentative d'associer directement l'email au compte
              try {
                // Stocker aussi l'email actuel comme principal pour l'API
                localStorage.setItem(
                  "current_stripe_email",
                  data.customer_email,
                );

                // Notifier l'utilisateur
                toast({
                  title: "Information",
                  description: `L'email ${data.customer_email} a été associé à votre compte pour retrouver vos commandes.`,
                });
              } catch (userError) {
                console.error(
                  "Erreur lors de l'association de l'email",
                  userError,
                );
              }
            }
          } catch (storageError) {
            console.error(
              "Erreur lors de la sauvegarde de l'email",
              storageError,
            );
          }
        }

        setOrderDetails({
          orderNumber: `REBOUL-${Math.floor(Math.random() * 1000000)}`,
          status: data.payment_status || "paid",
          total: data.amount_total,
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
                Merci pour votre achat. Nous vous enverrons un email de
                confirmation avec les détails.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
                    `REBOUL-${Math.floor(Math.random() * 1000000)}`}
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

            <CardFooter className="flex flex-col sm:flex-row gap-3">
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
                <span>&quot;Home&quot;</span>
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
