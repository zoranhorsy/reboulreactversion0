"use client";

// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from "@/app/config";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "processing" | "shipped" | "delivered";

const orderStatuses: Record<
  OrderStatus,
  { icon: React.ReactNode; text: string }
> = {
  processing: {
    icon: <span>📦</span>,
    text: "Commande en cours de traitement",
  },
  shipped: { icon: <span>🚚</span>, text: "Commande expédiée" },
  delivered: { icon: <span>✅</span>, text: "Commande livrée" },
};

export const viewport: Viewport = defaultViewport;

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler une requête API pour obtenir le statut de la commande
    const statuses: OrderStatus[] = ["processing", "shipped", "delivered"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setOrderStatus(randomStatus);
  };

  return (
    <ClientPageWrapper>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Suivi de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Entrez votre numéro de commande"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
                <Button type="submit">Suivre</Button>
              </div>
            </form>

            {orderStatus && (
              <div className="mt-8 space-y-6">
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    État de votre commande :
                  </h3>
                  <div className="flex items-center space-x-2 text-green-600">
                    {orderStatuses[orderStatus].icon}
                    <span>{orderStatuses[orderStatus].text}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Étapes de livraison :</h3>
                  <ul className="space-y-4">
                    {Object.entries(orderStatuses).map(
                      ([status, { icon, text }]) => (
                        <li
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`text-2xl ${orderStatus === status ? "text-green-600" : "text-gray-400"}`}
                          >
                            {icon}
                          </div>
                          <span
                            className={
                              orderStatus === status ? "font-semibold" : ""
                            }
                          >
                            {text}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientPageWrapper>
  );
}
