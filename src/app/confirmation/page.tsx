import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const viewport: Viewport = defaultViewport;

export default function Confirmation() {
  // Dans un cas réel, ces informations proviendraient d'une base de données ou d'un état global
  const orderDetails = {
    orderNumber: "ORD-12345",
    date: new Date().toLocaleDateString(),
    total: 299.99,
    shippingAddress: "123 Rue de la Mode, 13001 Marseille, France",
    billingAddress: "123 Rue de la Mode, 13001 Marseille, France",
    paymentMethod: "Carte de crédit",
    items: [
      { name: "T-shirt Stone Island", quantity: 1, price: 150 },
      { name: "Pantalon CP Company", quantity: 1, price: 149.99 },
    ],
    estimatedDelivery: "3-5 jours ouvrables",
  };

  return (
    <ClientPageWrapper>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <CardTitle className="text-2xl">Commande confirmée</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-lg">
              Merci pour votre commande ! Votre numéro de commande est{" "}
              <strong>{orderDetails.orderNumber}</strong>.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Détails de la commande :</h3>
              <p>Date : {orderDetails.date}</p>
              <p>Total : {orderDetails.total.toFixed(2)} €</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Articles commandés :</h3>
              <ul className="list-disc list-inside space-y-1">
                {orderDetails.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - Quantité : {item.quantity} - Prix :{" "}
                    {item.price.toFixed(2)} €
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adresse de livraison :</h3>
              <p>{orderDetails.shippingAddress}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adresse de facturation :</h3>
              <p>{orderDetails.billingAddress}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Méthode de paiement :</h3>
              <p className="flex items-center">
                <span>&quot;CreditCard&quot;</span>
                {orderDetails.paymentMethod}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <span>🚚</span>
              <p>Livraison estimée : {orderDetails.estimatedDelivery}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Prochaines étapes :</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Vous recevrez un e-mail de confirmation avec les détails de
                  votre commande.
                </li>
                <li>
                  Nous vous enverrons une mise à jour lorsque votre commande
                  sera expédiée.
                </li>
                <li>
                  Vous pouvez suivre l&apos;état de votre commande dans votre
                  compte client.
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center">
                <span>→</span>
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button asChild>
              <Link href="/suivi-commande" className="flex items-center">
                <span>📦</span>
                Suivre ma commande
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ClientPageWrapper>
  );
}
